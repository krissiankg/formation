"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CHECK_EVERY_MS = 3000;
const MAX_CHECKS = 20;

/**
 * Paiement de la préinscription depuis le compte. Au retour de FedaPay (`checking`),
 * la page se rafraîchit le temps que le webhook confirme le paiement.
 */
export function RegistrationPayment({ checking }: { checking: boolean }) {
  const router = useRouter();
  const [checks, setChecks] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const waiting = checking && checks < MAX_CHECKS;

  useEffect(() => {
    if (!waiting) return;
    const timer = setTimeout(() => {
      setChecks((n) => n + 1);
      router.refresh();
    }, CHECK_EVERY_MS);
    return () => clearTimeout(timer);
  }, [waiting, checks, router]);

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/paiements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "registration" }),
      });
      const data = (await res.json()) as { paymentUrl?: string; error?: string };
      if (!res.ok || !data.paymentUrl) throw new Error(data.error || "Impossible d'ouvrir le paiement.");
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'ouvrir le paiement.");
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.push("/connexion");
    router.refresh();
  }

  if (waiting) {
    return (
      <div className="mt-8 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-5 text-sm" role="status">
        <p className="flex items-center gap-2 font-semibold text-[color:var(--neutral-black)]">
          <span className="size-3 animate-pulse rounded-full bg-[color:var(--accent)]" aria-hidden />
          Vérification du paiement…
        </p>
        <p className="mt-1 text-[color:var(--neutral-600)]">
          FedaPay confirme ton paiement Mobile Money. Cela prend en général quelques secondes, ne ferme pas cette page.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-3">
      {checking ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Ton paiement n&apos;est pas encore confirmé. S&apos;il a échoué ou a été annulé, tu peux réessayer.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => void pay()} disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? "Ouverture de FedaPay…" : checking ? "Réessayer le paiement" : "Payer ma préinscription"}
        </button>
        <button type="button" onClick={() => void logout()} className="btn-ghost">
          Se déconnecter
        </button>
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
