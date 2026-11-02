"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

/** Hauteur de défilement (px) à partir de laquelle le bouton du haut de page n'est plus visible. */
const SHOW_AFTER_PX = 560;

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** Bouton d'inscription collé en bas de l'écran sur mobile, une fois le haut de page dépassé. */
export function MobileCtaBar({ label, hint }: { label: string; hint: string | null }) {
  const visible = useSyncExternalStore(
    subscribe,
    () => window.scrollY > SHOW_AFTER_PX,
    () => false,
  );

  return (
    <div
      data-visible={visible}
      aria-hidden={!visible}
      className="mobile-cta-bar fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--neutral-50)_94%,transparent)] px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl transition-transform duration-300 data-[visible=false]:pointer-events-none data-[visible=false]:translate-y-full md:hidden"
    >
      <Link href="/inscription" tabIndex={visible ? 0 : -1} className="btn-primary w-full text-sm">
        {label}
      </Link>
      {hint ? (
        <p className="mt-1.5 text-center text-xs font-medium text-[color:var(--accent-dark)]">{hint}</p>
      ) : null}
    </div>
  );
}
