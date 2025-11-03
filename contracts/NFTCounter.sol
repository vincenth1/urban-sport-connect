// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NFTCounter {
    // Trainer registration
    mapping(address => bool) public registeredTrainers;

    // Simple registry - no secret needed
    uint256 public totalContracts;
    mapping(address => bool) public isRegistered;
    address[] public nftContracts;

    constructor() {
        // No parameters needed
    }

    //#####################################################################
    // Trainer registration
    //#####################################################################
    function registerAsTrainer() external {
        registeredTrainers[msg.sender] = true;
    }

    //#####################################################################
    // Register a contract - only registered trainers can register contracts
    //#####################################################################
    function registerNFTContract(
        address nftContractAddress
    ) external {
        // Only registered trainers can register contracts
        require(registeredTrainers[msg.sender], "Only registered trainers can register contracts");
        require(!isRegistered[nftContractAddress], "Contract already registered");

        // Register contract
        totalContracts++;
        isRegistered[nftContractAddress] = true;
        nftContracts.push(nftContractAddress);
    }

    //#####################################################################
    // Return contracts
    //#####################################################################

    // return number of all registered contracts
    function getTotalNFTs() external view returns (uint256) {
        return totalContracts;
    }

    // return addresses of all registered contracts
    function getNFTContracts() external view returns (address[] memory) {
        return nftContracts;
    }

    //#####################################################################
    // Remove a contract from registry (for deletion) - only registered trainers
    //#####################################################################
    function removeNFTContract(address nftContractAddress) external {
        // Only registered trainers can remove contracts
        require(registeredTrainers[msg.sender], "Only registered trainers can remove contracts");
        require(isRegistered[nftContractAddress], "Contract not registered");

        // Remove from registered mapping
        isRegistered[nftContractAddress] = false;

        // Remove from array (swap with last and pop)
        for (uint256 i = 0; i < nftContracts.length; i++) {
            if (nftContracts[i] == nftContractAddress) {
                nftContracts[i] = nftContracts[nftContracts.length - 1];
                nftContracts.pop();
                break;
            }
        }

        // Decrease count
        totalContracts--;
    }
}