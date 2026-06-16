"use client";

import { useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { WalletButton } from "@/components/WalletButton";
import { TrackList } from "@/components/TrackList";
import { AgentPlayer } from "@/components/AgentPlayer";
import { RoyaltyBot } from "@/components/RoyaltyBot";
import { RegisterTrack } from "@/components/RegisterTrack";
import { Track } from "@/types/track";
import { useMicroTuneConfigured } from "@/hooks/useMicroTune";
import { DeployContract } from "@/components/DeployContract";

export default function App() {
  const { isConnected } = useAccount();
  const [selected, setSelected] = useState<Track | null>(null);
  const configured = useMicroTuneConfigured();

  if (!configured) {
    return <DeployContract />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="ArcTune" width={40} height={40} className="rounded-lg" />
            <div>
              <h1 className="text-xl font-bold leading-none">ArcTune</h1>
              <p className="text-xs text-zinc-500">USDC micropayments on Arc Testnet</p>
            </div>
          </div>
          <WalletButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {!isConnected ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="mb-2 text-2xl font-semibold">Connect your wallet</h2>
            <p className="mb-6 text-zinc-500">
              Use MetaMask or any Arc-compatible wallet to stream and pay artists directly.
            </p>
            <WalletButton />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <RegisterTrack />
              <div>
                <h2 className="mb-3 text-lg font-semibold">Tracks</h2>
                <TrackList onSelect={setSelected} selectedId={selected?.id} />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-2">
              {selected ? (
                <>
                  <AgentPlayer track={selected} />
                  <RoyaltyBot track={selected} />
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
                  <p className="text-zinc-500">Select a track to start the agent player.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white px-6 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
        Built for Arc Testnet · Chain ID 5042002 · Native USDC gas token
      </footer>
    </div>
  );
}
