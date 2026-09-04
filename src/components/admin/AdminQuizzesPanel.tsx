"use client";

import { useState } from "react";
import type { FormationQuiz, QuizQuestion, StudentQuizAttempt } from "@/lib/quiz/types";
import type { FormationLesson } from "@/lib/programme/types";

type Props = {
  initialQuizzes: FormationQuiz[];
  initialAttempts: StudentQuizAttempt[];
  lessons: FormationLesson[];
};

type QuestionDraft = {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
};

export function AdminQuizzesPanel({ initialQuizzes, initialAttempts, lessons }: Props) {
  const [quizzes, setQuizzes] = useState<FormationQuiz[]>(initialQuizzes);
  const [attempts, setAttempts] = useState<StudentQuizAttempt[]>(initialAttempts);
  const [activeTab, setActiveTab] = useState<"quizzes" | "attempts">("quizzes");
  const [editingQuiz, setEditingQuiz] = useState<FormationQuiz | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulaire d'édition / création de quiz
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [passingScore, setPassingScore] = useState(70);
  const [lessonId, setLessonId] = useState<string>("");
  const [active, setActive] = useState(true);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);

  function openCreate() {
    setEditingQuiz(null);
    setTitle("");
    setDescription("");
    setDurationMinutes(15);
    setPassingScore(70);
    setLessonId("");
    setActive(true);
    setQuestions([
      {
        question: "Exemple : Quel est l'objectif principal de ce module ?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctOptionIndex: 0,
        explanation: "Explication de la réponse...",
      },
    ]);
    setIsCreating(true);
    setError(null);
  }

  function openEdit(q: FormationQuiz) {
    setEditingQuiz(q);
    setTitle(q.title);
    setDescription(q.description);
    setDurationMinutes(q.durationMinutes);
    setPassingScore(q.passingScore);
    setLessonId(q.lessonId || "");
    setActive(q.active);
    setQuestions(
      (q.questions || []).map((quest) => ({
        question: quest.question,
        options: [...quest.options],
        correctOptionIndex: quest.correctOptionIndex,
        explanation: quest.explanation || "",
      })),
    );
    setIsCreating(true);
    setError(null);
  }

  function addQuestion() {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
        explanation: "",
      },
    ]);
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function updateQuestionText(index: number, text: string) {
    const next = [...questions];
    next[index].question = text;
    setQuestions(next);
  }

  function updateOptionText(qIndex: number, optIndex: number, text: string) {
    const next = [...questions];
    next[qIndex].options[optIndex] = text;
    setQuestions(next);
  }

  function setCorrectOption(qIndex: number, optIndex: number) {
    const next = [...questions];
    next[qIndex].correctOptionIndex = optIndex;
    setQuestions(next);
  }

  function updateExplanation(qIndex: number, text: string) {
    const next = [...questions];
    next[qIndex].explanation = text;
    setQuestions(next);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Le titre du test est requis.");
      return;
    }
    if (questions.length === 0) {
      setError("Ajoute au moins une question au test.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        action: editingQuiz ? "updateQuiz" : "createQuiz",
        id: editingQuiz?.id,
        title,
        description,
        durationMinutes,
        passingScore,
        lessonId: lessonId || null,
        active,
        questions: questions.map((q, idx) => ({
          sortOrder: idx + 1,
          question: q.question,
          options: q.options.filter((opt) => opt.trim().length > 0),
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation,
        })),
      };

      const res = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'enregistrement");

      // Rafraîchir la liste
      const listRes = await fetch("/api/admin/quizzes");
      const listData = await listRes.json();
      if (listData.quizzes) setQuizzes(listData.quizzes);

      setIsCreating(false);
      setEditingQuiz(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Es-tu sûr de vouloir supprimer définitivement ce test et ses résultats ?")) {
      return;
    }
    try {
      const res = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteQuiz", id }),
      });
      if (res.ok) {
        setQuizzes(quizzes.filter((q) => q.id !== id));
      }
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Tests & Quiz</h1>
          <p className="mt-1 text-sm text-[color:var(--neutral-600)]">
            Crée, gère les tests d'évaluation avec notation immédiate et suis les résultats des apprenants.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center rounded-xl bg-[color:var(--neutral-black)] px-4 py-2.5 text-sm font-medium text-[color:var(--neutral-50)] shadow-sm hover:opacity-90"
          >
            + Nouveau test
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-[color:var(--border)]">
        <button
          onClick={() => setActiveTab("quizzes")}
          className={`border-b-2 px-5 py-3 text-sm font-medium transition ${
            activeTab === "quizzes"
              ? "border-[color:var(--accent)] text-[color:var(--neutral-black)]"
              : "border-transparent text-[color:var(--neutral-500)] hover:text-[color:var(--neutral-black)]"
          }`}
        >
          Tous les tests ({quizzes.length})
        </button>
        <button
          onClick={() => setActiveTab("attempts")}
          className={`border-b-2 px-5 py-3 text-sm font-medium transition ${
            activeTab === "attempts"
              ? "border-[color:var(--accent)] text-[color:var(--neutral-black)]"
              : "border-transparent text-[color:var(--neutral-500)] hover:text-[color:var(--neutral-black)]"
          }`}
        >
          Résultats & Tentatives ({attempts.length})
        </button>
      </div>

      {/* Modal / Vue Formulaire d'édition / création */}
      {isCreating && (
        <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-4">
            <h2 className="font-display text-lg font-semibold">
              {editingQuiz ? `Modifier : ${editingQuiz.title}` : "Nouveau test d'évaluation"}
            </h2>
            <button
              onClick={() => setIsCreating(false)}
              className="text-sm text-[color:var(--neutral-500)] hover:text-black"
            >
              Fermer ✕
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-5 space-y-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-500)]">
                  Titre du test *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex : Évaluation 1 — Fondations IA & Python"
                  className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-3.5 py-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-500)]">
                  Lier à une leçon du programme (Optionnel)
                </label>
                <select
                  value={lessonId}
                  onChange={(e) => setLessonId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-3.5 py-2.5 text-sm outline-none focus:border-black"
                >
                  <option value="">-- Aucun lien (Test indépendant) --</option>
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      [{l.type}] {l.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-500)]">
                Description / Consignes
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Consignes données à l'apprenant avant de démarrer..."
                rows={2}
                className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-3.5 py-2.5 text-sm outline-none focus:border-black"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-500)]">
                  Durée estimée (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-3.5 py-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-500)]">
                  Score de passage minimum (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-3.5 py-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center pt-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="h-4 w-4 rounded accent-black"
                  />
                  <span>Test actif (visible par les apprenants)</span>
                </label>
              </div>
            </div>

            {/* Questions du test */}
            <div className="space-y-4 border-t border-[color:var(--border)] pt-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-medium text-base">Questions ({questions.length})</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="rounded-lg border border-[color:var(--border)] bg-[color:var(--neutral-100)] px-3 py-1.5 text-xs font-semibold hover:bg-neutral-200"
                >
                  + Ajouter une question
                </button>
              </div>

              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs font-semibold text-[color:var(--neutral-500)]">
                      Question #{qIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIdx)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Intitulé de la question..."
                    value={q.question}
                    onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                    className="w-full rounded-lg border border-[color:var(--border)] bg-white px-3 py-2 text-sm font-medium outline-none focus:border-black"
                  />

                  <div className="space-y-2 pt-1">
                    <p className="text-xs text-[color:var(--neutral-500)]">
                      Options de réponse (cochez le bouton radio pour définir la bonne réponse) :
                    </p>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct_${qIdx}`}
                          checked={q.correctOptionIndex === optIdx}
                          onChange={() => setCorrectOption(qIdx, optIdx)}
                          className="h-4 w-4 accent-emerald-600"
                          title="Marquer comme bonne réponse"
                        />
                        <input
                          type="text"
                          required
                          placeholder={`Option ${optIdx + 1}`}
                          value={opt}
                          onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                          className={`w-full rounded-lg border px-3 py-1.5 text-xs outline-none ${
                            q.correctOptionIndex === optIdx
                              ? "border-emerald-500 bg-emerald-50/50 font-medium"
                              : "border-[color:var(--border)] bg-white"
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Explication pédagogique (affichée après validation de l'apprenant)..."
                      value={q.explanation}
                      onChange={(e) => updateExplanation(qIdx, e.target.value)}
                      className="w-full rounded-lg border border-[color:var(--border)] bg-white px-3 py-1.5 text-xs text-[color:var(--neutral-600)] outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-[color:var(--border)] pt-4">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-xl border border-[color:var(--border)] px-4 py-2 text-sm text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[color:var(--neutral-black)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Enregistrement..." : editingQuiz ? "Mettre à jour" : "Créer le test"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Onglet 1 : Liste des Quizzes */}
      {activeTab === "quizzes" && (
        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-white p-12 text-center text-sm text-[color:var(--neutral-500)]">
              Aucun test créé pour le moment. Cliquez sur "+ Nouveau test" pour créer votre premier quiz d'évaluation.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex flex-col justify-between rounded-2xl border border-[color:var(--border)] bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          quiz.active ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {quiz.active ? "Actif" : "Désactivé"}
                      </span>
                      <span className="text-xs font-mono text-[color:var(--neutral-400)]">
                        {quiz.durationMinutes} min · {quiz.passingScore}% requis
                      </span>
                    </div>

                    <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">{quiz.title}</h3>
                    {quiz.description && (
                      <p className="mt-1 text-xs text-[color:var(--neutral-600)] line-clamp-2">
                        {quiz.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[color:var(--neutral-500)]">
                      <span>📝 {quiz.questions?.length || 0} questions</span>
                      {quiz.lessonId && (
                        <span className="rounded bg-neutral-100 px-2 py-0.5 font-mono">
                          Lié au programme
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2 border-t border-[color:var(--border)] pt-4">
                    <button
                      onClick={() => openEdit(quiz)}
                      className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[color:var(--neutral-100)]"
                    >
                      Modifier / Questions
                    </button>
                    <button
                      onClick={() => handleDelete(quiz.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Onglet 2 : Historique des tentatives des apprenants */}
      {activeTab === "attempts" && (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[color:var(--border)] bg-[color:var(--neutral-50)] text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-500)]">
                <tr>
                  <th className="px-5 py-3.5">Apprenant</th>
                  <th className="px-5 py-3.5">Test</th>
                  <th className="px-5 py-3.5">Score</th>
                  <th className="px-5 py-3.5">Statut</th>
                  <th className="px-5 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {attempts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-[color:var(--neutral-500)]">
                      Aucune tentative enregistrée pour le moment.
                    </td>
                  </tr>
                ) : (
                  attempts.map((att) => (
                    <tr key={att.id} className="hover:bg-[color:var(--neutral-50)]">
                      <td className="px-5 py-4">
                        <p className="font-medium text-[color:var(--neutral-black)]">
                          {att.studentName || "Apprenant"}
                        </p>
                        <p className="text-xs font-mono text-[color:var(--neutral-500)]">
                          {att.studentPhone || ""}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium">
                        {att.quizTitle || "Quiz"}
                      </td>
                      <td className="px-5 py-4 font-mono font-semibold text-sm">
                        {att.scorePercent}%
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            att.passed
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {att.passed ? "Validé" : "Échoué"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-[color:var(--neutral-500)]">
                        {new Date(att.completedAt).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
