"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  useApproveUsdc,
  useListen,
  useUsdcAllowance,
  useUsdcBalance,
} from "@/hooks/useMicroTune";
import { Track } from "@/types/track";
import { formatUnits } from "viem";
import { getExplorerUrl } from "@/lib/contract";

interface AgentPlayerProps {
  track: Track;
}

export function AgentPlayer({ track }: AgentPlayerProps) {
  const { listen, isPending, isConfirming, hash } = useListen();
  const { data: allowance, isLoading: isAllowanceLoading } = useUsdcAllowance();
  const { approve, isPending: isApprovePending, isConfirming: isApproveConfirming } =
    useApproveUsdc();
  const { data: balance } = useUsdcBalance();

  const [auto, setAuto] = useState(false);
  const [agentCount, setAgentCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const price = track.listenPrice;
  const needsApproval = !allowance || allowance < price;

  const playTone = useCallback(() => {
    if (typeof window === "undefined") return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = audioCtxRef.current || new AudioContext();
    audioCtxRef.current = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2);
    setPlaying(true);
    setTimeout(() => setPlaying(false), 2000);
  }, []);

  const payForListen = useCallback(() => {
    setLog((prev) => [
      `Agent: paid ${formatUnits(price, 18)} USDC for #${track.id}`,
      ...prev,
    ].slice(0, 20));
    listen(track.id);
    setAgentCount((c) => c + 1);
  }, [listen, price, track.id]);

  useEffect(() => {
    if (auto) {
      intervalRef.current = setInterval(() => {
        playTone();
        payForListen();
      }, 8000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [auto, payForListen, playTone]);

  const isBusy = isPending || isConfirming || isApprovePending || isApproveConfirming;

  return (
    <div className="border-2 border-white bg-black">
      <div className="flex items-center gap-3 border-b-2 border-white px-4 py-3">
        <div className="flex h-6 w-6 items-center justify-center border border-white">
          <Image src="/agent.svg" alt="" width={16} height={16} />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-widest">Agent Player</h2>
      </div>
      <div className="p-4">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center border-2 border-white bg-white text-black text-xl">
            {playing ? "▶" : "◼"}
          </div>
          <div>
            <p className="text-lg font-bold uppercase tracking-tight">{track.title}</p>
            <p className="font-mono text-xs text-gray-400">
              {formatUnits(track.totalRevenue, 18)} USDC · {track.totalListens.toString()} listens
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {needsApproval ? (
            <button
              onClick={() => approve(price)}
              disabled={isBusy || isAllowanceLoading}
              className="border-2 border-white bg-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-black hover:text-white disabled:opacity-50"
            >
              {isApprovePending || isApproveConfirming ? "Approving…" : "Approve USDC"}
            </button>
          ) : (
            <button
              onClick={() => {
                playTone();
                payForListen();
              }}
              disabled={isBusy}
              className="border-2 border-white bg-white px-6 py-3 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-black hover:text-white disabled:opacity-50"
            >
              {isPending || isConfirming ? "Paying…" : "Listen now — 0.05 USDC"}
            </button>
          )}

          <button
            onClick={() => setAuto((v) => !v)}
            disabled={needsApproval || isBusy}
            className={`border-2 px-6 py-3 text-sm font-bold uppercase tracking-widest transition disabled:opacity-50 ${
              auto
                ? "border-white bg-white text-black hover:bg-black hover:text-white"
                : "border-white bg-black text-white hover:bg-white hover:text-black"
            }`}
          >
            {auto ? "Stop agent" : "Run agent"}
          </button>
        </div>

        <div className="mb-6 flex items-center gap-3 border-2 border-white px-3 py-2">
          <span className="flex h-2 w-2">
            <span
              className={`inline-flex h-2 w-2 rounded-full ${
                isBusy || auto ? "animate-pulse bg-white" : "bg-gray-500"
              }`}
            />
          </span>
          <p className="font-mono text-xs uppercase tracking-widest text-gray-400">
            {isPending || isApprovePending
              ? "Waiting for wallet signature"
              : isConfirming || isApproveConfirming
              ? "Waiting for on-chain confirmation"
              : auto
              ? "Agent is running — paying every 8s"
              : "Agent idle"}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 border-2 border-white">
          <div className="border-r-2 border-white p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Agent listens</p>
            <p className="font-mono text-xl font-bold">{agentCount}</p>
          </div>
          <div className="p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Wallet balance</p>
            <p className="font-mono text-xl font-bold">
              {balance?.value ? `${formatUnits(balance.value, balance.decimals ?? 18)} ${balance.symbol ?? "USDC"}` : "—"}
            </p>
          </div>
        </div>

        {hash && (
          <a
            href={getExplorerUrl(hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 block font-mono text-xs text-gray-400 hover:text-white"
          >
            Tx: {hash.slice(0, 14)}…{hash.slice(-12)}
          </a>
        )}

        <div className="h-32 overflow-y-auto border-2 border-white bg-black p-3">
          {log.length === 0 ? (
            <p className="text-xs uppercase tracking-widest text-gray-400">Agent logs will appear here.</p>
          ) : (
            log.map((entry, i) => (
              <p key={i} className="mb-1 border-b border-white/10 pb-1 font-mono text-xs last:border-0">
                {entry}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
