"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { useDeployMicroTune } from "@/hooks/useMicroTune";
import { WalletButton } from "@/components/WalletButton";
import { ARC_USDC_ADDRESS } from "@/lib/contract";
import Image from "next/image";

export function DeployContract() {
  const { isConnected, address } = useAccount();
  const {
    deploy,
    hash,
    contractAddress,
    error,
    isPending,
    isConfirming,
    isSuccess,
  } = useDeployMicroTune();
  const [copied, setCopied] = useState(false);

  const defaultPrice = parseUnits("0.05", 18);

  useEffect(() => {
    if (contractAddress) setCopied(false);
  }, [contractAddress]);

  const handleDeploy = () => {
    deploy(ARC_USDC_ADDRESS, defaultPrice);
  };

  const isBusy = isPending || isConfirming;

  const copyAddress = () => {
    if (contractAddress) {
      navigator.clipboard.writeText(contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-[#0a0a12] to-zinc-900 px-6 py-12 text-center text-white">
      <div className="mb-6 inline-flex items-center justify-center rounded-3xl bg-[#0a0a12] p-4 shadow-[0_0_40px_rgba(57,255,20,0.25)]">
        <Image src="/logo.svg" alt="ArcTune" width={80} height={80} />
      </div>
      <h1 className="mb-3 text-4xl font-bold tracking-tight">
        <span className="text-[#39ff14]">Arc</span>
        <span className="text-[#00f0ff]">Tune</span>
      </h1>
      <p className="mb-8 max-w-md text-zinc-400">
        Deploy the MicroTune contract from your wallet to start streaming with
        USDC micropayments on Arc Testnet.
      </p>

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-sm text-zinc-500">Connect your wallet first.</p>
          <WalletButton />
        </div>
      ) : (
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur">
          <div className="text-left text-sm text-zinc-400">
            <p>Deployer: {address}</p>
            <p>USDC token: {ARC_USDC_ADDRESS}</p>
            <p>Listen price: {formatUnits(defaultPrice, 18)} USDC</p>
          </div>

          <button
            onClick={handleDeploy}
            disabled={isBusy}
            className="w-full rounded-xl bg-gradient-to-r from-[#39ff14] via-[#00f0ff] to-[#ff00ff] px-6 py-3 font-bold text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] transition hover:opacity-90 disabled:opacity-50"
          >
            {isBusy
              ? isConfirming
                ? "Waiting for confirmation..."
                : "Deploying..."
              : "Deploy MicroTune contract"}
          </button>

          {error && <p className="text-sm text-red-400">{error.message}</p>}

          {hash && (
            <div className="space-y-2 text-sm">
              <p className="text-zinc-400">Transaction hash:</p>
              <a
                href={`https://testnet.arcscan.app/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block break-all font-mono text-[#00f0ff] hover:underline"
              >
                {hash}
              </a>
            </div>
          )}

          {isSuccess && contractAddress && (
            <div className="space-y-3 rounded-xl border border-[#39ff14]/30 bg-[#39ff14]/10 p-4 text-sm">
              <p className="text-[#39ff14]">Contract deployed successfully!</p>
              <div>
                <p className="mb-1 text-zinc-400">Contract address:</p>
                <button
                  onClick={copyAddress}
                  className="block break-all rounded-lg bg-zinc-950 px-3 py-2 font-mono text-[#00f0ff] transition hover:bg-zinc-900"
                >
                  {contractAddress}
                </button>
              </div>
              <p className="text-zinc-400">
                {copied ? "Copied!" : "Click the address to copy and send it to me."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
