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

## Contract

The live MicroTune contract is deployed once on Arc Testnet and shared by all users:

```text
NEXT_PUBLIC_CONTRACT_ADDRESS=0x208A9b35225F3aC671F9e21B9ab14FB953F94c90
NEXT_PUBLIC_USDC_ADDRESS=0x3600000000000000000000000000000000000000
```

Everyone connects to the same contract. Artists register tracks, listeners stream, and the contract splits USDC instantly.

### Deploy a new contract via Hardhat (owner only)

If you ever need a fresh contract, use the Hardhat script:

```bash
# 1. Copy .env.example to .env and frontend/.env.local
# 2. Fill in ARC_PRIVATE_KEY and NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
# 3. Run the deploy script
npm run deploy --workspace=contracts
```

The deployed address is saved to `contracts/deployments/arctestnet.json`. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in your Vercel env and `frontend/.env.local`, then rebuild.

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
