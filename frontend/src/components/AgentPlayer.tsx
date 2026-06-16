"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useApproveUsdc,
  useListen,
  useUsdcAllowance,
  useUsdcBalance,
} from "@/hooks/useMicroTune";
import { Track } from "@/types/track";
import { formatUnits } from "viem";

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
    setLog((prev) => [`Agent: paying ${formatUnits(price, 18)} USDC for #${track.id}`, ...prev].slice(0, 20));
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-xl font-semibold">Agent Player</h2>
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-arc-100 text-2xl dark:bg-arc-900">
          {playing ? "🎵" : "🎸"}
        </div>
        <div>
          <p className="font-medium">{track.title}</p>
          <p className="text-sm text-zinc-500">
            {formatUnits(track.totalRevenue, 18)} USDC earned · {track.totalListens.toString()} listens
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        {needsApproval ? (
          <button
            onClick={() => approve(price)}
            disabled={isBusy || isAllowanceLoading}
            className="rounded-lg bg-arc-600 px-4 py-2 font-medium text-white hover:bg-arc-700 disabled:opacity-50"
          >
            {isApprovePending || isApproveConfirming ? "Approving USDC..." : "Approve 0.05 USDC"}
          </button>
        ) : (
          <button
            onClick={() => {
              playTone();
              payForListen();
            }}
            disabled={isBusy}
            className="rounded-lg bg-arc-600 px-4 py-2 font-medium text-white hover:bg-arc-700 disabled:opacity-50"
          >
            {isPending || isConfirming ? "Paying..." : "▶ Listen now (0.05 USDC)"}
          </button>
        )}

        <button
          onClick={() => setAuto((v) => !v)}
          disabled={needsApproval || isBusy}
          className={`rounded-lg px-4 py-2 font-medium transition ${
            auto
              ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
              : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
          } disabled:opacity-50`}
        >
          {auto ? "⏹ Stop agent" : "🤖 Run agent"}
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
          <p className="text-zinc-500">Agent listens</p>
          <p className="text-lg font-semibold">{agentCount}</p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
          <p className="text-zinc-500">Wallet balance</p>
          <p className="text-lg font-semibold">
            {balance ? `${formatUnits(balance, 18)} USDC` : "—"}
          </p>
        </div>
      </div>

      {hash && (
        <p className="mb-4 text-xs text-zinc-500">
          Tx: {hash.slice(0, 14)}...{hash.slice(-12)}
        </p>
      )}

      <div className="h-32 overflow-y-auto rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-800">
        {log.length === 0 ? (
          <p className="text-zinc-400">Agent logs will appear here.</p>
        ) : (
          log.map((entry, i) => (
            <p key={i} className="mb-1 border-b border-zinc-100 pb-1 last:border-0 dark:border-zinc-700">
              {entry}
            </p>
          ))
        )}
      </div>
    </div>
  );
}
