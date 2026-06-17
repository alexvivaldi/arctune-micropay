"use client";

import { useMemo } from "react";
import { useWatchContractEvent, useReadContract } from "wagmi";
import Image from "next/image";
import { MICROTUNE_ABI, getMicroTuneAddress } from "@/lib/contract";
import { Track } from "@/types/track";
import { formatUnits } from "viem";

interface RoyaltyBotProps {
  track: Track;
}

interface SplitEntry {
  beneficiary: `0x${string}`;
  amount: bigint;
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
    }));
  }, [track]);

  useWatchContractEvent({
    address: address ?? undefined,
    abi: MICROTUNE_ABI,
    eventName: "PaymentSplit",
    args: { trackId: track.id },
    enabled: Boolean(address),
    onLogs(logs) {
      for (const log of logs) {
        const typed = log as unknown as {
          args?: { beneficiary?: `0x${string}`; amount?: bigint };
        };
        if (typed.args?.beneficiary && typed.args.amount !== undefined) {
          console.log(
            "[RoyaltyBot]",
            typed.args.beneficiary,
            formatUnits(typed.args.amount, 18)
          );
        }
      }
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
                <p className="font-bold">{formatUnits(entry.amount, 18)} USDC</p>
                <p className="font-mono text-xs text-gray-400">{Number(track.shares[i] / 100n)}%</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-2 border-white px-4 py-3">
          <p className="text-xs uppercase tracking-widest">
            Total tracks on chain: <strong className="font-mono">{count?.toString() ?? "—"}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
