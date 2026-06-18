"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MICROTUNE_ABI, getMicroTuneAddress, USDC_DECIMALS, DEFAULT_PRICE, getExplorerUrl } from "@/lib/contract";
import { formatUnits } from "viem";
import { useTransactionToast } from "@/hooks/useTransactionToast";

export function SetDefaultPrice() {
  const { address } = useAccount();
  const contractAddress = getMicroTuneAddress();

  const { data: owner } = useReadContract({
    address: contractAddress ?? undefined,
    abi: MICROTUNE_ABI,
    functionName: "owner",
    query: { enabled: Boolean(contractAddress) },
  });

  const { data: currentPriceRaw } = useReadContract({
    address: contractAddress ?? undefined,
    abi: MICROTUNE_ABI,
    functionName: "defaultPrice",
    query: { enabled: Boolean(contractAddress), refetchInterval: 10_000 },
  });
  const currentPrice = currentPriceRaw as bigint | undefined;

  const isOwner = Boolean(address && owner && address.toLowerCase() === (owner as string).toLowerCase());
  const isWrongPrice = currentPrice !== undefined && currentPrice !== BigInt(DEFAULT_PRICE);

  const { writeContract, data: hash, error, isPending, isSuccess } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  useTransactionToast({
    hash,
    error,
    isSuccess,
    pendingTitle: "Set default price submitted",
    successTitle: "Default price updated",
    errorTitle: "Set default price failed",
  });

  if (!isOwner || !isWrongPrice) return null;

  return (
    <div className="border-2 border-white bg-white p-4 text-black">
      <p className="text-sm font-bold uppercase tracking-widest">Contract price needs fix</p>
      <p className="mt-1 text-xs">
        Current default price is {currentPrice !== undefined ? formatUnits(currentPrice, USDC_DECIMALS) : "—"} USDC
        ({currentPrice?.toString()} units). The correct price for Arc USDC (6 decimals) is{" "}
        {formatUnits(BigInt(DEFAULT_PRICE), USDC_DECIMALS)} USDC ({DEFAULT_PRICE} units).
      </p>
      <button
        onClick={() => {
          if (!contractAddress) return;
          writeContract({
            address: contractAddress,
            abi: MICROTUNE_ABI,
            functionName: "setDefaultPrice",
            args: [BigInt(DEFAULT_PRICE)],
          });
        }}
        disabled={isPending || isConfirming}
        className="mt-3 w-full border-2 border-black bg-black px-4 py-2 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-black disabled:opacity-50"
      >
        {isPending || isConfirming ? "Updating…" : "Set correct default price"}
      </button>
      {hash && (
        <a
          href={getExplorerUrl(hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block break-all font-mono text-xs underline"
        >
          {hash}
        </a>
      )}
    </div>
  );
}
