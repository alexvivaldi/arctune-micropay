# ArcTune

> **SIDE A.** Drop the needle. Before the first bar resolves, a few cents of USDC has already left the listener and arrived — pre-divided — at three different people who touched this song. There is no month-end statement. There is no balance "accruing." The play *is* the payout, and by the time you hear the second bar, the producer has been paid.

This is the sleeve. Below is the honest account of how the record was cut, who gets what, and why it had to be pressed on Arc rather than anywhere else.

**Listen:** https://arctune.vercel.app

---

## Liner notes

I have read too many royalty statements that arrived two quarters late and could not be reconciled by anyone in the room. The recording industry's settled habit is to take a play worth a sliver of a cent, drop it into a giant pool with everyone else's slivers, hold the float, net it against advances and recoupment, and hand you a figure you are expected to trust. The session musician, the co-writer, the person who mixed it at 3 a.m. — their cut is decided in a back-office ledger they will never lay eyes on.

ArcTune is the inversion of that ledger. No pool. No float. No "earnings pending." A single listen triggers a single on-chain payment, and that payment is carved into its agreed pieces inside the very same transaction. The contract does the bookkeeping a label used to do, except it does it in seconds, in public, and it never holds your money overnight.

---

## The split

Registering a track is the same as filling out the back of the sleeve: you name everyone who gets paid and you write down their cut in **basis points** that must add up to exactly `10_000`. The form the app proposes — and the one most sessions actually match — is **70 / 20 / 10**: artist, producer, collaborator. But that's only a suggestion. Two names, five names, an even three-way split, whatever the room agreed to. Drop a beneficiary you don't need and the points just redistribute; the contract only ever sees the list you hand it, and it rejects any list that doesn't sum to a clean hundred percent (`InvalidSharesTotal`).

The division itself lives in one function, `listen(trackId)`. It does four things in order, atomically:

- pulls the play price from the listener via `transferFrom`;
- walks the beneficiary array and credits each share — `amount * shares[i] / TOTAL_BPS` — into `earnedByBeneficiary`;
- sends every non-zero share straight to its recipient with a `transfer`, emitting a `PaymentSplit` per slice;
- sweeps any rounding remainder (a unit or two of integer dust) to the artist so nothing is ever left fossilised in the contract.

The play closes with a `Listened` event carrying the running listen count. Note what is *absent*: no escrow account, no claim screen, no "withdraw" button to remember. The split is the payment. Settlement and distribution are the same motion.

**Why it had to be Arc.** Take a nickel-sized play and cut it 70/20/10 and you are asking the network to move roughly three and a half, one, and half a cent — three separate transfers — every single time someone presses play. Anywhere that charges a meaningful fee per transfer, or makes you wait minutes for finality, the half-cent slice is mathematically smaller than the cost of paying it out. So you do what streaming was *forced* into: pool everything, hold it, and settle once a month. ArcTune only escapes that trap because on Arc the unit being moved and the unit settling the move are the same dollar-denominated USDC, so paying out a half-cent doesn't cost more than a half-cent. That single property is what lets the Royalty Bot distribute live, per play, instead of tallying toward a quarterly statement. Remove it and ArcTune quietly degrades back into the very pooling model it was built to refuse.

---

## Tracklist / how a play pays

Four tracks, in order of play:

1. **`registerTrack(title, metadataURI, listenPrice, beneficiaries[], shares[])`** — the artist puts a track up and names the cut. Pass `0` for `listenPrice` to inherit the contract default; pass shares that don't total `10_000` bps and the call reverts.
2. **Approve once** — the listener grants the MicroTune contract a USDC allowance. A single ordinary ERC-20 approval, not a per-play ritual.
3. **`listen(trackId)`** — press play. The price comes in, the splits go out, all under `nonReentrant` so a play can't claw its way back in mid-distribution.
4. **Read the ledger** — `getEarned(trackId, addr)` for any recipient's running take, `getExpectedSplits(trackId, amount)` to preview the exact carve before paying a cent, `getTrackCount` for the size of the catalog. The track's own `totalListens` and `totalRevenue` tick up with every play.

Price is set to a few cents per listen by design — adjustable per track via `setTrackPrice` (artist or owner) and at the catalog level via `setDefaultPrice` (owner). The rest of the record is just this groove repeated: every play, its own clean payout.

---

## Players & bots

Two pieces of gear are bolted into the page. Both are exactly what they look like — **loops that run in your browser tab**, signing real transactions with your own wallet. Neither is a server, neither is autonomous, and there is no off-chain agent moving money on your behalf.

- **Agent Player.** Hit **Run agent** and it arms a timer: every eight seconds it sounds a short synthesized tone (Web Audio — there are no audio files shipped) and fires `listen()` for the current track, logging each confirmed transaction hash as it lands. It exists so you can *hear* the pay-per-play loop turning over without clicking a hundred times. It's an interval in the page; stop it whenever.
- **Royalty Bot.** It computes the expected cut for one play up front — Artist / Producer / Collaborator with their percentages — then subscribes to the contract's `PaymentSplit` events for that track and streams the **actual** slices as they confirm, each linking out to ArcScan. It reports the ledger; it never holds it.

---

## Pressing details

| | |
|---|---|
| Master | `MicroTune.sol` — Solidity `^0.8.28`, OpenZeppelin `ReentrancyGuard` + `Ownable` |
| Pressed on | Arc testnet, chain id `5042002` |
| Catalogue no. | `0x208a9b35225f3ac671f9e21b9ab14fb953f94c90` |
| Inspect the master | https://testnet.arcscan.app/address/0x208a9b35225f3ac671f9e21b9ab14fb953f94c90 |
| Currency | testnet USDC, 6 decimals — grab some from the Circle faucet |

One contract, one pressing for everyone: artists register tracks, listeners pay to play, and every split is visible on chain. There is no second cut, no private master.

### Cutting your own pressing

```bash
npm install
npm run compile
npm run test:contracts        # the split + dust arithmetic, under test

# local dub
npm run node --workspace=contracts        # terminal A
npm run deploy:local --workspace=contracts # terminal B
npm run dev                                # terminal C — front end on :3000
```

A fresh Arc deploy writes the new address into `contracts/deployments/arctestnet.json`; point `NEXT_PUBLIC_CONTRACT_ADDRESS` at it and rebuild.

---

Cut for the people whose names are set too small to read on the back of the sleeve — the ones who should have been paid the moment you pressed play.

— Alexander Wolfe ([alexvivaldi](https://github.com/alexvivaldi)) · MIT, see [LICENSE](./LICENSE)
