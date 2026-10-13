import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LessonMarkdown } from "@/components/espace/LessonMarkdown";
import { MarkLessonDoneButton } from "@/components/espace/MarkLessonDoneButton";
import { brand } from "@/lib/config/formation";
import { LESSON_TYPE_LABELS } from "@/lib/programme/lesson-types";
import { getStudentContext } from "@/lib/store/student-context";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Leçon — ${brand.name}`,
};

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const ctx = await getStudentContext();
  if (!ctx) redirect("/connexion");

  const ordered = ctx.progress.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleLabel: m.monthLabel, moduleTitle: m.title })),
  );
  const index = ordered.findIndex((l) => l.id === lessonId);
  if (index === -1) notFound();

  const lesson = ordered[index];
  const prev = index > 0 ? ordered[index - 1] : null;
  const next = index < ordered.length - 1 ? ordered[index + 1] : null;
  const locked = lesson.status === "locked" || lesson.status === "upcoming";
  const isQuiz = lesson.type === "test";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/espace/programme" className="text-sm accent-text hover:underline">
        ← Mon programme
      </Link>

      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--accent-dark)]">
        {lesson.moduleLabel} · {LESSON_TYPE_LABELS[lesson.type] ?? lesson.type} · {lesson.duration}
      </p>
      <h1 className="font-display mt-2 text-2xl tracking-tight sm:text-3xl">{lesson.title}</h1>

      {locked ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--neutral-50)] px-6 py-12 text-center">
          <p className="font-display text-xl">Bientôt disponible</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--neutral-500)]">
            Cette leçon se débloque quand tu as terminé les précédentes. Continue ton parcours dans l&apos;ordre.
          </p>
        </div>
      ) : (
        <>
          <article className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-8">
            {lesson.body.trim() ? (
              <LessonMarkdown source={lesson.body} />
            ) : (
              <p className="text-sm text-[color:var(--neutral-500)]">Le contenu de cette leçon sera publié bientôt.</p>
            )}
          </article>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            {isQuiz ? (
              <Link href="/espace/tests" className="btn-primary !py-2.5 text-sm">
                Passer le quiz →
              </Link>
            ) : lesson.status === "current" ? (
              <MarkLessonDoneButton lessonId={lesson.id} nextHref={next ? `/espace/programme/${next.id}` : null} />
            ) : (
              <span className="text-sm text-[color:var(--neutral-500)]">✓ Leçon terminée</span>
            )}
          </div>
        </>
      )}

      <nav className="mt-10 flex justify-between gap-4 border-t border-[color:var(--border)] pt-6 text-sm">
        {prev ? (
          <Link href={`/espace/programme/${prev.id}`} className="accent-text hover:underline">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && next.status !== "locked" && next.status !== "upcoming" ? (
          <Link href={`/espace/programme/${next.id}`} className="text-right accent-text hover:underline">
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
