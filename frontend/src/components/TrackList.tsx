"use client";

import { useMemo } from "react";
import { useTracks } from "@/hooks/useMicroTune";
import { Track } from "@/types/track";
import { formatUnits } from "viem";
import { USDC_DECIMALS } from "@/lib/contract";

interface TrackListProps {
  onSelect: (track: Track) => void;
  selectedId?: bigint;
}

export function TrackList({ onSelect, selectedId }: TrackListProps) {
  const { tracks, isLoading, error } = useTracks();

  const sorted = useMemo(() => {
    return [...tracks].sort((a, b) => Number(b.id - a.id));
  }, [tracks]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse border-2 border-white bg-white/10" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-white bg-white p-4 text-sm text-black">
        <p className="font-bold uppercase tracking-widest">Failed to load tracks</p>
        <p className="mt-1">{error.message}</p>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="border-2 border-dashed border-white p-6 text-center text-sm text-gray-400">
        No tracks yet. Register the first one above and it will appear here automatically.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((track) => (
        <button
          key={track.id.toString()}
          onClick={() => onSelect(track)}
          className={`flex w-full items-center justify-between border-2 px-4 py-3 text-left transition ${
            selectedId === track.id
              ? "border-white bg-white text-black"
              : "border-white bg-black text-white hover:bg-white hover:text-black"
          }`}
        >
          <div>
            <p className="font-bold uppercase tracking-tight">{track.title}</p>
            <p className="font-mono text-xs text-current/70">{track.artist}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">{formatUnits(track.listenPrice, USDC_DECIMALS)} USDC</p>
            <p className="font-mono text-xs text-current/70">{track.totalListens.toString()} listens</p>
          </div>
        </button>
      ))}
    </div>
  );
}
