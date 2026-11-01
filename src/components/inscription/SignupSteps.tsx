const STEPS = ["Ton compte", "Paiement", "Bienvenue"] as const;

/** Barre de progression de l'inscription : 1. Ton compte → 2. Paiement → 3. Bienvenue. */
export function SignupSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="mb-6 flex items-center gap-2 text-xs font-medium sm:text-sm" aria-label="Étapes de l'inscription">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                done || active
                  ? "bg-[color:var(--accent)] text-white"
                  : "bg-[color:var(--neutral-100)] text-[color:var(--neutral-500)]"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {done ? "✓" : step}
            </span>
            <span
              className={`truncate ${active ? "text-[color:var(--neutral-black)]" : "text-[color:var(--neutral-500)]"}`}
            >
              {label}
            </span>
            {step < STEPS.length ? <span className="h-px flex-1 bg-[color:var(--border)]" aria-hidden /> : null}
          </li>
        );
      })}
    </ol>
  );
}
