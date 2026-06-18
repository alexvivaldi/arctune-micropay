"use client";

import { useMemo, useState } from "react";
import { useWatchContractEvent, useReadContract } from "wagmi";
import Image from "next/image";
import { MICROTUNE_ABI, getMicroTuneAddress, getExplorerUrl, USDC_DECIMALS } from "@/lib/contract";
import { Track } from "@/types/track";
import { formatUnits } from "viem";

interface RoyaltyBotProps {
  track: Track;
}

interface SplitEntry {
  beneficiary: `0x${string}`;
  amount: bigint;
}

interface LiveSplit {
  txHash?: `0x${string}`;
  beneficiary: `0x${string}`;
  amount: bigint;
}

export function RoyaltyBot({ track }: RoyaltyBotProps) {
  const address = getMicroTuneAddress();
  const [liveSplits, setLiveSplits] = useState<LiveSplit[]>([]);
  const { data: count } = useReadContract({
    address: address ?? undefined,
    abi: MICROTUNE_ABI,
    functionName: "getTrackCount",
    query: { enabled: Boolean(address), refetchInterval: 5_000 },
  });

  const entries = useMemo<SplitEntry[]>(() => {
    return track.beneficiaries.map((b, i) => ({
      beneficiary: b,
      amount: (track.listenPrice * track.shares[i]) / 10000n,
    }));
  }, [track]);

  useWatchContractEvent({
    address: address ?? undefined,
    abi: MICROTUNE_ABI,
    eventName: "PaymentSplit",
    args: { trackId: track.id },
    enabled: Boolean(address),
    onLogs(logs) {
      setLiveSplits((prev) => {
        const next = [...prev];
        for (const log of logs) {
          const typed = log as unknown as {
            transactionHash?: `0x${string}`;
            args?: { beneficiary?: `0x${string}`; amount?: bigint };
          };
          if (typed.args?.beneficiary && typed.args.amount !== undefined) {
            next.unshift({
              txHash: typed.transactionHash,
              beneficiary: typed.args.beneficiary,
              amount: typed.args.amount,
            });
          }
        }
        return next.slice(0, 5);
      });
    },
  });

  return (
    <div className="border-2 border-white bg-black">
      <div className="flex items-center justify-between border-b-2 border-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center border border-white">
            <Image src="/bot.svg" alt="" width={16} height={16} />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest">Royalty Bot</h2>
        </div>
        <span className="border border-white px-2 py-1 text-xs font-bold uppercase tracking-widest">
          Live
        </span>
      </div>
      <div className="p-4">
        <p className="mb-4 text-xs uppercase tracking-widest text-gray-400">
          Real-time split for one listen of <strong className="text-white">{track.title}</strong>
        </p>

        <div className="space-y-2">
          {entries.map((entry, i) => (
            <div
              key={entry.beneficiary}
              className="flex items-center justify-between border-2 border-white px-3 py-2"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {i === 0 ? "Artist" : i === 1 ? "Producer" : "Collaborator"}
                </p>
                <p className="font-mono text-xs">{entry.beneficiary}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatUnits(entry.amount, USDC_DECIMALS)} USDC</p>
                <p className="font-mono text-xs text-gray-400">{Number(track.shares[i] / 100n)}%</p>
              </div>
            </div>
          ))}
        </div>

        {liveSplits.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Live splits</p>
            {liveSplits.map((split, i) => (
              <div key={`${split.beneficiary}-${i}`} className="flex items-center justify-between border border-white px-3 py-2">
                <div className="min-w-0">
                  <p className="font-mono text-xs truncate">{split.beneficiary}</p>
                  {split.txHash && (
                    <a
                      href={getExplorerUrl(split.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] underline opacity-70 hover:opacity-100"
                    >
                      {split.txHash.slice(0, 10)}…{split.txHash.slice(-8)}
                    </a>
                  )}
                </div>
                <p className="font-mono text-xs font-bold">{formatUnits(split.amount, USDC_DECIMALS)} USDC</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 border-2 border-white px-4 py-3">
          <p className="text-xs uppercase tracking-widest">
            Total tracks on chain: <strong className="font-mono">{count?.toString() ?? "—"}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
