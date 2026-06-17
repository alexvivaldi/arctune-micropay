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
  const [metadataURI, setMetadataURI] = useState("https://arctune.xyz/track/");
  const [artistShare, setArtistShare] = useState("70");
  const [producerShare, setProducerShare] = useState("20");
  const [collabShare, setCollabShare] = useState("10");
  const [producer, setProducer] = useState("");
  const [collab, setCollab] = useState("");

  const isBusy = isPending || isConfirming;

  const register = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!address || !contractAddress) return;
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
    <div className="border-2 border-white bg-black">
      <div className="border-b-2 border-white px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-widest">Register track</h2>
      </div>
      <form onSubmit={register} className="space-y-4 p-4">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border-2 border-white bg-black px-3 py-2 text-sm outline-none transition focus:bg-white focus:text-black"
            placeholder="Midnight Guitar"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">Metadata URI</label>
          <input
            value={metadataURI}
            onChange={(e) => setMetadataURI(e.target.value)}
            required
            className="w-full border-2 border-white bg-black px-3 py-2 text-sm outline-none transition focus:bg-white focus:text-black"
            placeholder="ipfs://..."
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Artist %", value: artistShare, set: setArtistShare },
            { label: "Producer %", value: producerShare, set: setProducerShare },
            { label: "Collab %", value: collabShare, set: setCollabShare },
          ].map((field) => (
            <div key={field.label}>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">{field.label}</label>
              <input
                type="number"
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                min={0}
                max={100}
                className="w-full border-2 border-white bg-black px-3 py-2 text-sm outline-none transition focus:bg-white focus:text-black"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">Producer address</label>
          <input
            value={producer}
            onChange={(e) => setProducer(e.target.value)}
            className="w-full border-2 border-white bg-black px-3 py-2 text-sm font-mono outline-none transition focus:bg-white focus:text-black"
            placeholder="0x..."
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">Collaborator address</label>
          <input
            value={collab}
            onChange={(e) => setCollab(e.target.value)}
            className="w-full border-2 border-white bg-black px-3 py-2 text-sm font-mono outline-none transition focus:bg-white focus:text-black"
            placeholder="0x..."
          />
        </div>
        <button
          type="submit"
          disabled={isBusy || !address}
          className="w-full border-2 border-white bg-white px-4 py-3 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-black hover:text-white disabled:opacity-50"
        >
          {isBusy ? (isConfirming ? "Confirming…" : "Registering…") : "Register track"}
        </button>
        {error && <p className="text-sm text-white">{error.message}</p>}
        {isSuccess && <p className="text-sm font-bold uppercase text-white">Track registered.</p>}
      </form>
    </div>
  );
}
