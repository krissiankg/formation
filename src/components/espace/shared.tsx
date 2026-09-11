import Link from "next/link";
import { contact, formation } from "@/lib/config/formation";
import type { PaymentDisplayItem } from "@/lib/programme/payments";
import type {
  CurriculumLesson,
  CurriculumModule,
  ModuleStatus,
  StudentTodo,
} from "@/lib/programme/types";
import type { ContentItem } from "@/lib/store/content";
import type { FormationSession } from "@/lib/programme/types";
import { formatSessionDateLabel } from "@/lib/store/sessions";
import type { ScheduleId } from "@/lib/types";
import { formatFileSize, getFileIcon } from "@/lib/format";

export function PageHeader({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <p className="section-kicker">{kicker}</p>
      <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">{title}</h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-[color:var(--neutral-600)]">{description}</p>
      ) : null}
    </div>
  );
}

export function ProgressRing({ value }: { value: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="shrink-0 -rotate-90">
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="7" />
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke="#aa9158"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

export function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--neutral-500)]">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 truncate text-xs text-[color:var(--neutral-500)]">{hint}</p>
    </div>
  );
}

export function StatusPill({ status }: { status: ModuleStatus }) {
  const map = {
    current: {
      label: "En cours",
      className: "bg-[color:var(--accent-lightest)] text-[color:var(--accent-darkest)]",
    },
    completed: { label: "Terminé", className: "bg-[#e8f5e9] text-[#2e5a36]" },
    upcoming: {
      label: "À venir",
      className: "bg-[color:var(--neutral-100)] text-[color:var(--neutral-600)]",
    },
    locked: {
      label: "Verrouillé",
      className: "bg-[color:var(--neutral-100)] text-[color:var(--neutral-500)]",
    },
  } as const;
  const item = map[status];
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${item.className}`}>
      {item.label}
    </span>
  );
}

export function LessonRow({ lesson }: { lesson: CurriculumLesson }) {
  const locked = lesson.status === "locked" || lesson.status === "upcoming";
  const current = lesson.status === "current";

  return (
    <li
      className={`flex items-center gap-3 px-5 py-3.5 ${locked ? "opacity-60" : ""} ${
        current ? "bg-[color:var(--accent-lightest)]/50" : ""
      }`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs ${
          current
            ? "bg-[color:var(--neutral-black)] text-[color:var(--neutral-50)]"
            : locked
              ? "border border-[color:var(--border)] text-[color:var(--neutral-400)]"
              : "bg-[color:var(--accent)] text-[color:var(--neutral-black)]"
        }`}
        aria-hidden
      >
        {locked ? (
          <span className="size-2 rounded-sm bg-[color:var(--neutral-400)]" />
        ) : current ? (
          <span className="ml-0.5 border-y-[5px] border-l-[8px] border-y-transparent border-l-[color:var(--neutral-50)]" />
        ) : (
          <span className="text-[11px] font-bold">✓</span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[color:var(--neutral-black)]">
          {lesson.title}
        </p>
        <p className="mt-0.5 text-xs text-[color:var(--neutral-500)]">
          {lesson.type} · {lesson.duration}
        </p>
      </div>
      <span
        className={`rounded-full px-3 py-1.5 text-xs font-medium ${
          locked
            ? "text-[color:var(--neutral-400)]"
            : current
              ? "bg-[color:var(--neutral-black)] text-[color:var(--neutral-50)]"
              : "bg-[color:var(--accent-lightest)] text-[color:var(--accent-darkest)]"
        }`}
      >
        {locked ? "Bientôt" : current ? "En cours" : "Terminé"}
      </span>
    </li>
  );
}

export function ProgrammeList({ modules }: { modules: CurriculumModule[] }) {
  if (modules.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--neutral-50)] px-6 py-16 text-center">
        <p className="font-display text-xl">Programme en préparation</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--neutral-500)]">
          Le formateur configure les modules et les leçons. Reviens bientôt.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {modules.map((mod) => (
        <article
          key={mod.id}
          className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--accent-dark)]">
                {mod.monthLabel}
              </p>
              <h3 className="mt-1 text-lg font-semibold">{mod.title}</h3>
            </div>
            <div className="flex items-center gap-3">
              <StatusPill status={mod.status} />
              <span className="text-sm text-[color:var(--neutral-500)]">{mod.progress}%</span>
            </div>
          </div>
          <div className="h-1.5 bg-[color:var(--neutral-200)]">
            <div
              className="h-full bg-[color:var(--accent)] transition-all"
              style={{ width: `${mod.progress}%` }}
            />
          </div>
          <ul className="divide-y divide-[color:var(--border)]">
            {mod.lessons.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} />
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export function ResourcesPanel({ contents }: { contents: ContentItem[] }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[color:var(--border)]/60 pb-4">
        <div>
          <h2 className="font-display text-xl tracking-tight sm:text-2xl text-[color:var(--neutral-black)]">
            Supports & Documents de Formation
          </h2>
          <p className="mt-1 text-xs text-[color:var(--neutral-600)]">
            Retrouve ici les supports de cours, packages, exercices et fichiers lourds mis à disposition par ton formateur.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-white px-3 py-1 font-mono text-xs border border-[color:var(--border)] text-[color:var(--neutral-700)] shadow-2xs">
          📚 {contents.length} ressource{contents.length > 1 ? "s" : ""}
        </span>
      </div>

      {contents.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--neutral-100)] px-5 py-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white border border-[color:var(--border)] text-xl shadow-2xs mb-3">
            📚
          </div>
          <p className="font-semibold text-sm text-[color:var(--neutral-black)]">
            Aucun support partagé pour le moment
          </p>
          <p className="mx-auto mt-1 max-w-md text-xs text-[color:var(--neutral-500)] leading-relaxed">
            Dès que le formateur publie un support, un code ou des fichiers joints, ils apparaîtront instantanément ici et tu recevras une alerte WhatsApp.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {contents.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-[color:var(--border)] bg-white p-5 sm:p-6 shadow-xs transition hover:border-[color:var(--accent)]/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[color:var(--border)]/60">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-[color:var(--neutral-100)] px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[color:var(--neutral-700)]">
                    {c.kind}
                  </span>
                  <span className="text-xs text-[color:var(--neutral-400)]">•</span>
                  <time className="font-mono text-xs text-[color:var(--neutral-500)]">
                    {new Date(c.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                </div>
              </div>

              <h3 className="mt-3 font-display text-lg sm:text-xl font-bold tracking-tight text-[color:var(--neutral-black)]">
                {c.title}
              </h3>

              <div className="mt-2 whitespace-pre-wrap text-xs sm:text-sm text-[color:var(--neutral-600)] leading-relaxed">
                {c.body}
              </div>

              {/* Pièces jointes téléchargeables */}
              {c.attachments && c.attachments.length > 0 && (
                <div className="mt-5 pt-4 border-t border-[color:var(--border)]/70">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-500)] mb-3">
                    📎 Fichiers téléchargeables ({c.attachments.length})
                  </span>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {c.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.url}
                        download={att.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-3 hover:bg-[color:var(--accent)]/5 hover:border-[color:var(--accent)] transition shadow-2xs cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white border border-[color:var(--border)] text-lg shadow-2xs group-hover:scale-105 transition">
                            {getFileIcon(att.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs text-[color:var(--neutral-800)] truncate group-hover:text-[color:var(--accent)] transition">
                              {att.name}
                            </p>
                            <p className="font-mono text-[10px] text-[color:var(--neutral-500)] mt-0.5">
                              {att.formattedSize || formatFileSize(att.size)}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-[color:var(--neutral-700)] border border-[color:var(--border)] group-hover:bg-[color:var(--accent)] group-hover:text-white group-hover:border-transparent transition shadow-2xs">
                          <span>⬇️</span>
                          <span className="hidden sm:inline">Télécharger</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PaymentRow({
  label,
  amount,
  status,
}: {
  label: string;
  amount: string;
  status: PaymentDisplayItem["status"];
}) {
  const colors = {
    payé: "text-[#2e5a36] bg-[#e8f5e9]",
    "à venir": "text-[color:var(--accent-darkest)] bg-[color:var(--accent-lightest)]",
    planifié: "text-[color:var(--neutral-600)] bg-[color:var(--neutral-100)]",
  };
  return (
    <li className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] pb-4 last:border-0 last:pb-0">
      <div>
        <p className="font-medium text-[color:var(--neutral-black)]">{label}</p>
        <p className="text-sm text-[color:var(--neutral-500)]">{amount}</p>
      </div>
      <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${colors[status]}`}>
        {status}
      </span>
    </li>
  );
}

export function PaymentsPanel({ items }: { items: PaymentDisplayItem[] }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6">
      <h2 className="font-display text-xl tracking-tight sm:text-2xl">Échéancier</h2>
      {items.length === 0 ? (
        <p className="mt-5 text-sm text-[color:var(--neutral-500)]">
          Aucun paiement enregistré pour ton inscription.
        </p>
      ) : (
        <ul className="mt-5 space-y-4 text-sm">
          {items.map((item) => (
            <PaymentRow
              key={item.kind}
              label={item.label}
              amount={item.amount}
              status={item.status}
            />
          ))}
        </ul>
      )}
      <div className="mt-6 rounded-xl bg-[color:var(--neutral-100)] p-4 text-sm text-[color:var(--neutral-600)]">
        Total formation :{" "}
        <span className="font-semibold text-[color:var(--neutral-black)]">
          {formation.totalPrice.toLocaleString("fr-FR")} {formation.currencyLabel}
        </span>{" "}
        · Paiement par Mobile Money
      </div>
    </div>
  );
}

export function TestsPanel({ tests }: { tests: CurriculumLesson[] }) {
  const available = tests.filter((t) => t.status === "current" || t.status === "completed");

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6">
      <h2 className="font-display text-xl tracking-tight sm:text-2xl">
        Tests & validation
      </h2>
      <p className="mt-2 text-sm text-[color:var(--neutral-600)]">
        Les quiz se débloquent après certaines séances pour valider tes acquis.
      </p>
      {available.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--neutral-100)] px-5 py-10 text-center text-sm text-[color:var(--neutral-500)]">
          Aucun test disponible pour le moment.
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {available.map((test) => (
            <li
              key={test.id}
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{test.title}</p>
                  <p className="mt-1 text-xs text-[color:var(--neutral-500)]">
                    Durée estimée · {test.duration}
                  </p>
                  {test.body ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-[color:var(--neutral-600)]">
                      {test.body}
                    </p>
                  ) : null}
                </div>
                <StatusPill status={test.status === "completed" ? "completed" : "current"} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TodoPanel({ todos }: { todos: StudentTodo[] }) {
  if (todos.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5">
      <h2 className="font-display text-xl">À faire cette semaine</h2>
      <ul className="mt-4 space-y-3">
        {todos.map((item, i) => (
          <li
            key={item.id}
            className={`flex gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-3 text-sm ${
              item.completed ? "opacity-60" : ""
            }`}
          >
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-lightest)] text-[10px] font-semibold text-[color:var(--accent-darkest)]">
              {item.completed ? "✓" : i + 1}
            </span>
            <span
              className={`text-[color:var(--neutral-700)] ${item.completed ? "line-through" : ""}`}
            >
              {item.title}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SessionCard({
  session,
  schedule,
}: {
  session: FormationSession;
  schedule: ScheduleId;
}) {
  const dateLabel = formatSessionDateLabel(session.sessionDate, schedule);

  return (
    <section className="rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent-lightest)] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--accent-darkest)]">
            Prochaine séance présentielle
          </p>
          <h2 className="font-display mt-2 text-2xl tracking-tight">{session.title}</h2>
          <p className="mt-2 text-sm text-[color:var(--neutral-600)]">
            {dateLabel} · {session.hours}
          </p>
          <p className="mt-1 text-sm text-[color:var(--neutral-500)]">{session.location}</p>
        </div>
        <span className="rounded-full bg-[color:var(--neutral-black)] px-3 py-1 text-xs font-medium text-[color:var(--neutral-50)]">
          À venir
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/espace/programme" className="btn-primary !py-2.5 text-sm">
          Préparer ma séance
        </Link>
      </div>
    </section>
  );
}

export function HelpPanel() {
  return (
    <section className="rounded-2xl border border-[color:var(--border)] bg-[#171d17] p-5 text-[#fbfaf4]">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--accent)]">
        Besoin d&apos;aide ?
      </p>
      <p className="mt-2 text-sm text-white/65">
        Une question sur une séance ou un outil ? Contacte le formateur via WhatsApp.
      </p>
      <a
        href={contact.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary mt-4 inline-flex !bg-[color:var(--accent)] !text-[color:var(--neutral-black)] hover:!bg-[color:var(--accent-light)]"
      >
        Contacter le formateur
      </a>
    </section>
  );
}
