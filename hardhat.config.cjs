require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia";
const SONIC_TESTNET_RPC_URL = process.env.SONIC_TESTNET_RPC_URL;


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    sonic: {
      url: SONIC_TESTNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 14601,
    }
  },
};