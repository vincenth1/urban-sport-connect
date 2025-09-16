// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./ERC4907.sol";

contract ItemNft is ERC4907, Ownable {
    using EnumerableMap for EnumerableMap.UintToAddressMap;
    using EnumerableSet for EnumerableSet.AddressSet;

    mapping(uint256 => NFTMetadata) private _tokenMetadata;
    EnumerableMap.UintToAddressMap private _tokenApprovals;

    uint256 public _rentPrice; // item/service price
    uint public _tokenId;

    // Multi-renter state
    mapping(uint256 => uint256) public capacity;
    mapping(uint256 => EnumerableSet.AddressSet) private _renters;
    mapping(uint256 => mapping(address => uint64)) private _renterExpires;
    mapping(uint256 => uint256) private _activeCount; // O(1) active count
    mapping(uint256 => uint256) private _scanCursor;  // bounded cleanup cursor

    event RentPayment(
        address indexed renter,
        uint256 indexed tokenId,
        uint64 expires,
        uint256 price
    );

    event MultiUnrent(
        address indexed renter,
        uint256 indexed tokenId
    );

    constructor(
        string memory name,
        string memory symbol,
        uint256 tokenId,
        uint256 rentPrice,
        uint256 capacity_
    ) Ownable(_msgSender()) ERC4907(name, symbol) {
        _mint(_msgSender(), tokenId); // no need for minter input, because only owner can mint
        approve(_msgSender(), tokenId); // approve owner of the contract so he can assign users
        _rentPrice = rentPrice; // init the item with a price
        _tokenId = tokenId;
        capacity[tokenId] = capacity_ > 0 ? capacity_ : 1;
    }

    struct NFTMetadata {
        string name;
        string description;
        string image; // IPFS URL
    }

    //#####################################################################
    // ERC-721 NFT meta data stuff
    //#####################################################################
    // set token meta data if token exists and is not burned
    function setTokenMetadata(
        uint256 tokenId,
        string memory name,
        string memory description,
        string memory image
    ) external onlyOwner {
        // only owner can set meta data
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _tokenMetadata[tokenId] = NFTMetadata(name, description, image);
    }

    // return token meta data if token exists and is not burned
    function getTokenMetadata(
        uint256 tokenId
    ) external view returns (NFTMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenMetadata[tokenId];
    }

    //#####################################################################
    // Multi-renter helpers
    //#####################################################################
    function setCapacity(uint256 tokenId, uint256 newCapacity) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        capacity[tokenId] = newCapacity;
    }

    function isActiveRenter(uint256 tokenId, address renter) public view returns (bool) {
        return _renterExpires[tokenId][renter] > block.timestamp;
    }

    function renterExpires(uint256 tokenId, address renter) external view returns (uint256) {
        return _renterExpires[tokenId][renter];
    }

    function activeRenterCount(uint256 tokenId) public view returns (uint256) {
        return _activeCount[tokenId];
    }

    function _purgeExpiredBounded(uint256 tokenId, uint256 limit) internal {
        EnumerableSet.AddressSet storage set = _renters[tokenId];
        uint256 len = set.length();
        if (len == 0 || limit == 0) return;
        uint256 cursor = _scanCursor[tokenId];
        uint256 checked;
        while (checked < limit && len > 0) {
            uint256 idx = cursor % len;
            address r = set.at(idx);
            if (_renterExpires[tokenId][r] <= block.timestamp) {
                set.remove(r);
                delete _renterExpires[tokenId][r];
                if (_activeCount[tokenId] > 0) {
                    unchecked { _activeCount[tokenId]--; }
                }
                emit MultiUnrent(r, tokenId);
                len = set.length();
                // do not advance cursor here; current idx now has a new element
            } else {
                unchecked { cursor++; checked++; }
            }
        }
        _scanCursor[tokenId] = (len == 0) ? 0 : (cursor % len);
    }

    //#####################################################################
    // receive payment + multi-rent
    //#####################################################################
    function rentItem(uint256 tokenId, uint64 expires) external payable {
        require(msg.value == _rentPrice, "Incorrect payment amount");
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(expires > block.timestamp, "Choose a renting time in the future");
        require(msg.sender != owner(), "Owner cannot rent");

        _purgeExpiredBounded(tokenId, 8); // bounded cleanup for gas safety

        bool wasActive = _renterExpires[tokenId][msg.sender] > block.timestamp;
        require(wasActive || _activeCount[tokenId] < capacity[tokenId], "Capacity reached");

        _renterExpires[tokenId][msg.sender] = expires;
        if (!wasActive) {
            _renters[tokenId].add(msg.sender);
            unchecked { _activeCount[tokenId]++; }
        }
        emit RentPayment(msg.sender, tokenId, expires, msg.value);
    }

    //#####################################################################
    // rent price management
    //#####################################################################
    function changeRentPrice(uint256 newPrice) external onlyOwner {
        _rentPrice = newPrice;
    }

    //#####################################################################
    // Withdraw funds - only contract owner (same as NFT deployer/owner)
    //#####################################################################
    function withdraw() external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "No funds");
        (bool ok, ) = payable(owner()).call{value: bal}("");
        require(ok, "Withdraw failed");
    }

    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}