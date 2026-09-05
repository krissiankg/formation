"use client";

import { useState } from "react";
import type { StudentTestimonial, TestimonialStatus } from "@/lib/types";

export function AdminTestimonialsPanel({
  initialTestimonials,
}: {
  initialTestimonials: StudentTestimonial[];
}) {
  const [testimonials, setTestimonials] = useState<StudentTestimonial[]>(initialTestimonials);
  const [filter, setFilter] = useState<string>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = testimonials.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  async function handleStatusChange(id: string, newStatus: TestimonialStatus) {
    setLoadingId(id);
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.testimonial) {
        setTestimonials((prev) =>
          prev.map((t) => (t.id === id ? data.testimonial : t))
        );
      } else {
        alert(data.error || "Erreur lors de la mise à jour.");
      }
    } catch {
      alert("Erreur de communication avec le serveur.");
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Voulez-vous vraiment supprimer définitivement cet avis ?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch {
      alert("Erreur réseau.");
    } finally {
      setLoadingId(null);
    }
  }

  const statusColors = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[color:var(--border)] pb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[color:var(--neutral-black)]">
            Avis & Témoignages
          </h1>
          <p className="mt-1 text-sm text-[color:var(--neutral-600)]">
            Gérez et modérez les retours d'expérience déposés par les apprenants pour le site vitrine.
          </p>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-2">
          {["all", "pending", "approved", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                filter === st
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {st === "all" ? "Tous" : st === "pending" ? "En attente" : st === "approved" ? "Approuvés" : "Rejetés"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 text-center rounded-2xl border border-dashed border-gray-200 p-12">
          <p className="text-gray-500 text-sm">Aucun témoignage trouvé dans cette catégorie.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6 shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base text-[color:var(--neutral-black)]">
                      {item.studentName || "Apprenant inconnu"}
                    </h3>
                    <p className="text-xs text-[color:var(--neutral-500)]">{item.studentEmail}</p>
                    {item.roleOrProject ? (
                      <p className="mt-1 text-xs font-medium text-emerald-700 bg-emerald-50 inline-block px-2 py-0.5 rounded">
                        {item.roleOrProject}
                      </p>
                    ) : null}
                  </div>

                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                      statusColors[item.status]
                    }`}
                  >
                    {item.status === "pending"
                      ? "En attente"
                      : item.status === "approved"
                      ? "En ligne"
                      : "Rejeté"}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>{star <= item.rating ? "★" : "☆"}</span>
                  ))}
                  <span className="ml-1 text-xs font-bold text-gray-600">({item.rating}/5)</span>
                </div>

                <p className="mt-3 text-sm text-[color:var(--neutral-700)] leading-relaxed italic bg-white p-3.5 rounded-xl border border-gray-100">
                  « {item.content} »
                </p>

                <p className="mt-2 text-[10px] text-gray-400">
                  Déposé le {new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4">
                <div className="flex gap-2">
                  {item.status !== "approved" ? (
                    <button
                      type="button"
                      disabled={loadingId === item.id}
                      onClick={() => handleStatusChange(item.id, "approved")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition disabled:opacity-50"
                    >
                      ✓ Approuver & Publier
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={loadingId === item.id}
                      onClick={() => handleStatusChange(item.id, "pending")}
                      className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 transition disabled:opacity-50"
                    >
                      Remettre en attente
                    </button>
                  )}

                  {item.status !== "rejected" ? (
                    <button
                      type="button"
                      disabled={loadingId === item.id}
                      onClick={() => handleStatusChange(item.id, "rejected")}
                      className="rounded-lg bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-300 transition disabled:opacity-50"
                    >
                      Rejeter
                    </button>
                  ) : null}
                </div>

                <button
                  type="button"
                  disabled={loadingId === item.id}
                  onClick={() => handleDelete(item.id)}
                  className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
