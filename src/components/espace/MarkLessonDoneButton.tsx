"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkLessonDoneButton({ lessonId, nextHref }: { lessonId: string; nextHref: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/programme/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Impossible d'enregistrer ta progression.");
        return;
      }
      router.push(nextHref ?? "/espace/programme");
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button type="button" onClick={onClick} disabled={loading} className="btn-primary !py-2.5 text-sm">
        {loading ? "Enregistrement…" : "J'ai terminé cette leçon ✓"}
      </button>
      {error ? <p className="text-sm text-[color:var(--error)]">{error}</p> : null}
    </div>
  );
}
