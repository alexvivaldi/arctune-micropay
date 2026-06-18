"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatAddress } from "@/lib/format";
import { useUsdcBalance } from "@/hooks/useMicroTune";
import { formatUnits } from "viem";
import { USDC_DECIMALS } from "@/lib/contract";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { data: balance } = useUsdcBalance();
  const balanceText = balance
    ? `${formatUnits(balance, USDC_DECIMALS)} USDC`
    : "—";

  if (!isConnected || !address) {
    return (
      <button
        onClick={openConnectModal}
        className="border-2 border-white bg-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-black hover:text-white"
      >
        Connect
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 border-2 border-white px-4 py-2">
      <div className="h-6 w-6 bg-white" />
      <div className="flex flex-col items-start leading-none">
        <span className="font-mono text-sm uppercase">{formatAddress(address)}</span>
        <span className="font-mono text-xs text-gray-400">{balanceText}</span>
      </div>
      <button
        onClick={() => disconnect()}
        className="ml-2 border-l-2 border-white pl-3 text-xs font-bold uppercase text-gray-400 transition hover:text-white"
      >
        Exit
      </button>
    </div>
  );
}
