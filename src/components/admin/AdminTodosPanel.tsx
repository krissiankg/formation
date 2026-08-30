"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/espace/shared";
import type { FormationTodo } from "@/lib/programme/types";

export function AdminTodosPanel({ todos }: { todos: FormationTodo[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function api(action: string, payload: Record<string, unknown> = {}) {
    setLoading(true);
    try {
      await fetch("/api/admin/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        kicker="À faire"
        title="Tâches de la semaine"
        description="Liste affichée sur le tableau de bord apprenant, section « À faire cette semaine »."
      />

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6">
        <h2 className="font-display text-xl">Ajouter une tâche</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            className="input-field min-w-[240px] flex-1"
            placeholder="Ex. Confirmer ta présence à la séance d'accueil"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            type="button"
            className="btn-primary"
            disabled={loading || !title.trim()}
            onClick={async () => {
              await api("create", { title });
              setTitle("");
            }}
          >
            Ajouter
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5">
        <h2 className="font-display text-xl">Tâches actives</h2>
        {todos.length === 0 ? (
          <p className="mt-4 text-sm text-[color:var(--neutral-500)]">Aucune tâche.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {todos.map((todo, i) => (
              <li
                key={todo.id}
                className={`flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-3 text-sm ${
                  !todo.active ? "opacity-50" : ""
                }`}
              >
                <div className="flex gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-lightest)] text-[10px] font-semibold text-[color:var(--accent-darkest)]">
                    {i + 1}
                  </span>
                  <span>{todo.title}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs accent-text hover:underline"
                    onClick={() => api("update", { id: todo.id, active: !todo.active })}
                  >
                    {todo.active ? "Désactiver" : "Activer"}
                  </button>
                  <button
                    type="button"
                    className="text-xs text-[color:var(--error)] hover:underline"
                    onClick={() => {
                      if (confirm("Supprimer cette tâche ?")) api("delete", { id: todo.id });
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
