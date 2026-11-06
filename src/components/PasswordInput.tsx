"use client";

import { useState, type ComponentProps } from "react";

type PasswordInputProps = Omit<ComponentProps<"input">, "type">;

/** Champ mot de passe avec, dans son coin, un œil pour afficher ou masquer ce qui est saisi. */
export function PasswordInput({ className = "", ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className={`${className} !pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-[color:var(--neutral-500)] transition-colors hover:text-[color:var(--accent)] focus-visible:text-[color:var(--accent)]"
      >
        <EyeIcon open={visible} />
      </button>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {open ? null : <path d="m3 3 18 18" />}
    </svg>
  );
}
