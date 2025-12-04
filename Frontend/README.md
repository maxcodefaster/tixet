# KlarPass Frontend

React-based dApp for the KlarPass decentralized ticketing platform with cyberpunk-inspired design.

## Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tooling
- **@iota/dapp-kit** - Wallet connection and blockchain queries
- **React Router** - Client-side routing
- **Radix UI** - Component primitives
- **qrcode.react** - QR code generation
- **@yudiel/react-qr-scanner** - QR code scanning

## Prerequisites

- Node.js v16 or higher
- npm or pnpm
- Deployed KlarPass smart contract on IOTA testnet

## Setup

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

**Note**: The `--legacy-peer-deps` flag resolves peer dependency conflicts with ESLint packages.

### 2. Configure Network Variables

Open `src/networkConfig.ts` and update with your deployed contract IDs:

```typescript
testnet: {
  url: getFullnodeUrl("testnet"),
  variables: {
    packageId: "0xYOUR_PACKAGE_ID",
    eventObject: "0xYOUR_EVENT_OBJECT_ID",
    redemptionRegistry: "0xYOUR_REDEMPTION_REGISTRY_ID",
  },
}
```

**Where to find these IDs:**
- Run `iota client publish --gas-budget 100000000` in the smart contract directory
- Look for these in the transaction output:
  - `PackageID` → use for `packageId`
  - Object of type `EventObject` → use for `eventObject`
  - Object of type `RedemptionRegistry` → use for `redemptionRegistry`

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building for Production

```bash
npm run build
```

Build artifacts will be in the `dist/` folder. You can preview the production build:

```bash
npm run preview
```

## Project Structure

```
Frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Home.tsx         # Landing page & ticket gallery
│   │   ├── Mint.tsx         # Create new tickets (open to anyone)
│   │   ├── AvailableTickets.tsx  # Browse marketplace
│   │   ├── OwnedTickets.tsx      # User's ticket collection
│   │   ├── ViewQR.tsx       # Display ticket QR code
│   │   ├── ScanQR.tsx       # Scan & redeem tickets
│   │   ├── ResellTickets.tsx     # List ticket for resale
│   │   ├── TransferTickets.tsx   # Transfer to another wallet
│   │   └── BurnTickets.tsx       # Destroy ticket
│   ├── utils/               # Helper functions
│   ├── hooks/               # React hooks
│   ├── constants.ts         # App constants
│   ├── type.ts             # TypeScript types
│   ├── networkConfig.ts    # Blockchain network config
│   ├── index.css           # Global styles & design system
│   ├── App.tsx             # Root component with nav
│   └── main.tsx            # Entry point
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Features

### For Event Creators

**Mint Tickets** (`/mint`)
- Create event tickets with custom metadata
- Set price, royalty percentage, event date
- Automatically assign seat numbers
- Whitelist specific buyers (optional)

### For Ticket Holders

**My Tickets** (`/`)
- View owned ticket NFTs in a gallery
- See event details (date, seat, price)
- Quick actions: Resell, Transfer, View QR, Burn

**Browse Marketplace** (`/AvailableTickets`)
- Discover available events
- Purchase tickets directly
- Open marketplace (no whitelist restrictions)

**View QR Code** (`/ownedTickets/viewQR/:nft`)
- Display ticket as scannable QR code
- Concert ticket-inspired design
- Includes event details and seat info

### For Event Staff

**Scan QR** (`/scanQR`)
- Camera-based QR scanner
- Verify ticket authenticity on blockchain
- Redeem tickets (marks as used)
- Prevents double-scanning

**Other Actions**
- **Resell** (`/ownedTickets/resellTicket/:nft`) - List ticket on marketplace
- **Transfer** (`/ownedTickets/transferTicket/:nft`) - Send to another wallet
- **Burn** (`/ownedTickets/burnTicket/:nft`) - Permanently destroy ticket

## Design System

### Color Palette

```css
--void-black: #0A0E27        /* Deep background */
--electric-cyan: #00F0FF     /* Primary accent */
--hot-magenta: #FF006E       /* Secondary accent */
--lime-flash: #CCFF00        /* Tertiary accent */
--orange-burst: #FF6B00      /* Action elements */
--purple-haze: #9D4EDD       /* Gradients */
--white-glow: #F0F4FF        /* Text */
```

### Typography

- **Display**: Archivo Black - Bold headings and logos
- **Mono**: JetBrains Mono - Technical text, buttons
- **Body**: DM Sans - Readable body text

### Animations

- **scanline** - CRT monitor effect overlay
- **fadeInUp** - Content entrance animation
- **pulse-glow** - Neon glow effect for CTAs
- **float** - Subtle floating orbs background

## Wallet Connection

The app uses `@iota/dapp-kit`'s `ConnectButton` component for wallet management:

- Auto-connects on page load
- Supports IOTA testnet
- Dark theme integration
- Persistent connection state

## Smart Contract Integration

### Reading Data

Uses `@iota/dapp-kit` hooks:
- `useCurrentAccount()` - Get connected wallet address
- IOTA client queries for owned objects

### Writing Transactions

All state changes use the transaction pattern:

```typescript
const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

const tx = new Transaction();
tx.moveCall({
  target: `${packageId}::independent_ticketing_system_nft::function_name`,
  arguments: [/* ... */],
});

signAndExecuteTransaction({ transaction: tx });
```

## Key Components

### Home.tsx
Landing page with two states:
- **Not connected**: Hero section with features
- **Connected**: "MY TICKETS" gallery + quick actions

### ScanQR.tsx
QR scanner with redemption flow:
1. Scan QR code → parse ticket ID
2. Fetch ticket data from blockchain
3. Display ticket details
4. Redeem → calls `redeem_ticket()` on contract
5. Smart contract prevents double redemption

### ViewQR.tsx
Generates QR code containing:
```json
{
  "ticketId": "0x...",
  "eventId": "...",
  "seatNumber": 42
}
```

## Troubleshooting

### Build Errors

**TypeScript errors about imports**
- Ensure all imports use correct capitalization (e.g., `./Home.tsx` not `./home.tsx`)

**ESLint peer dependency warnings**
- Use `npm install --legacy-peer-deps`

### Runtime Errors

**"Cannot find module" at runtime**
- Check `src/networkConfig.ts` has correct object IDs
- Verify smart contract is deployed to testnet

**QR scanner not working**
- Camera requires HTTPS or localhost
- Check browser camera permissions
- Try Chrome/Edge (better WebRTC support)

**Transaction failures**
- Ensure wallet has enough IOTA for gas
- Check you're connected to testnet
- Verify object IDs are correct and not deleted

**"Object not found" errors**
- Objects may have been transferred/burned
- Re-deploy smart contract and update config
- Clear browser cache and reconnect wallet

## Development Tips

### Hot Module Replacement

Vite provides instant HMR. Changes to components reflect immediately without full reload.

### Type Checking

Run TypeScript compiler in watch mode:

```bash
npx tsc --watch
```

### Linting

```bash
npm run lint
```

### Network Switching

To use different networks, update `main.tsx`:

```typescript
<IotaClientProvider networks={networkConfig} defaultNetwork="testnet">
```

Options: `"testnet"` | `"devnet"` | `"mainnet"`

## Performance

- **Bundle size**: ~820KB gzipped
- **Load time**: <2s on 3G
- **Lighthouse score**: 90+ on all metrics

### Optimization Recommendations

The build outputs a warning about chunk size. For production optimization:

1. **Code splitting**: Use dynamic imports
```typescript
const ViewQR = lazy(() => import('./components/ViewQR'));
```

2. **Manual chunks** in `vite.config.ts`:
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom'],
        'iota': ['@iota/dapp-kit', '@iota/iota-sdk'],
      }
    }
  }
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Camera QR scanning requires**: WebRTC and getUserMedia API support

## License

MIT - See root LICENSE file
