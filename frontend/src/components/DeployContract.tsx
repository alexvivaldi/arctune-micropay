"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import Image from "next/image";
import { useDeployMicroTune } from "@/hooks/useMicroTune";
import { WalletButton } from "@/components/WalletButton";
import { ARC_USDC_ADDRESS, getExplorerUrl, USDC_DECIMALS, DEFAULT_PRICE } from "@/lib/contract";
import { useTransactionToast } from "@/hooks/useTransactionToast";

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

  const defaultPrice = BigInt(DEFAULT_PRICE);

  useTransactionToast({
    hash,
    error,
    isSuccess,
    pendingTitle: "Contract deploy submitted",
    successTitle: "Contract deployed",
    errorTitle: "Deploy failed",
    description: contractAddress ? `MicroTune at ${contractAddress.slice(0, 8)}…` : undefined,
  });

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 py-12 text-center text-white">
      <div className="mb-8 border-2 border-white p-4">
        <Image src="/logo.svg" alt="ArcTune" width={80} height={80} />
      </div>
      <h1 className="mb-3 text-4xl font-bold uppercase tracking-tight">ArcTune</h1>
      <p className="mb-10 max-w-md text-sm uppercase tracking-widest text-gray-400">
        Deploy the MicroTune contract from your wallet to start streaming with USDC micropayments on Arc Testnet.
      </p>

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-gray-400">Connect your wallet first.</p>
          <WalletButton />
        </div>
      ) : (
        <div className="w-full max-w-md border-2 border-white bg-black p-6">
          <div className="mb-6 space-y-1 text-left font-mono text-xs text-gray-400">
            <p>Deployer: {address}</p>
            <p>USDC: {ARC_USDC_ADDRESS}</p>
            <p>Price: {formatUnits(defaultPrice, USDC_DECIMALS)} USDC</p>
          </div>

          <button
            onClick={handleDeploy}
            disabled={isBusy}
            className="w-full border-2 border-white bg-white px-6 py-4 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-black hover:text-white disabled:opacity-50"
          >
            {isBusy
              ? isConfirming
                ? "Waiting for confirmation…"
                : "Deploying…"
              : "Deploy MicroTune contract"}
          </button>

          {error && <p className="mt-4 text-sm text-white">{error.message}</p>}

          {hash && (
            <div className="mt-6 space-y-2 text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Transaction hash</p>
              <a
                href={getExplorerUrl(hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="block break-all font-mono text-xs text-white underline"
              >
                {hash}
              </a>
            </div>
          )}

          {isSuccess && contractAddress && (
            <div className="mt-6 border-2 border-white bg-white p-4 text-black">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest">Contract deployed</p>
              <button
                onClick={copyAddress}
                className="block w-full break-all border-2 border-black bg-black px-3 py-2 font-mono text-xs text-white transition hover:bg-white hover:text-black"
              >
                {contractAddress}
              </button>
              <p className="mt-2 text-xs font-bold uppercase">
                {copied ? "Copied" : "Click address to copy"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
