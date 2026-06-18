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
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin border-4 border-white border-t-transparent" />
          <p className="text-sm uppercase tracking-widest text-gray-400">Loading ArcTune</p>
        </div>
      </div>
    );
  }

  return <Providers>{children}</Providers>;
}
