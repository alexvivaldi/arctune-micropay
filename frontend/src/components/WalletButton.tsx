"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatAddress } from "@/lib/format";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

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
      <span className="font-mono text-sm uppercase">{formatAddress(address)}</span>
      <button
        onClick={() => disconnect()}
        className="ml-2 border-l-2 border-white pl-3 text-xs font-bold uppercase text-gray-400 transition hover:text-white"
      >
        Exit
      </button>
    </div>
  );
}
