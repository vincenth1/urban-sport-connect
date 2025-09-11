const { ethers } = require('ethers');
require("dotenv").config();

const REACT_APP_SECRET = process.env.REACT_APP_SECRET;

async function main() {
    // Check if SECRET is properly loaded
    if (!REACT_APP_SECRET) {
        console.error("SECRET environment variable is not defined.");
        return;
    }

    // Accessing toUtf8Bytes from ethers.utils
    const { keccak256, toUtf8Bytes } = ethers.utils;

    // Calculate hash
    const secretHash = keccak256(toUtf8Bytes(REACT_APP_SECRET));

    console.log("Secret Hash (off-chain):", secretHash);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});