"use client";

import { useEffect, useState } from "react";
import { brand } from "@/lib/config/formation";

export function BootLoader({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      setProgress((p) => Math.min(100, p + (frame < 8 ? 12 : 6)));
    }, 70);

    const done = window.setTimeout(() => {
      setReady(true);
      window.clearInterval(id);
    }, 1400);

    return () => {
      window.clearInterval(id);
      window.clearTimeout(done);
    };
  }, []);

  if (ready) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[color:var(--neutral-50)]">
      <div className="scan-line" />
      <div className="relative w-full max-w-sm px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[color:var(--accent-dark)]">
          {brand.name}
        </p>
        <h1 className="font-display mt-4 text-3xl italic text-[color:var(--neutral-black)]">
          Initialisation des systèmes ...
        </h1>
        <div className="mx-auto mt-8 h-[2px] w-full overflow-hidden rounded-full bg-[color:var(--neutral-200)]">
          <div
            className="h-full bg-[color:var(--accent)] transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="font-mono mt-3 text-sm text-[color:var(--neutral-500)]">
          {progress}%
        </p>
      </div>
    </div>
  );
}

