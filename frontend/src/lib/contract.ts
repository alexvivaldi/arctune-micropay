import type { Abi } from "viem";
import artifact from "@/abis/MicroTune.json";
import { ERC20_ABI as erc20Abi } from "@/lib/erc20";

export const MICROTUNE_ABI = (artifact as { abi: Abi }).abi;
export const MICROTUNE_BYTECODE = (artifact as { bytecode: `0x${string}` }).bytecode;
export const ERC20_ABI = erc20Abi;

export function getMicroTuneAddress(): `0x${string}` | null {
  const addr = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if (!addr) return null;
  return addr as `0x${string}`;
}

export function isMicroTuneConfigured(): boolean {
  return Boolean(getMicroTuneAddress());
}

export const ARC_USDC_ADDRESS: `0x${string}` =
  (process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`) ||
  "0x3600000000000000000000000000000000000000";

export const DEFAULT_PRICE = "50000000000000000"; // 0.05 USDC, 18 decimals
