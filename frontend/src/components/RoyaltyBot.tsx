"use client";

import { useMemo } from "react";
import { useWatchContractEvent, useReadContract } from "wagmi";
import { MICROTUNE_ABI, getMicroTuneAddress } from "@/lib/contract";
import { Track } from "@/types/track";
import { formatUnits } from "viem";

interface RoyaltyBotProps {
  track: Track;
}

interface SplitEntry {
  beneficiary: `0x${string}`;
  amount: bigint;
  timestamp: number;
}

export function RoyaltyBot({ track }: RoyaltyBotProps) {
  const address = getMicroTuneAddress();
  const { data: count } = useReadContract({
    address: address ?? undefined,
    abi: MICROTUNE_ABI,
    functionName: "getTrackCount",
    query: { enabled: Boolean(address) },
  });

  const entries = useMemo<SplitEntry[]>(() => {
    return track.beneficiaries.map((b, i) => ({
      beneficiary: b,
      amount: (track.listenPrice * track.shares[i]) / 10000n,
      timestamp: Date.now(),
    }));
  }, [track]);

  useWatchContractEvent({
    address: address ?? undefined,
    abi: MICROTUNE_ABI,
    eventName: "PaymentSplit",
    args: {
      trackId: track.id,
    },
    enabled: Boolean(address),
    onLogs(logs) {
      for (const log of logs) {
        const typed = log as unknown as {
          args?: {
            beneficiary?: `0x${string}`;
            amount?: bigint;
          };
        };
        if (typed.args?.beneficiary && typed.args.amount !== undefined) {
          console.log(
            "[RoyaltyBot] split",
            typed.args.beneficiary,
            formatUnits(typed.args.amount, 18)
          );
        }
      }
    },
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Royalty Bot</h2>
        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Live
        </span>
      </div>

      <p className="mb-4 text-sm text-zinc-500">
        Real-time split preview for one listen of <strong>{track.title}</strong>.
      </p>

      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div
            key={entry.beneficiary}
            className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800"
          >
            <div>
              <p className="text-xs text-zinc-500">{i === 0 ? "Artist" : i === 1 ? "Producer" : "Collaborator"}</p>
              <p className="font-mono text-xs">{entry.beneficiary}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatUnits(entry.amount, 18)} USDC</p>
              <p className="text-xs text-zinc-500">{Number(track.shares[i] / 100n)}%</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg bg-arc-50 p-3 text-sm dark:bg-arc-900/20">
        <p>
          Total tracks on chain: <strong>{count?.toString() ?? "—"}</strong>
        </p>
      </div>
    </div>
  );
}
