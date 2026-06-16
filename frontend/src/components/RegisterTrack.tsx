"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MICROTUNE_ABI } from "@/lib/contract";
import { isAddress } from "viem";
import { useMicroTuneContract } from "@/hooks/useMicroTune";

export function RegisterTrack() {
  const { address } = useAccount();
  const { address: contractAddress } = useMicroTuneContract();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const [title, setTitle] = useState("");
  const [metadataURI, setMetadataURI] = useState("https://arctune.example/track/");
  const [artistShare, setArtistShare] = useState("70");
  const [producerShare, setProducerShare] = useState("20");
  const [collabShare, setCollabShare] = useState("10");
  const [producer, setProducer] = useState("");
  const [collab, setCollab] = useState("");

  const isBusy = isPending || isConfirming;

  const register = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!address) return;
      const shares = [Number(artistShare), Number(producerShare), Number(collabShare)];
      const total = shares.reduce((a, b) => a + b, 0);
      if (total !== 100) {
        alert("Shares must add up to 100%");
        return;
      }
      const beneficiaries = [address];
      if (producer && isAddress(producer)) beneficiaries.push(producer);
      if (collab && isAddress(collab)) beneficiaries.push(collab);
      const finalShares = beneficiaries.map((_, i) => shares[i] * 100);

      if (!contractAddress) return;
      writeContract({
        address: contractAddress,
        abi: MICROTUNE_ABI,
        functionName: "registerTrack",
        args: [title, metadataURI, 0n, beneficiaries, finalShares],
      });
    },
    [address, artistShare, collab, collabShare, contractAddress, metadataURI, producer, producerShare, title, writeContract]
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-xl font-semibold">Register a track</h2>
      <form onSubmit={register} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="Midnight Guitar"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Metadata URI</label>
          <input
            value={metadataURI}
            onChange={(e) => setMetadataURI(e.target.value)}
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="ipfs://..."
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Artist %</label>
            <input
              type="number"
              value={artistShare}
              onChange={(e) => setArtistShare(e.target.value)}
              min={0}
              max={100}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Producer %</label>
            <input
              type="number"
              value={producerShare}
              onChange={(e) => setProducerShare(e.target.value)}
              min={0}
              max={100}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Collab %</label>
            <input
              type="number"
              value={collabShare}
              onChange={(e) => setCollabShare(e.target.value)}
              min={0}
              max={100}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Producer address</label>
          <input
            value={producer}
            onChange={(e) => setProducer(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="0x..."
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Collaborator address</label>
          <input
            value={collab}
            onChange={(e) => setCollab(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="0x..."
          />
        </div>
        <button
          type="submit"
          disabled={isBusy || !address}
          className="w-full rounded-lg bg-arc-600 px-4 py-2 font-medium text-white hover:bg-arc-700 disabled:opacity-50"
        >
          {isBusy ? "Registering..." : "Register track"}
        </button>
        {error && <p className="text-sm text-red-500">{error.message}</p>}
        {isSuccess && <p className="text-sm text-green-600">Track registered successfully.</p>}
      </form>
    </div>
  );
}
