require("dotenv").config();
const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  // Deploy NFTCounter (no secret needed)
  const NFTCounter = await ethers.getContractFactory("NFTCounter");
  const nftCounter = await NFTCounter.deploy();
  await nftCounter.waitForDeployment();
  const address = await nftCounter.getAddress();
  console.log("NFTCounter deployed:", address);

  // Update .env with VITE_NFT_COUNTER_ADDRESS
  try {
    const envPath = path.resolve(__dirname, '..', '.env');
    let content = '';
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf8');
    }
    if (content.includes('VITE_NFT_COUNTER_ADDRESS=')) {
      content = content.replace(/VITE_NFT_COUNTER_ADDRESS=.*/g, `VITE_NFT_COUNTER_ADDRESS=${address}`);
    } else {
      if (content && !content.endsWith('\n')) content += '\n';
      content += `VITE_NFT_COUNTER_ADDRESS=${address}\n`;
    }
    fs.writeFileSync(envPath, content, 'utf8');
    console.log('Updated .env VITE_NFT_COUNTER_ADDRESS');
  } catch (e) {
    console.warn('Failed to update .env automatically. Please set VITE_NFT_COUNTER_ADDRESS manually.', e);
  }
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});