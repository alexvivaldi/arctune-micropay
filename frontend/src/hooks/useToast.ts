import { useToast as useToastInternal } from "@/components/ToastProvider";

export function useToast() {
  return useToastInternal();
}
