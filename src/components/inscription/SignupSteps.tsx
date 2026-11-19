const STEPS = ["Inscription", "WhatsApp", "Place réservée"] as const;

/**
 * Barre de progression de l'inscription : 1. Inscription → 2. Groupe WhatsApp (où se règle la préinscription)
 * → 3. Place réservée (préinscription validée par le formateur).
 */
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
              // Sur téléphone, seul le libellé de l'étape en cours tient sans être coupé.
              className={`truncate ${active ? "shrink-0 text-[color:var(--neutral-black)]" : "hidden text-[color:var(--neutral-500)] sm:inline"}`}
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
