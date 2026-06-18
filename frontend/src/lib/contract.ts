import type { Abi } from "viem";
import { getAddress } from "viem";
import artifact from "@/abis/MicroTune.json";
import { ERC20_ABI as erc20Abi } from "@/lib/erc20";

export const MICROTUNE_ABI = (artifact as { abi: Abi }).abi;
export const MICROTUNE_BYTECODE = (artifact as { bytecode: `0x${string}` }).bytecode;
export const ERC20_ABI = erc20Abi;

export function getMicroTuneAddress(): `0x${string}` | null {
  const addr = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.trim();
  if (!addr) return null;
  return addr as `0x${string}`;
}

export function isMicroTuneConfigured(): boolean {
  return Boolean(getMicroTuneAddress());
}

function normalizeAddress(addr: string | undefined): `0x${string}` {
  const raw = (addr ?? "0x3600000000000000000000000000000000000000").trim();
  return getAddress(raw);
}

export const ARC_USDC_ADDRESS: `0x${string}` = normalizeAddress(
  process.env.NEXT_PUBLIC_USDC_ADDRESS
);

export const USDC_DECIMALS = 6;

// USDC on Arc uses 6 decimals: 0.05 USDC = 50_000 units.
export const DEFAULT_PRICE = "50000";

export function getExplorerUrl(hash: `0x${string}`): string {
  return `https://testnet.arcscan.app/tx/${hash}`;
}

export function parseUsdc(value: string): bigint {
  const [whole = "0", frac = ""] = value.split(".");
  const padded = (frac + "000000").slice(0, USDC_DECIMALS);
  return BigInt(whole) * 10n ** BigInt(USDC_DECIMALS) + BigInt(padded);
}
