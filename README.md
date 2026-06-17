# ArcTune

<p align="center">
  <img src="frontend/public/logo.svg" alt="ArcTune" width="120" />
</p>

<p align="center">
  <strong>Live site:</strong> <a href="https://arctune.vercel.app">https://arctune.vercel.app</a>
</p>

ArcTune is a USDC micropayment music platform built for **Arc Testnet** (Chain ID `5042002`).

Listeners pay **$0.05 USDC** per stream. The smart contract splits the payment instantly between the artist, producer, and collaborators — no labels, no platform middlemen, no delayed royalties.

- **Agent Player** — simulates listens and automatically sends micropayments.
- **Royalty Bot** — calculates and displays real-time splits for every stream.
- **Wagmi + Viem + RainbowKit** wallet connection.
- **Hardhat + Solidity** smart contracts.

---

## Stack

| Layer | Tech |
|-------|------|
| Smart contracts | Solidity 0.8.28, Hardhat, OpenZeppelin |
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Wagmi, Viem, RainbowKit |
| Testnet | Arc Testnet (EVM-compatible, native USDC gas token) |

---

## Prerequisites

- Node.js >= 20
- npm >= 10
- A wallet with Arc Testnet USDC (get test tokens from the [Arc faucet](https://faucet.circle.com))
- A WalletConnect project ID (free at [cloud.walletconnect.com](https://cloud.walletconnect.com))

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Compile contracts
npm run compile

# 3. Test contracts
npm run test:contracts

# 4. Run local stack
# Terminal A
npm run node --workspace=contracts
# Terminal B
npm run deploy:local --workspace=contracts
# Terminal C
npm run dev
```

The frontend will be at `http://localhost:3000` and the local node at `http://127.0.0.1:8545`.

---

## Deploy to Arc Testnet

### Option A — deploy from the UI (recommended)

1. Open https://arctune.vercel.app.
2. Connect your wallet on Arc Testnet.
3. Click **Deploy MicroTune contract** and sign the transaction.
4. Copy the deployed contract address and set it as `NEXT_PUBLIC_CONTRACT_ADDRESS` in your Vercel env / `frontend/.env.local`.
5. Rebuild / redeploy the frontend.

### Option B — deploy via Hardhat

1. Copy `.env.example` to `.env` in the project root and to `frontend/.env.local`.
2. Fill in your **wallet private key** and **WalletConnect project ID**.
3. Run the deploy script:

```bash
npm run deploy --workspace=contracts
```

4. The script prints the deployed contract address and saves it to `contracts/deployments/arctestnet.json`.
5. Set the contract address as `NEXT_PUBLIC_CONTRACT_ADDRESS`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...your_deployed_address...
NEXT_PUBLIC_USDC_ADDRESS=0x3600000000000000000000000000000000000000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...your_project_id...
```

6. Rebuild the frontend:

```bash
npm run build
```

---

## Verification

```bash
npm run lint
npm run typecheck
npm run compile
npm run test:contracts
npm run test:frontend
npm run build
```

---

## Project structure

```
.
├── contracts/
│   ├── contracts/           # Solidity contracts
│   ├── test/                # Hardhat tests
│   ├── scripts/             # Deploy scripts
│   └── deployments/         # Deployment metadata
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Wagmi hooks
│   │   ├── lib/             # ABI / config
│   │   └── types/           # TypeScript types
│   └── public/
├── .env.example
├── README.md
└── LICENSE
```

---

## License

MIT — see [LICENSE](./LICENSE).

---

Built with 🎸 for musicians who want to get paid directly.
