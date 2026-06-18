"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MICROTUNE_ABI, getExplorerUrl } from "@/lib/contract";
import { isAddress } from "viem";
import { useMicroTuneContract } from "@/hooks/useMicroTune";
import { useTransactionToast } from "@/hooks/useTransactionToast";

export function RegisterTrack() {
  const { address } = useAccount();
  const { address: contractAddress } = useMicroTuneContract();
  const { writeContract, data: hash, error, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useTransactionToast({
    hash,
    error,
    isSuccess,
    pendingTitle: "Track registration submitted",
    successTitle: "Track registered",
    errorTitle: "Registration failed",
    description: "Your track will appear in the list once confirmed.",
  });

  const [title, setTitle] = useState("");
  const [metadataURI, setMetadataURI] = useState("https://arctune.xyz/track/");
  const [artistShare, setArtistShare] = useState("70");
  const [producerShare, setProducerShare] = useState("20");
  const [collabShare, setCollabShare] = useState("10");
  const [producer, setProducer] = useState("");
  const [collab, setCollab] = useState("");
  const [validation, setValidation] = useState<string | null>(null);

  const isBusy = isPending || isConfirming;

  const resetForm = useCallback(() => {
    setTitle("");
    setMetadataURI("https://arctune.xyz/track/");
    setArtistShare("70");
    setProducerShare("20");
    setCollabShare("10");
    setProducer("");
    setCollab("");
    setValidation(null);
  }, []);

  useEffect(() => {
    if (isSuccess && hash) {
      const timer = setTimeout(() => {
        resetForm();
        reset();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, hash, resetForm, reset]);

  const register = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setValidation(null);
      if (!address || !contractAddress) return;

      const artistPct = Number(artistShare);
      const producerPct = Number(producerShare);
      const collabPct = Number(collabShare);

      const producerAddr = producer.trim();
      const collabAddr = collab.trim();
      const hasProducer = producerAddr !== "" && isAddress(producerAddr);
      const hasCollab = collabAddr !== "" && isAddress(collabAddr);

      const effectiveProducer = hasProducer ? producerPct : 0;
      const effectiveCollab = hasCollab ? collabPct : 0;

      if (artistPct <= 0 || artistPct > 100) {
        setValidation("Artist share must be between 1 and 100%");
        return;
      }
      if (producerPct < 0 || producerPct > 100 || collabPct < 0 || collabPct > 100) {
        setValidation("Each share must be between 0 and 100%");
        return;
      }
      if (artistPct + effectiveProducer + effectiveCollab !== 100) {
        setValidation(
          `Shares must add up to 100% (currently ${artistPct + effectiveProducer + effectiveCollab}%)`
        );
        return;
      }

      const beneficiaries: `0x${string}`[] = [address];
      const finalShares: number[] = [artistPct * 100];

      if (hasProducer) {
        beneficiaries.push(producerAddr as `0x${string}`);
        finalShares.push(producerPct * 100);
      }
      if (hasCollab) {
        beneficiaries.push(collabAddr as `0x${string}`);
        finalShares.push(collabPct * 100);
      }

      writeContract({
        address: contractAddress,
        abi: MICROTUNE_ABI,
        functionName: "registerTrack",
        args: [title, metadataURI, 0n, beneficiaries, finalShares.map((s) => BigInt(s))],
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
            disabled={isBusy}
            className="w-full border-2 border-white bg-black px-3 py-2 text-sm outline-none transition focus:bg-white focus:text-black disabled:opacity-50"
            placeholder="Midnight Guitar"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">Metadata URI</label>
          <input
            value={metadataURI}
            onChange={(e) => setMetadataURI(e.target.value)}
            required
            disabled={isBusy}
            className="w-full border-2 border-white bg-black px-3 py-2 text-sm outline-none transition focus:bg-white focus:text-black disabled:opacity-50"
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
                disabled={isBusy}
                className="w-full border-2 border-white bg-black px-3 py-2 text-sm outline-none transition focus:bg-white focus:text-black disabled:opacity-50"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">Producer address</label>
          <input
            value={producer}
            onChange={(e) => setProducer(e.target.value)}
            disabled={isBusy}
            className="w-full border-2 border-white bg-black px-3 py-2 text-sm font-mono outline-none transition focus:bg-white focus:text-black disabled:opacity-50"
            placeholder="0x..."
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-400">Collaborator address</label>
          <input
            value={collab}
            onChange={(e) => setCollab(e.target.value)}
            disabled={isBusy}
            className="w-full border-2 border-white bg-black px-3 py-2 text-sm font-mono outline-none transition focus:bg-white focus:text-black disabled:opacity-50"
            placeholder="0x..."
          />
        </div>

        {validation && (
          <div className="border-2 border-white bg-white p-3 text-sm text-black">
            <p className="font-bold uppercase tracking-widest">Check shares</p>
            <p className="mt-1">{validation}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isBusy || !address}
          className="w-full border-2 border-white bg-white px-4 py-3 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-black hover:text-white disabled:opacity-50"
        >
          {isBusy ? (isConfirming ? "Confirming on-chain…" : "Submitting…") : "Register track"}
        </button>

        {isSuccess && hash && (
          <div className="border-2 border-white bg-white p-4 text-black">
            <p className="text-sm font-bold uppercase tracking-widest">Track registered</p>
            <a
              href={getExplorerUrl(hash)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block break-all font-mono text-xs underline hover:text-black/70"
            >
              {hash}
            </a>
          </div>
        )}
      </form>
    </div>
  );
}
