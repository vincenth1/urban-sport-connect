
import { ethers } from 'ethers';

const PUBLIC_RPC_URL = import.meta.env.VITE_PUBLIC_RPC_URL as string | undefined;

export const getProvider = (): ethers.BrowserProvider | ethers.JsonRpcProvider => {
  if (PUBLIC_RPC_URL) {
    return new ethers.JsonRpcProvider(PUBLIC_RPC_URL);
  }
  if (!(window as any).ethereum) throw new Error('MetaMask not found');
  return new ethers.BrowserProvider((window as any).ethereum);
};

export const getSigner = async (): Promise<ethers.Signer> => {
  const provider = getProvider();
  return await provider.getSigner();
};

// NFTCounter + ItemNft
export const NFT_COUNTER_ADDRESS = import.meta.env.VITE_NFT_COUNTER_ADDRESS as string;

const NFT_COUNTER_ABI = [
   { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
   { inputs: [], name: 'getTotalNFTs', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
   { inputs: [], name: 'getNFTContracts', outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }], stateMutability: 'view', type: 'function' },
   { inputs: [{ internalType: 'address', name: 'nftContractAddress', type: 'address' }], name: 'registerNFTContract', outputs: [], stateMutability: 'nonpayable', type: 'function' },
   { inputs: [{ internalType: 'address', name: 'nftContractAddress', type: 'address' }], name: 'removeNFTContract', outputs: [], stateMutability: 'nonpayable', type: 'function' },
   { inputs: [], name: 'registerAsTrainer', outputs: [], stateMutability: 'nonpayable', type: 'function' },
   { inputs: [{ internalType: 'address', name: '', type: 'address' }], name: 'registeredTrainers', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
   { inputs: [], name: 'totalContracts', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
   { inputs: [{ internalType: 'address', name: '', type: 'address' }], name: 'isRegistered', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
   { inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], name: 'nftContracts', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function' }
 ];

const ITEM_NFT_ABI = [
  { inputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'symbol', type: 'string' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'uint256', name: 'rentPrice', type: 'uint256' },
      { internalType: 'uint256', name: 'capacity_', type: 'uint256' }
    ], stateMutability: 'nonpayable', type: 'constructor' },
  { inputs: [{ internalType: 'uint256', name: 'newPrice', type: 'uint256' }], name: 'changeRentPrice', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: '_rentPrice', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }], name: 'ownerOf', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: '_tokenId', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }], name: 'activeRenterCount', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], name: 'capacity', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }, { internalType: 'address', name: 'renter', type: 'address' }], name: 'isActiveRenter', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }, { internalType: 'address', name: 'renter', type: 'address' }], name: 'renterExpires', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }, { internalType: 'string', name: 'name', type: 'string' }, { internalType: 'string', name: 'description', type: 'string' }, { internalType: 'string', name: 'image', type: 'string' }], name: 'setTokenMetadata', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }], name: 'getTokenMetadata', outputs: [{ components: [{ internalType: 'string', name: 'name', type: 'string' }, { internalType: 'string', name: 'description', type: 'string' }, { internalType: 'string', name: 'image', type: 'string' }], internalType: 'struct ItemNft.NFTMetadata', name: '', type: 'tuple' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }, { internalType: 'uint64', name: 'expires', type: 'uint64' }], name: 'rentItem', outputs: [], stateMutability: 'payable', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }], name: 'unrentItem', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }], name: 'burn', outputs: [], stateMutability: 'nonpayable', type: 'function' }
];

export const getNFTCounter = async () => {
  if (!NFT_COUNTER_ADDRESS) throw new Error('VITE_NFT_COUNTER_ADDRESS not set');
  const signer = await getSigner();
  return new ethers.Contract(NFT_COUNTER_ADDRESS, NFT_COUNTER_ABI, signer);
};

export const listAllCourseContracts = async (): Promise<string[]> => {
  const provider = getProvider();
  const counter = new ethers.Contract(NFT_COUNTER_ADDRESS, NFT_COUNTER_ABI, provider);
  return await counter.getNFTContracts();
};

export const getNextCourseNameAndSymbol = async () => {
  const provider = getProvider();
  const counter = new ethers.Contract(NFT_COUNTER_ADDRESS, NFT_COUNTER_ABI, provider);
  const total: bigint = await counter.getTotalNFTs();
  const nextNum = Number(total) + 1;
  const name = `SportsCourse${nextNum}`;
  const symbol = `SC${nextNum}`;
  return { name, symbol };
};

export const getItemNft = async (address: string) => {
  const provider = getProvider();
  return new ethers.Contract(address, ITEM_NFT_ABI, provider);
};

export const deployItemNft = async (params: { name: string; symbol: string; priceEth: string; tokenId?: number; capacity: number }) => {
  const signer = await getSigner();
  const tokenId = params.tokenId ?? 1;
  const rentPriceWei = ethers.parseEther(params.priceEth);
  // Load ABI+bytecode from artifacts path at runtime
  const res = await fetch('/artifacts/contracts/ItemNft.sol/ItemNft.json');
  if (!res.ok) throw new Error('Missing ItemNft artifact. Run `npx hardhat compile`.');
  const artifact = await res.json();
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
  const contract = await factory.deploy(params.name, params.symbol, tokenId, rentPriceWei, BigInt(params.capacity));
  await contract.waitForDeployment();
  return contract.target as string;
};

export const setItemMetadata = async (itemAddress: string, tokenId: number, name: string, description: string, image: string) => {
  const signer = await getSigner();
  const item = new ethers.Contract(itemAddress, ITEM_NFT_ABI, signer);
  const tx = await item.setTokenMetadata(tokenId, name, description, image);
  await tx.wait();
};

export const changeItemPrice = async (itemAddress: string, newPriceEth: string) => {
  const signer = await getSigner();
  const item = new ethers.Contract(itemAddress, ITEM_NFT_ABI, signer);
  const wei = ethers.parseEther(newPriceEth);
  const tx = await item.changeRentPrice(wei);
  await tx.wait();
};

export const registerInCounter = async (itemAddress: string) => {
  const counter = await getNFTCounter();
  const tx = await counter.registerNFTContract(itemAddress);
  await tx.wait();
};

export const removeFromCounter = async (itemAddress: string) => {
  const counter = await getNFTCounter();
  const tx = await counter.removeNFTContract(itemAddress);
  await tx.wait();
};

export const registerAsTrainer = async () => {
  const counter = await getNFTCounter();
  const tx = await counter.registerAsTrainer();
  await tx.wait();
};

export const rentItemForWindow = async (
  itemAddress: string,
  tokenId: number,
  priceEth: string,
  endTimeMs: number
) => {
  const signer = await getSigner();
  const item = new ethers.Contract(itemAddress, ITEM_NFT_ABI, signer);
  const now = Math.floor(Date.now() / 1000);
  const endSeconds = Math.floor(endTimeMs / 1000);
  const expires = Math.max(endSeconds, now); // ensure not earlier than now
  const value = ethers.parseEther(priceEth);
  const tx = await item.rentItem(tokenId, expires, { value });
  await tx.wait();
  return expires * 1000;
};

export const getRentalStatus = async (itemAddress: string, tokenId: number, account: string) => {
  const provider = getProvider();
  const item = new ethers.Contract(itemAddress, ITEM_NFT_ABI, provider);
  const [active, expires] = await Promise.all([
    item.isActiveRenter(tokenId, account),
    item.renterExpires(tokenId, account)
  ]);
  return { user: active ? account : ethers.ZeroAddress, expires: Number(expires) * 1000 };
};

export const burnItemNft = async (itemAddress: string, tokenId: number) => {
  const signer = await getSigner();
  const item = new ethers.Contract(itemAddress, ITEM_NFT_ABI, signer);
  const tx = await item.burn(tokenId);
  await tx.wait();
};

export const unrentItem = async (itemAddress: string, tokenId: number) => {
  const signer = await getSigner();
  const item = new ethers.Contract(itemAddress, ITEM_NFT_ABI, signer);
  const tx = await item.unrentItem(tokenId);
  await tx.wait();
};
