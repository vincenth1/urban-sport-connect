// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NFTCounter {
    struct NFTInfo {
        uint256 count; // count registered contracts (total)
        mapping(address => bool) isRegistered; // registered contracts (only possible to register with secret string)
        address[] nftContracts; // array of registered contracts
        mapping(address => bool) createdBySender; // Mapping to track contracts created by a specific sender
    }

    bytes32 public immutable secretHash;

    mapping(bytes32 => NFTInfo) private _nftContracts; // Mapping from secret hash to NFTInfo

    constructor(bytes32 _hash) {
        secretHash = _hash; // set the secret hash
    }

    //#####################################################################
    // Register a contract, only possible if you know the secret
    // give a contract address because the function call will be from a wallet and not from a ItemNFt contract itself
    //#####################################################################
    function registerNFTContract(
        address nftContractAddress,
        string memory secret
    ) external {
        bytes32 secretHashComputed = keccak256(abi.encodePacked(secret));
        require(secretHashComputed == secretHash, "Unauthorized");
        require(
            !_nftContracts[secretHashComputed].isRegistered[nftContractAddress],
            "Contract already registered"
        );

        // Keeps track of how many NFT contracts are registered under the specific secretHashComputed
        _nftContracts[secretHashComputed].count++;
        // Marks whether a particular NFT contract (nftContract) is already registered under secretHashComputed
        _nftContracts[secretHashComputed].isRegistered[
            nftContractAddress
        ] = true;
        // Stores the address of each registered NFT contract in an array
        _nftContracts[secretHashComputed].nftContracts.push(nftContractAddress);

        // Track contracts created by the sender
        _nftContracts[secretHashComputed].createdBySender[
            nftContractAddress
        ] = true;
    }

    //#####################################################################
    // Return contracts
    //#####################################################################

    // return number of all registered contracts
    function getTotalNFTs() external view returns (uint256) {
        return _nftContracts[secretHash].count;
    }

    // return addresses of all registered contracts
    function getNFTContracts() external view returns (address[] memory) {
        return _nftContracts[secretHash].nftContracts;
    }

    //#####################################################################
    // Remove a contract from registry (for deletion)
    //#####################################################################
    function removeNFTContract(address nftContractAddress, string memory secret) external {
        bytes32 secretHashComputed = keccak256(abi.encodePacked(secret));
        require(secretHashComputed == secretHash, "Unauthorized");
        require(
            _nftContracts[secretHashComputed].isRegistered[nftContractAddress],
            "Contract not registered"
        );

        // Remove from registered mapping
        _nftContracts[secretHashComputed].isRegistered[nftContractAddress] = false;

        // Remove from array (swap with last and pop)
        address[] storage contracts = _nftContracts[secretHashComputed].nftContracts;
        for (uint256 i = 0; i < contracts.length; i++) {
            if (contracts[i] == nftContractAddress) {
                contracts[i] = contracts[contracts.length - 1];
                contracts.pop();
                break;
            }
        }

        // Decrease count
        _nftContracts[secretHashComputed].count--;

        // Remove from createdBySender mapping
        delete _nftContracts[secretHashComputed].createdBySender[nftContractAddress];
    }
}