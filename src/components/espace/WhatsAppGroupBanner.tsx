"use client";

import { useSyncExternalStore, useState } from "react";

const JOINED_KEY = "forgeia:whatsapp-group-joined";

function readJoined() {
  try {
    return window.localStorage.getItem(JOINED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Invitation à rejoindre le groupe WhatsApp, masquée une fois que l'apprenant a cliqué « C'est fait ». */
export function WhatsAppGroupBanner({ url }: { url: string | null }) {
  const storedJoined = useSyncExternalStore(
    () => () => {},
    readJoined,
    () => true,
  );
  const [dismissed, setDismissed] = useState(false);

  if (!url || storedJoined || dismissed) return null;

  function markJoined() {
    try {
      window.localStorage.setItem(JOINED_KEY, "1");
    } catch {
      // Stockage indisponible (navigation privée) : on masque seulement pour cette visite.
    }
    setDismissed(true);
  }

  return (
    <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#b7e4c7] bg-[#effaf3] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        <p className="font-display text-base font-bold text-[#0f5132]">👥 Rejoins le groupe WhatsApp FORGEIA</p>
        <p className="mt-0.5 text-sm text-[#256c46]">
          Annonces des séances, entraide et infos pratiques : tout passe par le groupe.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-[#128c4a] px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:opacity-90"
        >
          Rejoindre le groupe
        </a>
        <button
          type="button"
          onClick={markJoined}
          className="rounded-xl border border-[#b7e4c7] bg-white px-3 py-2 text-sm font-medium text-[#256c46] transition hover:bg-[#e3f5ea]"
        >
          C&apos;est fait
        </button>
      </div>
    </section>
  );
}
