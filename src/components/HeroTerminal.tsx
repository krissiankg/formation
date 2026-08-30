"use client";

import { useEffect, useState } from "react";

const lines = [
  "system.map()",
  "system.design()",
  "system.build()",
  "system.scale()",
];

export function HeroTerminal() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const full = lines[index];
    let i = 0;
    setTyped("");
    const typeId = window.setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) {
        window.clearInterval(typeId);
        window.setTimeout(() => {
          setIndex((v) => (v + 1) % lines.length);
        }, 1200);
      }
    }, 55);
    return () => window.clearInterval(typeId);
  }, [index]);

  return (
    <div className="terminal-in relative overflow-hidden rounded-[1.25rem] border border-[color:var(--border)] bg-[#171d17] p-5 text-[#f4f2e8] shadow-[0_30px_80px_rgba(23,29,23,0.18)]">
      <div className="pointer-events-none absolute -right-8 -top-10 size-40 rounded-full bg-[color:color-mix(in_srgb,var(--accent)_28%,transparent)] blur-2xl orb-one" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 size-36 rounded-full bg-[color:color-mix(in_srgb,var(--neutral-400)_35%,transparent)] blur-2xl orb-two" />

      <div className="relative flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#dc4c4c]" />
          <span className="size-2.5 rounded-full bg-[#aa9158]" />
          <span className="size-2.5 rounded-full bg-[#9ca493]" />
        </div>
        <p className="font-mono text-[11px] tracking-wide text-white/55">
          forge/system.ts
        </p>
        <span className="status-pulse size-2 rounded-full bg-[color:var(--accent)]" />
      </div>

      <div className="relative mt-5 font-mono text-sm leading-7">
        <p className="text-white/40">// cartographier le vrai flux de travail</p>
        <p className="mt-2">
          <span className="text-[color:var(--accent)]">const</span>{" "}
          <span className="text-white">resultat</span>{" "}
          <span className="text-white/50">=</span>{" "}
          <span className="text-[#c7c9bf]">{typed}</span>
          <span className="caret-blink ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] bg-[color:var(--accent)]" />
        </p>
        <p className="mt-4 text-white/45">
          0{index + 1} / 0{lines.length} · construire avec l&apos;IA
        </p>
      </div>

      <div className="relative mt-6 flex items-center justify-center py-4">
        <div className="orbit size-28 rounded-full border border-dashed border-white/15" />
        <div className="core-pulse absolute size-14 rounded-full bg-[color:color-mix(in_srgb,var(--accent)_55%,transparent)] blur-[1px]" />
        <div className="absolute size-3 rounded-full bg-[color:var(--accent)]" />
      </div>
    </div>
  );
}
