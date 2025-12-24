# Urban Sport Connect – Web3 DApp

Urban Sport Connect is a decentralized app where trainers create time-limited course NFTs and users book them with temporary access. It uses ERC‑4907 (user + expiry) so bookings expire automatically.

## Features

- Wallet connect via MetaMask
- Trainers register and create courses
- Each course is its own `ItemNft` contract; contracts are registered in `NFTCounter`
- Course metadata (title, description, image, location, etc.) pinned to IPFS via Pinata
- Users browse all courses (read from `NFTCounter`) and book them
- Booking grants temporary access using ERC‑4907 `rentItem(tokenId, expires)`

## Prerequisites

- Node 18+
- MetaMask in your browser
- Pinata API key/secret
- A running EVM-compatible blockchain network (e.g., local Hardhat node, Sepolia testnet, Sonic testnet, or any Ethereum-compatible network)

## Environment Variables

Rename `.env-example` to `.env` and fill in your values.

Required variables:

```
# ---------- Frontend (Vite) ----------
VITE_NFT_COUNTER_ADDRESS=0xYourNFTCounterAddress # will be updated automatically
VITE_PINATA_PROXY_BASE=http://localhost:3001/pinata
VITE_PUBLIC_RPC_URL=https://sonic-testnet.publicnode.com

# ---------- Backend Proxy ----------
REACT_APP_PINATA_API_KEY=your-pinata-api-key
REACT_APP_PINATA_SECRET_KEY=your-pinata-secret-key
```

For deployment to testnets, also set:

```
PRIVATE_KEY=your-private-key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
SONIC_TESTNET_RPC_URL=https://rpc.testnet.soniclabs.com
```

Notes:
- `VITE_NFT_COUNTER_ADDRESS` is the deployed `NFTCounter` address.

## Contracts Overview

- `contracts/ItemNft.sol`: ERC‑4907-based NFT contract for individual courses. Each course gets its own ItemNft instance with tokenId=1. Stores course metadata (name, description, image via IPFS), rent price, capacity for multiple simultaneous bookings, and implements `rentItem` for temporary access rights with customizable expiry times. Each contract is owned by the trainer who created it.
- `contracts/NFTCounter.sol`: Central registry contract that maintains a list of all deployed course contracts. Only registered trainers can add their course contracts to the registry, preventing unauthorized contract registration while allowing O(1) retrieval of all contract addresses. Trainers must first register themselves using `registerAsTrainer()` before they can register courses (callable via the frontend UI).

## Pre-configured Networks

The project is configured for these networks:

- **Sepolia** (chainId: 11155111) - Ethereum testnet
- **Sonic** (chainId: 14601) - Sonic testnet

## Deploy NFTCounter

Compile contracts and deploy the counter once:

```
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
# or
npx hardhat run scripts/deploy.js --network sonic
```

After deployment, the printed contract address gets automatically copies to `VITE_NFT_COUNTER_ADDRESS` in your `.env` file. The console shows e.g.

```
NFTCounter deployed: 0x4F30d24733c5e067535699823DC7B512fCAbA0ac
Updated .env VITE_NFT_COUNTER_ADDRESS
```

## Run the Pinata Proxy

```
cd backend-proxy
node server.js
```

Alternatively, you can run both the proxy and frontend simultaneously with (recommended):

```
npm run dev:all
```

The frontend will post to `VITE_PINATA_PROXY_BASE` (defaults to `http://localhost:3001/pinata`). The proxy injects your Pinata API credentials.
Make sure this proxy is running when creating or editing courses or your trainer profile.

## Start the App

```
npm install
npm run dev:all  # Recommended: runs both frontend and Pinata proxy
```

Or run them separately:

```
npm run proxy    # Start Pinata proxy in background
npm run dev      # Start frontend
```

Open the app, connect MetaMask, and switch to your target network.

## Using the DApp

1) Register as Trainer
- Go to Profile and fill out trainer details. This registers you as a trainer on-chain and flags your account as trainer in the app.
- Your trainer profile (name, bio, avatar) is uploaded to IPFS and stored in localStorage for quick loading.
<img width="1919" height="967" alt="s1" src="https://github.com/user-attachments/assets/49c23fc7-571c-4e6e-a1e5-b7b0dcfc4a1c" />

2) Create a Course
- Navigate to Create Course.
- Enter title, description, price (ETH), capacity, sport type/category, location, image, and a start and end time.
- On submit, the app:
  - Pins metadata to IPFS via Pinata
  - Auto-generates a name/symbol like `SportsCourseX` / `SCX` based on `NFTCounter` count
  - Deploys a new `ItemNft` via MetaMask
  - Sets token metadata on-chain (image field stores the ipfs:// URI so the app can fetch the full JSON)
  - Registers the contract in `NFTCounter` (only registered trainers can register contracts)
<img width="1919" height="968" alt="s22" src="https://github.com/user-attachments/assets/40f76db6-bf4a-4926-940d-d7710f3be36f" />

3) Browse Courses
- Courses are listed by fetching all registered `ItemNft` contracts from `NFTCounter`, reading each contract’s metadata and rent price.
- If the on-chain metadata points to an `ipfs://...`, the app fetches and displays the richer JSON from IPFS.
<img width="1919" height="965" alt="s33" src="https://github.com/user-attachments/assets/08a2270d-b352-4225-b246-4c392c9392e0" />

4) Book a Course
- Click "Book Course" and have the needed funds in your wallet (for Sonic Testnet the according tokens).
- Confirm the MetaMask transaction to complete the booking with the chosen expiry time.
<img width="1919" height="969" alt="s4" src="https://github.com/user-attachments/assets/1c656212-7044-4475-bb92-21e87a98858b" />

5) Edit Trainer Profile and Courses
- Trainer Profile (Profile → Trainer tab):
  - Edit name, bio, avatar and Save. Changes are uploaded to IPFS and loaded from localStorage on reload.
- Edit a Course (Profile → Trainer tab):
  - For each course, change meta data like title, description, image, price and Save.
  - The app uploads new metadata JSON to IPFS, updates on-chain metadata to the new IPFS URI, and changes price on-chain.
  - After saving, the page refreshes autmatically.

## Configuration Notes
- Metadata storage: JSON pinned to Pinata via backend proxy.
- Each course is isolated in its own `ItemNft` contract; the registry makes discovery simple and O(1) to fetch all contract addresses since the NFTCounter contract stores them in a pre-computed array that can be returned directly without iteration or computation.

## Scripts

- `scripts/deploy.js`: Deploys `NFTCounter` using `REACT_APP_SECRET`.
