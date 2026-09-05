"use client";

import { useState } from "react";
import type { StudentTestimonial } from "@/lib/types";

export function StudentTestimonialClient({
  initialTestimonial,
}: {
  initialTestimonial: StudentTestimonial | null;
}) {
  const [testimonial, setTestimonial] = useState<StudentTestimonial | null>(initialTestimonial);
  const [rating, setRating] = useState<number>(initialTestimonial?.rating || 5);
  const [content, setContent] = useState<string>(initialTestimonial?.content || "");
  const [roleOrProject, setRoleOrProject] = useState<string>(initialTestimonial?.roleOrProject || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content, roleOrProject }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Erreur lors de l'envoi." });
        setLoading(false);
        return;
      }

      setTestimonial(data.testimonial);
      setMessage({
        type: "success",
        text: "Merci pour ton retour ! Ton avis a été transmis et sera publié après validation de l'équipe.",
      });
    } catch {
      setMessage({ type: "error", text: "Erreur réseau. Veuillez réessayer." });
    } finally {
      setLoading(false);
    }
  }

  const statusBadges = {
    pending: { label: "En attente de modération", class: "bg-amber-100 text-amber-800" },
    approved: { label: "Validé & Publié sur le site", class: "bg-emerald-100 text-emerald-800" },
    rejected: { label: "Non retenu", class: "bg-red-100 text-red-800" },
  };

  return (
    <div className="space-y-6">
      {testimonial ? (
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[color:var(--neutral-500)]">
                Ton avis actuel
              </p>
              <div className="mt-1 flex items-center gap-1 text-amber-500 text-lg">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>{star <= testimonial.rating ? "★" : "☆"}</span>
                ))}
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                statusBadges[testimonial.status]?.class || "bg-gray-100 text-gray-700"
              }`}
            >
              {statusBadges[testimonial.status]?.label || testimonial.status}
            </span>
          </div>

          <p className="mt-4 italic text-sm text-[color:var(--neutral-700)] bg-[color:var(--neutral-100)] p-4 rounded-xl">
            « {testimonial.content} »
          </p>

          {testimonial.roleOrProject ? (
            <p className="mt-2 text-xs text-[color:var(--neutral-500)]">
              Projet / Titre associé : <span className="font-medium text-black">{testimonial.roleOrProject}</span>
            </p>
          ) : null}

          <p className="mt-4 text-xs text-[color:var(--neutral-400)]">
            Tu peux modifier ton avis ci-dessous à tout moment :
          </p>
        </div>
      ) : null}

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6 space-y-5"
      >
        <h3 className="font-display text-lg font-bold text-[color:var(--neutral-black)]">
          {testimonial ? "Mettre à jour mon avis" : "Laisser mon avis sur FORGEIA"}
        </h3>

        {message ? (
          <div
            className={`rounded-xl p-4 text-sm ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-700)] mb-2">
            Ta note globale (sur 5)
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="text-2xl transition hover:scale-110 focus:outline-none"
              >
                <span className={star <= rating ? "text-amber-400" : "text-gray-300"}>★</span>
              </button>
            ))}
            <span className="ml-2 text-sm font-bold text-[color:var(--neutral-700)]">
              {rating} / 5
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-700)] mb-1">
            Nom de ton projet SaaS ou rôle (Optionnel)
          </label>
          <input
            type="text"
            placeholder="Ex : Fondateur de DocuScan AI / Développeur Web"
            value={roleOrProject}
            onChange={(e) => setRoleOrProject(e.target.value)}
            className="w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[color:var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-700)] mb-1">
            Ton retour d'expérience & témoignage *
          </label>
          <textarea
            rows={4}
            required
            minLength={10}
            placeholder="Explique ce que la formation t'apporte, la qualité des cours, les projets construits, la valeur reçue..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[color:var(--accent)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary !bg-[color:var(--accent)] !text-black hover:!bg-[color:var(--accent-light)] !px-6 !py-2.5 text-sm font-semibold"
        >
          {loading ? "Envoi en cours..." : testimonial ? "Enregistrer les modifications" : "Envoyer mon témoignage"}
        </button>
      </form>
    </div>
  );
}
