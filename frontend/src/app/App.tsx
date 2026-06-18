"use client";

import { useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { WalletButton } from "@/components/WalletButton";
import { TrackList } from "@/components/TrackList";
import { AgentPlayer } from "@/components/AgentPlayer";
import { RoyaltyBot } from "@/components/RoyaltyBot";
import { RegisterTrack } from "@/components/RegisterTrack";
import { SetDefaultPrice } from "@/components/SetDefaultPrice";
import { Track } from "@/types/track";
import { useMicroTuneConfigured } from "@/hooks/useMicroTune";
import { DeployContract } from "@/components/DeployContract";

function FeatureCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="border-2 border-white bg-black p-4">
      <div className="mb-3 flex h-8 w-8 items-center justify-center border border-white text-white">
        <Image src={icon} alt="" width={20} height={20} />
      </div>
      <h3 className="mb-2 text-sm font-bold uppercase tracking-widest">{title}</h3>
      <p className="text-xs leading-relaxed text-gray-400">{children}</p>
    </div>
  );
}

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
        {/* Hero / intro */}
        <section className="mb-8 border-2 border-white bg-black p-6">
          <h2 className="mb-2 text-xl font-bold uppercase tracking-tight">
            Pay artists directly. No labels. No middlemen.
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-gray-400">
            ArcTune is a micro-payment music layer on Arc Testnet. Listeners pay
            <strong className="text-white"> 0.05 USDC </strong>
            per stream. The smart contract instantly splits the payment between the artist,
            producer and collaborators — in real time, on-chain.
          </p>
        </section>

        {/* Why Arc */}
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-400">
            Why Arc Testnet
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon="/agent.svg" title="Agents as users">
              The agent player and royalty bot sign real transactions and read contract state directly — no backend needed.
            </FeatureCard>
            <FeatureCard icon="/logo.svg" title="Native USDC gas">
              Gas and payments are both in USDC. No ETH wrapping, no swaps, no double-denomination friction.
            </FeatureCard>
            <FeatureCard icon="/bot.svg" title="Micro payments work">
              Low fees make $0.05 streams economically viable. Every listen pays out immediately.
            </FeatureCard>
            <FeatureCard icon="/agent.svg" title="EVM compatible">
              MetaMask, Viem, Wagmi, Hardhat — all existing tools work out of the box.
            </FeatureCard>
          </div>
        </section>

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
              <SetDefaultPrice />
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
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 border-2 border-dashed border-white bg-black p-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center border-2 border-white">
                    <Image src="/agent.svg" alt="" width={32} height={32} />
                  </div>
                  <p className="text-sm uppercase tracking-widest text-gray-400">
                    Select a track from the list to start the agent player
                  </p>
                  <p className="max-w-sm text-xs leading-relaxed text-gray-500">
                    The agent will sign a real transaction and pay 0.05 USDC directly to the artist,
                    producer and collaborator.
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
