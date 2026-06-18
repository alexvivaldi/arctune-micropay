import {
  useAccount,
  useBalance,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useDeployContract,
} from "wagmi";
import {
  MICROTUNE_ABI,
  MICROTUNE_BYTECODE,
  getMicroTuneAddress,
  isMicroTuneConfigured,
  ERC20_ABI,
  ARC_USDC_ADDRESS,
} from "@/lib/contract";
import { useCallback, useMemo } from "react";
import { Track } from "@/types/track";

export function useMicroTuneConfigured() {
  return useMemo(() => isMicroTuneConfigured(), []);
}

export function useMicroTuneContract() {
  return useMemo(() => {
    const address = getMicroTuneAddress();
    return { address, abi: MICROTUNE_ABI, configured: Boolean(address) };
  }, []);
}

export function useTrackCount() {
  const { address, abi, configured } = useMicroTuneContract();
  return useReadContract({
    address: address ?? undefined,
    abi,
    functionName: "getTrackCount",
    query: { enabled: configured, refetchInterval: 5_000 },
  });
}

export function useTrack(trackId: bigint) {
  const { address, abi, configured } = useMicroTuneContract();
  return useReadContract({
    address: address ?? undefined,
    abi,
    functionName: "getTrack",
    args: [trackId],
    query: { enabled: configured, refetchInterval: 5_000 },
  });
}

export function useTracks() {
  const { address, abi, configured } = useMicroTuneContract();
  const { data: count } = useTrackCount();

  const contracts = useMemo(() => {
    if (!count || !configured || !address) return [];
    const ids = Array.from({ length: Number(count) }, (_, i) => BigInt(i + 1));
    return ids.map((trackId) => ({
      address,
      abi,
      functionName: "getTrack" as const,
      args: [trackId] as const,
    }));
  }, [count, address, abi, configured]);

  const result = useReadContracts({
    contracts,
    query: {
      enabled: configured && contracts.length > 0,
      refetchInterval: 5_000,
    },
  });

  const tracks = useMemo<Track[]>(() => {
    if (!result.data) return [];
    return result.data
      .map((r) => (r.result as Track | undefined))
      .filter((t): t is Track => Boolean(t));
  }, [result.data]);

  return { ...result, tracks, count };
}

export function useListen() {
  const { address, abi, configured } = useMicroTuneContract();
  const { writeContract, data: hash, error, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const listen = useCallback(
    (trackId: bigint) => {
      if (!address || !configured) return;
      writeContract({
        address,
        abi,
        functionName: "listen",
        args: [trackId],
      });
    },
    [address, abi, configured, writeContract]
  );

  return { listen, hash, error, isPending, isConfirming, isSuccess, reset };
}

export function useUsdcAllowance() {
  const { address: account } = useAccount();
  const { address: contract } = useMicroTuneContract();
  return useReadContract({
    address: ARC_USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: account && contract ? [account, contract] : undefined,
    query: { enabled: Boolean(account && contract), refetchInterval: 5_000 },
  });
}

export function useApproveUsdc() {
  const { address: contract } = useMicroTuneContract();
  const { writeContract, data: hash, error, isPending, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = useCallback(
    (amount: bigint) => {
      if (!contract) return;
      writeContract({
        address: ARC_USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [contract, amount],
      });
    },
    [contract, writeContract]
  );

  return { approve, hash, error, isPending, isConfirming, isSuccess, reset };
}

export function useUsdcBalance() {
  const { address: account } = useAccount();
  return useBalance({
    address: account,
    query: { enabled: Boolean(account), refetchInterval: 5_000 },
  });
}

export function useDeployMicroTune() {
  const { deployContract, data: hash, error, isPending } = useDeployContract();
  const { data: receipt, isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deploy = useCallback(
    (usdcAddress: `0x${string}`, defaultPrice: bigint) => {
      deployContract({
        abi: MICROTUNE_ABI,
        bytecode: MICROTUNE_BYTECODE,
        args: [usdcAddress, defaultPrice],
      });
    },
    [deployContract]
  );

  return {
    deploy,
    hash,
    receipt,
    contractAddress: (receipt?.contractAddress as `0x${string}` | undefined) ?? null,
    error,
    isPending,
    isConfirming,
    isSuccess,
  };
}
