require("dotenv").config();
const { ethers } = require('hardhat');

async function main() {
  const NFT_COUNTER_ADDRESS = process.env.REACT_APP_NFT_COUNTER_ADDRESS;
  const SECRET_STRING = process.env.REACT_APP_SECRET;
  if (!NFT_COUNTER_ADDRESS) throw new Error('REACT_APP_NFT_COUNTER_ADDRESS missing');
  if (!SECRET_STRING) throw new Error('REACT_APP_SECRET missing');

  // Deploy a new ItemNft representing a single course. For simplicity, use tokenId=1 and pass initial rent price.
  const name = process.env.REACT_APP_ITEM_NAME || 'CourseItem';
  const symbol = process.env.REACT_APP_ITEM_SYMBOL || 'CITEM';
  const tokenId = 1;
  const rentPriceWei = ethers.utils.parseEther(process.env.REACT_APP_ITEM_PRICE_ETH || '0.05');

  const ItemNft = await ethers.getContractFactory('ItemNft');
  const item = await ItemNft.deploy(name, symbol, tokenId, rentPriceWei);
  await item.deployed();
  console.log('ItemNft deployed:', item.address);

  // Register the new ItemNft in NFTCounter using the secret
  const NFTCounter = await ethers.getContractAt('NFTCounter', NFT_COUNTER_ADDRESS);
  const tx = await NFTCounter.registerNFTContract(item.address, SECRET_STRING);
  await tx.wait();
  console.log('Registered in NFTCounter:', NFT_COUNTER_ADDRESS);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});


