"use client";

import { ReactNode, useEffect, useState, ComponentType } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
  const [Providers, setProviders] = useState<ComponentType<{ children: ReactNode }> | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("./providers").then((m) => {
      if (!cancelled) setProviders(() => m.Providers);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Providers) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-arc-300 border-t-arc-600" />
          <p className="text-sm text-zinc-500">Loading ArcTune...</p>
        </div>
      </div>
    );
  }

  return <Providers>{children}</Providers>;
}
