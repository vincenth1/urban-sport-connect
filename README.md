# Urban Sport Connect – Web3 DApp

Urban Sport Connect is a decentralized app where trainers create time-limited course NFTs and users book them with temporary access. It uses ERC‑4907 (user + expiry) so bookings expire automatically (default: 5 minutes; adjustable).

## Features

- Wallet connect via MetaMask (ethers v6)
- Trainers register and create courses
- Each course is its own `ItemNft` contract; contracts are registered in `NFTCounter`
- Course metadata (title, description, image, location, etc.) pinned to IPFS via Pinata
- Users browse all courses (read from `NFTCounter`) and book them
- Booking grants temporary access using ERC‑4907 `rentItem(tokenId, expires)`

## Prerequisites

- Node 18+
- MetaMask in your browser
- Pinata API key/secret
- A running EVM network (Hardhat, Sepolia, etc.)

## Environment Variables

Create a `.env` file at project root with:

```
# ---------- Frontend (Vite) ----------
VITE_NFT_COUNTER_ADDRESS=0xYourNFTCounterAddress
VITE_SECRET=your-secret-string
VITE_PINATA_PROXY_BASE=http://localhost:3001/pinata
VITE_PUBLIC_RPC_URL=https://sonic-testnet.publicnode.com

# ---------- Backend Proxy ----------
REACT_APP_PINATA_API_KEY=your-pinata-api-key
REACT_APP_PINATA_SECRET_KEY=your-pinata-secret-key

# ---------- Hardhat (deploy NFTCounter) ----------
REACT_APP_SECRET=your-secret-string
```

Notes:
- `VITE_SECRET` must match `REACT_APP_SECRET` used when deploying `NFTCounter`.
- `VITE_NFT_COUNTER_ADDRESS` is the deployed `NFTCounter` address.

## Contracts Overview

- `contracts/ItemNft.sol`: ERC‑4907-based NFT. One instance per course, tokenId=1, holds metadata and rent price, and implements `rentItem` for temporary user rights.
- `contracts/NFTCounter.sol`: Registry of course contracts; used to list all courses and register new ones using a shared secret.

## Deploy NFTCounter

Compile contracts and deploy the counter once:

```
npx hardhat compile
npx hardhat run scripts/deploy.js --network <network>
```

Copy the printed address into `VITE_NFT_COUNTER_ADDRESS` and keep the same secret in both `REACT_APP_SECRET` and `VITE_SECRET`.

## Run the Pinata Proxy

```
cd backend-proxy
node server.js
```

The frontend will post to `VITE_PINATA_PROXY_BASE` (defaults to `http://localhost:3001/pinata`). The proxy injects your Pinata API credentials.
Make sure this proxy is running when creating or editing courses or your trainer profile.

## Start the App

```
npm install
npm run dev
```

Open the app, connect MetaMask, and switch to your target network.

## Using the DApp

1) Register as Trainer
- Go to Profile and fill out trainer details. This flags your account as trainer in the app.
- Your trainer profile (name, bio, avatar) is uploaded to IPFS and stored in localStorage for quick hydration.

2) Create a Course
- Navigate to Create Course.
- Enter title, description, image URL, price (ETH), sport type, and location.
- On submit, the app:
  - Pins metadata to IPFS via Pinata
  - Auto-generates a name/symbol like `SportsCourseX` / `SCX` based on `NFTCounter` count
  - Deploys a new `ItemNft` via MetaMask
  - Sets token metadata on-chain (image field stores the ipfs:// URI so the app can fetch the full JSON)
  - Registers the contract in `NFTCounter` using your `VITE_SECRET`

3) Browse Courses
- Courses are listed by fetching all registered `ItemNft` contracts from `NFTCounter`, reading each contract’s metadata and rent price.
- If the on-chain metadata points to an `ipfs://...`, the app fetches and displays the richer JSON from IPFS.

4) Book a Course
- Click “Book Course” and confirm the MetaMask transaction.
- Booking sets `user` with expiry = now + 5 minutes. You can change this duration in code where `rentItem` is called.

5) Edit Trainer Profile and Courses
- Trainer Profile (Profile → Trainer tab):
  - Edit name, bio, avatar and Save. Changes are uploaded to IPFS and hydrated from localStorage on reload.
- Edit a Course (Profile → Trainer tab):
  - For each course, change title/description/image/price and Save.
  - The app uploads new metadata JSON to IPFS, updates on-chain metadata to the new IPFS URI, and changes price on-chain.
  - After saving, refresh the page if the listing doesn’t reflect immediately.

## Configuration Notes

- Booking window: 5 minutes (changeable in `rentItemForFiveMinutes` in `src/utils/contracts.ts`).
- Metadata storage: JSON pinned to Pinata via backend proxy.
- Each course is isolated in its own `ItemNft` contract; the registry makes discovery simple and O(1) to fetch all contract addresses.

## Scripts

- `scripts/deploy.js`: Deploys `NFTCounter` using `REACT_APP_SECRET`.

## Security & Production

- Keep your Pinata keys safe. Production should run the proxy in a protected environment.
- Consider role/ACL for trainer registration on-chain if you later want on-chain verification.

## Screenshots

Below are example views. Replace the placeholder with your own screenshots under `public/screenshots/` and update the paths as needed.

### Home / Courses
![Home](public/placeholder.svg)

### Profile – User (Booked Courses)
![Profile User](public/placeholder.svg)

### Profile – Trainer (Edit Profile & Courses)
![Profile Trainer](public/placeholder.svg)

Tips for capturing:
- Use a desktop width around 1280px for consistent layout.
- Obscure wallet addresses if sharing publicly.
