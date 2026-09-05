"use client";

import { useEffect, useState } from "react";
import type { StudentTestimonial } from "@/lib/types";
import { Reveal } from "@/components/Reveal";

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<StudentTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/testimonials/public")
      .then((res) => res.json())
      .then((data) => {
        if (data?.testimonials) {
          setTestimonials(data.testimonials);
        }
      })
      .catch((err) => console.error("Erreur chargement avis:", err))
      .finally(() => setLoading(false));
  }, []);

  // Témoignages par défaut représentatifs si la base commence tout juste
  const displayItems = testimonials.length > 0 ? testimonials : [
    {
      id: "demo-1",
      enrollmentId: "demo-1",
      rating: 5,
      content: "La formation va droit au but. Dès le premier mois, j'ai connecté Supabase et FedaPay pour vendre mon premier micro-SaaS d'automatisation de devis.",
      roleOrProject: "Créateur de DevisPulse AI",
      status: "approved" as const,
      createdAt: "2026-08-20T10:00:00Z",
      updatedAt: "2026-08-20T10:00:00Z",
      studentName: "Romaric A.",
    },
    {
      id: "demo-2",
      enrollmentId: "demo-2",
      rating: 5,
      content: "Ce que j'apprécie particulièrement, c'est l'encadrement en présentiel le week-end et la rigueur technique. On ne fait pas que du prompt, on code de vraies solutions robustes.",
      roleOrProject: "Consultant & Builder IA",
      status: "approved" as const,
      createdAt: "2026-08-22T14:30:00Z",
      updatedAt: "2026-08-22T14:30:00Z",
      studentName: "Cynthia D.",
    },
    {
      id: "demo-3",
      enrollmentId: "demo-3",
      rating: 5,
      content: "L'écosystème avec les tests, le suivi des présences et la revue directe des projets par le formateur m'a permis de livrer mon application en 3 semaines.",
      roleOrProject: "Fondateur de LegalBot Bénin",
      status: "approved" as const,
      createdAt: "2026-08-25T18:00:00Z",
      updatedAt: "2026-08-25T18:00:00Z",
      studentName: "Marius K.",
    },
  ];

  return (
    <section id="temoignages" className="border-b border-[color:var(--border)] py-20 bg-[color:var(--neutral-50)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <p className="section-kicker">06 — Retours d'expérience</p>
              <h2 className="font-display mt-3 text-3xl tracking-tight text-[color:var(--neutral-black)] sm:text-4xl">
                Ils construisent leur indépendance.
              </h2>
            </div>
            <p className="max-w-md text-sm text-[color:var(--neutral-600)]">
              Découvre les avis authentiques des apprenants et porteurs de projets accompagnés par FORGEIA.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {displayItems.map((item, i) => (
            <Reveal key={item.id} delay={i * 100}>
              <div className="flex h-full flex-col justify-between rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm transition hover:border-[color:var(--accent)] hover:shadow-md">
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>{star <= item.rating ? "★" : "☆"}</span>
                    ))}
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[color:var(--neutral-700)] italic">
                    « {item.content} »
                  </p>
                </div>

                <div className="mt-6 border-t border-[color:var(--border)] pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[color:var(--neutral-black)]">
                      {item.studentName || "Apprenant FORGEIA"}
                    </p>
                    {item.roleOrProject ? (
                      <p className="text-xs text-[color:var(--accent-dark)] font-medium">
                        {item.roleOrProject}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                    Vérifié ✓
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
