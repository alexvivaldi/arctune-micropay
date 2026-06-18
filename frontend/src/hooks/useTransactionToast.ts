import { useEffect, useRef } from "react";
import { useToast } from "./useToast";

interface UseTransactionToastOptions {
  hash?: `0x${string}`;
  error?: Error | null;
  isSuccess?: boolean;
  pendingTitle?: string;
  successTitle?: string;
  errorTitle?: string;
  description?: string;
}

export function useTransactionToast({
  hash,
  error,
  isSuccess,
  pendingTitle = "Transaction submitted",
  successTitle = "Transaction confirmed",
  errorTitle = "Transaction failed",
  description,
}: UseTransactionToastOptions) {
  const { toast } = useToast();
  const lastHash = useRef<string | undefined>(undefined);
  const lastError = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (hash && hash !== lastHash.current) {
      lastHash.current = hash;
      toast({
        title: pendingTitle,
        description: description ?? "Waiting for on-chain confirmation…",
        txHash: hash,
      });
    }
  }, [hash, pendingTitle, description, toast]);

  useEffect(() => {
    if (isSuccess && hash) {
      toast({
        title: successTitle,
        description: description ?? "The transaction is confirmed.",
        txHash: hash,
      });
    }
  }, [isSuccess, hash, successTitle, description, toast]);

  useEffect(() => {
    if (error && error.message !== lastError.current) {
      lastError.current = error.message;
      toast({
        title: errorTitle,
        description: error.message,
        variant: "error",
      });
    }
  }, [error, errorTitle, toast]);
}
