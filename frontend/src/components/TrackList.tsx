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
    return <div className="text-zinc-500">Loading tracks from the blockchain...</div>;
  }

  if (error) {
    return <div className="text-red-500">Failed to load tracks: {error.message}</div>;
  }

  if (tracks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-zinc-500 dark:border-zinc-700">
        No tracks registered yet. Register the first track from the artist dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((track) => (
        <button
          key={track.id.toString()}
          onClick={() => onSelect(track)}
          className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
            selectedId === track.id
              ? "border-arc-500 bg-arc-50 dark:bg-arc-900/20"
              : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          }`}
        >
          <div>
            <p className="font-semibold">{track.title}</p>
            <p className="text-xs text-zinc-500">Artist: {track.artist}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{formatUnits(track.listenPrice, 18)} USDC</p>
            <p className="text-xs text-zinc-500">{track.totalListens.toString()} listens</p>
          </div>
        </button>
      ))}
    </div>
  );
}
