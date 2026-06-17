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
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="border-b-2 border-white bg-black px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.svg"
              alt="ArcTune"
              width={44}
              height={44}
              className="border-2 border-white"
            />
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tight">ArcTune</h1>
              <p className="text-xs uppercase tracking-widest text-gray-400">
                USDC micropayments on Arc Testnet
              </p>
            </div>
          </div>
          <WalletButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center border-2 border-white bg-black px-8 py-24 text-center">
            <h2 className="mb-4 text-3xl font-bold uppercase">Connect wallet</h2>
            <p className="mb-8 max-w-md text-sm text-gray-400">
              Use MetaMask or any Arc-compatible wallet to stream and pay artists directly.
            </p>
            <WalletButton />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12">
            <aside className="space-y-6 lg:col-span-4">
              <RegisterTrack />
              <div className="border-2 border-white bg-black">
                <div className="border-b-2 border-white px-4 py-3">
                  <h2 className="text-sm font-bold uppercase tracking-widest">Tracks</h2>
                </div>
                <div className="p-4">
                  <TrackList onSelect={setSelected} selectedId={selected?.id} />
                </div>
              </div>
            </aside>

            <section className="space-y-6 lg:col-span-8">
              {selected ? (
                <>
                  <AgentPlayer track={selected} />
                  <RoyaltyBot track={selected} />
                </>
              ) : (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center border-2 border-dashed border-white bg-black p-12 text-center">
                  <p className="text-sm uppercase tracking-widest text-gray-400">
                    Select a track to start the agent player
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <footer className="border-t-2 border-white bg-black px-6 py-6 text-center">
        <p className="text-xs uppercase tracking-widest text-gray-400">
          Arc Testnet · Chain ID 5042002 · Native USDC gas token
        </p>
      </footer>
    </div>
  );
}
