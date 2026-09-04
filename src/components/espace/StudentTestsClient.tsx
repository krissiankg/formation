"use client";

import { useState } from "react";
import type { QuizWithStatus } from "@/lib/quiz/types";

type Props = {
  quizzes: QuizWithStatus[];
};

type ActiveQuiz = {
  id: string;
  title: string;
  durationMinutes: number;
  passingScore: number;
  questions: {
    id: string;
    question: string;
    options: string[];
  }[];
};

type Result = {
  scorePercent: number;
  passed: boolean;
  correctAnswersCount: number;
  totalQuestions: number;
  explanations: Record<string, { correctOptionIndex: number; explanation?: string }>;
};

export function StudentTestsClient({ quizzes: initialQuizzes }: Props) {
  const [quizzes, setQuizzes] = useState<QuizWithStatus[]>(initialQuizzes);
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startQuiz(quizId: string) {
    setLoadingQuiz(true);
    setError(null);
    setResult(null);
    setAnswers({});

    try {
      const res = await fetch(`/api/quizzes?id=${quizId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossible de charger le test");
      setActiveQuiz(data.quiz);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingQuiz(false);
    }
  }

  function handleSelectOption(questionId: string, optionIndex: number) {
    if (result) return; // Ne plus modifier si le test est déjà validé/soumis
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  }

  async function handleSubmit() {
    if (!activeQuiz) return;

    // Vérifier si toutes les questions ont reçu une réponse
    const unanswered = activeQuiz.questions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      if (
        !confirm(
          `Tu n'as pas répondu à ${unanswered.length} question(s). Veux-tu quand même soumettre ton test ?`,
        )
      ) {
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      const payloadAnswers = activeQuiz.questions.map((q) => ({
        questionId: q.id,
        selectedOption: answers[q.id] !== undefined ? answers[q.id] : -1,
      }));

      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: activeQuiz.id,
          answers: payloadAnswers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la validation");

      setResult({
        scorePercent: data.scorePercent,
        passed: data.passed,
        correctAnswersCount: data.correctAnswersCount,
        totalQuestions: data.totalQuestions,
        explanations: data.explanations || {},
      });

      // Rafraîchir l'état des quizzes en arrière-plan
      const refreshRes = await fetch("/api/quizzes");
      const refreshData = await refreshRes.json();
      if (refreshData.quizzes) {
        setQuizzes(refreshData.quizzes);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Si un quiz est en cours */}
      {activeQuiz ? (
        <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm sm:p-8 space-y-6">
          <div className="flex flex-col gap-2 border-b border-[color:var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[color:var(--neutral-400)]">
                Évaluation en direct
              </span>
              <h2 className="font-display text-2xl font-bold tracking-tight">{activeQuiz.title}</h2>
            </div>
            <button
              onClick={() => {
                if (result || confirm("Quitter le test ? Tes réponses non validées seront perdues.")) {
                  setActiveQuiz(null);
                  setResult(null);
                }
              }}
              className="self-start rounded-xl border border-[color:var(--border)] px-4 py-2 text-xs font-semibold text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)]"
            >
              ← Retour à la liste
            </button>
          </div>

          {/* Résultat immédiat si soumis */}
          {result && (
            <div
              className={`rounded-2xl p-6 text-center ${
                result.passed
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border border-red-200 bg-red-50 text-red-900"
              }`}
            >
              <p className="font-display text-3xl font-bold">
                {result.scorePercent}% {result.passed ? "🎉 Validé !" : "❌ Score insuffisant"}
              </p>
              <p className="mt-2 text-sm">
                Tu as obtenu <strong>{result.correctAnswersCount}</strong> sur <strong>{result.totalQuestions}</strong> bonnes réponses.
                {result.passed
                  ? " Félicitations, tes acquis sont validés !"
                  : ` Le score minimum requis est de ${activeQuiz.passingScore}%. Tu peux réviser et retenter le test.`}
              </p>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-6">
            {activeQuiz.questions.map((q, qIndex) => {
              const selectedOpt = answers[q.id];
              const explanationInfo = result?.explanations?.[q.id];
              const isCorrect = explanationInfo ? selectedOpt === explanationInfo.correctOptionIndex : null;

              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-5 transition ${
                    result
                      ? isCorrect
                        ? "border-emerald-300 bg-emerald-50/30"
                        : "border-red-300 bg-red-50/30"
                      : "border-[color:var(--border)] bg-[color:var(--neutral-50)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--neutral-black)] text-xs font-mono font-bold text-white">
                      {qIndex + 1}
                    </span>
                    <p className="font-semibold text-base text-[color:var(--neutral-black)]">
                      {q.question}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2.5 pl-9">
                    {q.options.map((opt, optIndex) => {
                      const isSelected = selectedOpt === optIndex;
                      const isOptionCorrect = explanationInfo?.correctOptionIndex === optIndex;

                      let optStyle = "border-[color:var(--border)] bg-white hover:border-black";
                      if (result) {
                        if (isOptionCorrect) {
                          optStyle = "border-emerald-500 bg-emerald-100/70 text-emerald-900 font-semibold";
                        } else if (isSelected && !isOptionCorrect) {
                          optStyle = "border-red-500 bg-red-100/70 text-red-900 line-through";
                        } else {
                          optStyle = "border-neutral-200 bg-white/50 text-neutral-400";
                        }
                      } else if (isSelected) {
                        optStyle = "border-black bg-neutral-900 text-white font-medium";
                      }

                      return (
                        <button
                          key={optIndex}
                          type="button"
                          disabled={Boolean(result)}
                          onClick={() => handleSelectOption(q.id, optIndex)}
                          className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-sm transition ${optStyle}`}
                        >
                          <span>{opt}</span>
                          {result && isOptionCorrect && (
                            <span className="text-xs font-bold text-emerald-700">✓ Bonne réponse</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explication pédagogique immédiate */}
                  {explanationInfo?.explanation && (
                    <div className="mt-4 ml-9 rounded-lg bg-white/80 p-3 text-xs text-[color:var(--neutral-600)] border border-[color:var(--border)]">
                      <span className="font-semibold text-[color:var(--neutral-black)]">💡 Explication :</span>{" "}
                      {explanationInfo.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bouton de validation */}
          <div className="flex justify-end gap-3 border-t border-[color:var(--border)] pt-5">
            {result ? (
              <button
                type="button"
                onClick={() => {
                  setActiveQuiz(null);
                  setResult(null);
                }}
                className="rounded-xl bg-[color:var(--neutral-black)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Terminer & Retourner aux tests
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="rounded-xl bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
              >
                {submitting ? "Correction en cours..." : "Valider mes réponses 🚀"}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Liste des tests disponibles */
        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-white p-12 text-center text-sm text-[color:var(--neutral-500)]">
              Aucun test n'est actuellement programmé. Ils se débloqueront au fil de tes modules de formation.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {quizzes.map((quiz) => {
                const isPassed = quiz.status === "passed";
                const isFailed = quiz.status === "failed";

                return (
                  <div
                    key={quiz.id}
                    className="flex flex-col justify-between rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isPassed
                              ? "bg-emerald-100 text-emerald-800"
                              : isFailed
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {isPassed ? "✓ Validé" : isFailed ? "À retenter" : "Disponible"}
                        </span>
                        <span className="font-mono text-xs text-[color:var(--neutral-400)]">
                          {quiz.durationMinutes} min · {quiz.passingScore}% requis
                        </span>
                      </div>

                      <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-[color:var(--neutral-black)]">
                        {quiz.title}
                      </h3>

                      {quiz.description && (
                        <p className="mt-1 text-xs text-[color:var(--neutral-600)] line-clamp-2">
                          {quiz.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center gap-3 text-xs text-[color:var(--neutral-500)]">
                        <span>📝 {quiz.questionCount} questions</span>
                        {quiz.lastAttempt && (
                          <span className="font-semibold text-[color:var(--neutral-black)]">
                            Dernier score : {quiz.lastAttempt.scorePercent}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-[color:var(--border)] pt-4">
                      <button
                        onClick={() => startQuiz(quiz.id)}
                        disabled={loadingQuiz}
                        className={`w-full rounded-xl py-2.5 text-xs font-semibold transition ${
                          isPassed
                            ? "border border-[color:var(--border)] bg-neutral-50 text-[color:var(--neutral-700)] hover:bg-neutral-100"
                            : "bg-[color:var(--neutral-black)] text-white hover:opacity-90"
                        }`}
                      >
                        {isPassed ? "Revoir / Retenter le test" : isFailed ? "Retenter le test" : "Démarrer le test →"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
