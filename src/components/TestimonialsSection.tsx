import type { StudentTestimonial } from "@/lib/types";
import { Reveal } from "@/components/Reveal";

/** Avis validés par l'admin. Sans avis réel, la section n'est pas affichée. */
export function TestimonialsSection({ testimonials }: { testimonials: StudentTestimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section id="temoignages" className="border-b border-[color:var(--border)] py-20 bg-[color:var(--neutral-50)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="section-kicker">Ils l&apos;ont suivie</p>
          <h2 className="font-display mt-3 text-3xl tracking-tight text-[color:var(--neutral-black)] sm:text-4xl">
            Ce qu&apos;en disent les apprenants.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.slice(0, 6).map((item, i) => (
            <Reveal key={item.id} delay={i * 100}>
              <div className="flex h-full flex-col justify-between rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
                <div>
                  <div className="flex items-center gap-1 text-amber-400" aria-label={`${item.rating} sur 5`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} aria-hidden>{star <= item.rating ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-[color:var(--neutral-700)] italic">
                    « {item.content} »
                  </p>
                </div>
                <div className="mt-6 border-t border-[color:var(--border)] pt-4">
                  <p className="text-sm font-bold text-[color:var(--neutral-black)]">
                    {item.studentName || "Apprenant FORGE IA"}
                  </p>
                  {item.roleOrProject ? (
                    <p className="text-xs text-[color:var(--accent-dark)] font-medium">{item.roleOrProject}</p>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
