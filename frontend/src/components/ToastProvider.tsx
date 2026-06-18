"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getExplorerUrl } from "@/lib/contract";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  txHash?: `0x${string}`;
  variant?: "success" | "error";
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), item.variant === "error" ? 8000 : 6000);
    return () => clearTimeout(timer);
  }, [item, onDismiss]);

  const isError = item.variant === "error";

  return (
    <div
      className={`pointer-events-auto flex w-80 flex-col gap-1 border-2 p-4 shadow-lg transition ${
        isError
          ? "border-white bg-white text-black"
          : "border-white bg-black text-white"
      }`}
      role="status"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold uppercase tracking-widest">{item.title}</p>
        <button
          onClick={() => onDismiss(item.id)}
          className="text-xs font-bold uppercase hover:opacity-70"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      {item.description && (
        <p className="text-xs leading-relaxed opacity-80">{item.description}</p>
      )}
      {item.txHash && (
        <a
          href={getExplorerUrl(item.txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 break-all font-mono text-xs underline hover:opacity-70"
        >
          {item.txHash.slice(0, 14)}…{item.txHash.slice(-12)}
        </a>
      )}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toast = useCallback((item: Omit<ToastItem, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { ...item, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const container = mounted ? (
    <div className="fixed bottom-4 right-4 z-[2147483647] flex flex-col gap-3">
      {toasts.map((item) => (
        <Toast key={item.id} item={item} onDismiss={dismiss} />
      ))}
    </div>
  ) : null;

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted ? createPortal(container, document.body) : container}
    </ToastContext.Provider>
  );
}
