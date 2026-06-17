"use client";

import { useMemo } from "react";
import { useTracks } from "@/hooks/useMicroTune";
import { Track } from "@/types/track";
import { formatUnits } from "viem";

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
    return <div className="text-sm uppercase tracking-widest text-gray-400">Loading tracks…</div>;
  }

  if (error) {
    return <div className="text-sm text-white">Failed to load tracks: {error.message}</div>;
  }

  if (tracks.length === 0) {
    return (
      <div className="border border-dashed border-white p-6 text-center text-sm text-gray-400">
        No tracks yet. Register the first one above.
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
            <p className="text-sm font-bold">{formatUnits(track.listenPrice, 18)} USDC</p>
            <p className="font-mono text-xs text-current/70">{track.totalListens.toString()} listens</p>
          </div>
        </button>
      ))}
    </div>
  );
}
