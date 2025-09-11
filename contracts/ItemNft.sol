// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC4907.sol";

contract ItemNft is ERC4907, Ownable {
    using EnumerableMap for EnumerableMap.UintToAddressMap;

    mapping(uint256 => NFTMetadata) private _tokenMetadata;
    EnumerableMap.UintToAddressMap private _tokenApprovals;

    uint256 public _rentPrice; // item/service price
    uint public _tokenId;

    event RentPayment(
        address indexed renter,
        uint256 indexed tokenId,
        uint64 expires,
        uint256 price
    );

    constructor(
        string memory name,
        string memory symbol,
        uint256 tokenId,
        uint256 rentPrice
    ) Ownable(_msgSender()) ERC4907(name, symbol) {
        _mint(_msgSender(), tokenId); // no need for minter input, because only owner can mint
        approve(_msgSender(), tokenId); // approve owner of the contract so he can assign users
        _rentPrice = rentPrice; // init the item with a price
        _tokenId = tokenId;
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
    // receive payment + withdraw
    //#####################################################################

    // Function to rent an unique item by paying ethers
    function rentItem(uint256 tokenId, uint64 expires) external payable {
        require(msg.value == _rentPrice, "Incorrect payment amount");
        require(
            userOf(tokenId) == address(0),
            "Someone is already renting this service"
        );
        require(
            expires > block.timestamp,
            "Choose a renting time in the future"
        );

        safeSetUser(tokenId, msg.sender, expires);
        // Emit event for logging
        emit RentPayment(msg.sender, tokenId, expires, msg.value);
    }

    //#####################################################################
    // rent price management
    //#####################################################################
    function changeRentPrice(uint256 newPrice) external onlyOwner {
        _rentPrice = newPrice;
    }
}