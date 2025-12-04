# KlarPass - Decentralized Event Ticketing

A blockchain-based ticketing platform built on IOTA that eliminates middlemen and puts control back in the hands of event creators and attendees.

## Features

- **NFT Tickets**: Each ticket is a unique blockchain asset you truly own
- **QR Code Redemption**: Easy-to-scan QR codes verified on-chain, impossible to counterfeit
- **Open Marketplace**: Anyone can create events and buy/resell tickets without platform restrictions
- **Anti-Double-Redemption**: Smart contract prevents tickets from being scanned multiple times
- **Zero Platform Fees**: Direct peer-to-peer transactions between creators and fans

## Project Structure

```
klarpass/
├── independent_ticketing_system/          # Move smart contracts
│   ├── sources/
│   │   └── independent_ticketing_system.move
│   ├── tests/
│   │   └── independent_ticketing_system_test.move
│   ├── Move.toml
│   └── Frontend/                          # React dApp
│       ├── src/
│       ├── package.json
│       └── README.md
```

## Prerequisites

- [IOTA CLI](https://docs.iota.org/developer/getting-started/install-iota) installed
- [Node.js](https://nodejs.org/) v16+ and npm
- IOTA wallet (for devnet interaction)

## Quick Start

### 1. Set Up Your IOTA Wallet

First, configure your IOTA client and generate a wallet address:

```bash
iota client
```

When prompted:
- Select network: `devnet`
- Select key scheme: `0` (for ed25519)

This will generate a new wallet address and save your secret recovery phrase.

**Get Devnet Tokens**

Request test tokens from the faucet using your wallet address:

```bash
iota client faucet --address YOUR_WALLET_ADDRESS
```

Or use the web faucet (check IOTA documentation for the current faucet URL).

Verify you received tokens:

```bash
iota client gas
```

### 2. Build and Deploy Smart Contract

Navigate to the smart contract directory:

```bash
cd independent_ticketing_system
```

Build the Move package:

```bash
iota move build
```

Run tests to verify everything works:

```bash
iota move test
```

Publish to IOTA devnet:

```bash
iota client publish --gas-budget 100000000
```

**Important**: After publishing, save these object IDs from the output:
- `PackageID`: The deployed package address
- `EventObject`: The shared event object
- `RedemptionRegistry`: The shared redemption registry

### 3. Configure Frontend

Navigate to the frontend directory:

```bash
cd Frontend
```

Open `src/networkConfig.ts` and replace the placeholders:

```typescript
devnet: {
  url: getFullnodeUrl("devnet"),
  variables: {
    packageId: "YOUR_PACKAGE_ID_HERE",
    eventObject: "YOUR_EVENTOBJECT_ADDRESS_HERE",
    redemptionRegistry: "YOUR_REDEMPTION_REGISTRY_ADDRESS_HERE",
  },
}
```

### 4. Install Frontend Dependencies

```bash
npm install --legacy-peer-deps
```

### 5. Run the dApp

Start the development server:

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

## Usage Guide

### For Event Creators

1. Connect your wallet
2. Click **"✨ Create"** to access the mint tickets page
3. Fill in event details (ID, date, price, royalty %)
4. Mint tickets to create NFTs for your event

### For Attendees

1. Connect your wallet
2. Click **"🎫 Browse Tickets"** to see available events
3. Purchase tickets (they appear as NFTs in your wallet)
4. Click ticket to view QR code for event entry

### For Event Staff

1. Connect your wallet
2. Click **"📷 Scan QR"**
3. Scan attendee QR codes
4. Smart contract verifies and marks as redeemed (prevents re-entry)

## How It Works

### Smart Contract Architecture

- **TicketNFT**: Unique NFT for each ticket with event metadata
- **EventObject**: Shared object storing available tickets for sale
- **RedemptionRegistry**: Shared table tracking redeemed tickets
- **Open Marketplace**: Anyone can create events and mint tickets without special permissions

### Key Innovation: Redemption Without Ownership

Traditional blockchain approach would require the scanner to own the ticket to modify it. Our `RedemptionRegistry` pattern solves this:

- Tickets remain owned by holders (can keep as souvenir)
- Redemption data stored in separate shared registry
- Scanner reads ticket (`&TicketNFT`) and writes to registry (`&mut RedemptionRegistry`)
- Table lookup prevents double redemption

## Development

### Build for Production

```bash
cd independent_ticketing_system/Frontend
npm run build
```

Output will be in the `dist/` folder.

### Run Tests

Smart contract tests:

```bash
cd independent_ticketing_system
iota move test
```

## Tech Stack

### Smart Contract
- **Move Language**: IOTA's safe smart contract language
- **IOTA SDK**: Blockchain interaction layer

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **@iota/dapp-kit**: Wallet connection and blockchain queries
- **qrcode.react**: QR code generation
- **@yudiel/react-qr-scanner**: QR scanning functionality
- **React Router**: Client-side routing

### Design System
- **Fonts**: Archivo Black, JetBrains Mono, DM Sans
- **Colors**: Electric Cyan, Hot Magenta, Lime Flash, Orange Burst
- **Animations**: CSS-only (scanline, fade-in-up, pulse-glow)

## Security Features

- **Move's Ownership Model**: Prevents unauthorized ticket modifications
- **On-chain Verification**: All redemptions recorded immutably on blockchain
- **Double-Redemption Prevention**: Table-based tracking ensures tickets can't be reused
- **Whitelist Support**: Optional buyer whitelisting for exclusive events

## Troubleshooting

### "Cannot find gas coin for signer address" error
Your wallet needs test tokens. Request them from the faucet:
```bash
iota client faucet --address YOUR_WALLET_ADDRESS
```
Then verify: `iota client gas`

### "Module not found" errors
Run `npm install --legacy-peer-deps` to resolve peer dependency conflicts.

### Transaction fails with "insufficient gas"
Increase gas budget: `--gas-budget 100000000`

### QR scanner not working
Ensure you're using HTTPS or localhost (camera requires secure context).

### "Object not found" errors
Verify you've updated `networkConfig.ts` with the correct deployed object IDs.

## Contributing

This is a university project POC demonstrating decentralized ticketing concepts.

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built using IOTA's Move language and dApp Kit. Inspired by the need for fairer, more transparent ticketing systems.
