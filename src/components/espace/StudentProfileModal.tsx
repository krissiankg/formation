"use client";

import { useState } from "react";
import Image from "next/image";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    fullName: string;
    email: string;
    whatsapp: string;
    avatarUrl?: string | null;
    scheduleLabel?: string;
  };
  onUpdateSuccess: (updated: { fullName: string; whatsapp: string; avatarUrl?: string | null }) => void;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
];

export function StudentProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateSuccess,
}: ProfileModalProps) {
  const [fullName, setFullName] = useState(user.fullName);
  const [whatsapp, setWhatsapp] = useState(user.whatsapp);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl || null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("L'image est trop volumineuse (maximum 2 Mo).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarUrl(result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (fullName.trim().length < 2) {
      setError("Le nom complet doit contenir au moins 2 caractères.");
      return;
    }

    if (password && password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          whatsapp: whatsapp.trim(),
          avatarUrl: avatarUrl || undefined,
          password: password ? password.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'enregistrement.");
      }

      setSuccess(true);
      onUpdateSuccess({
        fullName: fullName.trim(),
        whatsapp: whatsapp.trim(),
        avatarUrl,
      });

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError((err as Error).message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  const initialLetter = fullName.trim()[0]?.toUpperCase() || "A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-2xl animate-in zoom-in-95">
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[color:var(--accent)]/10 text-[color:var(--accent)] font-semibold text-lg">
              👤
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[color:var(--neutral-black)]">
                Mon Profil Apprenant
              </h3>
              <p className="text-xs text-[color:var(--neutral-500)]">
                Personnalise tes informations et ta photo de profil
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[color:var(--neutral-400)] hover:bg-[color:var(--neutral-100)] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-semibold">
            ✓ Profil mis à jour avec succès !
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Section 1 : Photo de profil */}
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-4">
            <label className="block text-xs font-semibold text-[color:var(--neutral-700)] mb-3">
              Photo de profil
            </label>

            <div className="flex items-center gap-4">
              {/* Grand aperçu */}
              <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-[color:var(--accent)] bg-white shadow-xs">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={fullName}
                    width={64}
                    height={64}
                    className="size-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-xl font-bold text-white">
                    {initialLetter}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--neutral-700)] shadow-2xs hover:bg-[color:var(--neutral-100)]">
                    <span>📷</span>
                    <span>Téléverser une photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl(null)}
                      className="text-xs text-[color:var(--neutral-500)] hover:text-red-600 underline cursor-pointer"
                    >
                      Supprimer
                    </button>
                  )}
                </div>

                {/* Suggestions prédéfinies */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[color:var(--neutral-400)]">Avatars :</span>
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className="relative size-6 overflow-hidden rounded-full border border-white hover:scale-110 transition cursor-pointer"
                    >
                      <Image
                        src={url}
                        alt="Avatar preset"
                        width={24}
                        height={24}
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 : Données personnelles */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[color:var(--neutral-700)] mb-1">
                Nom complet
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2.5 text-sm focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[color:var(--neutral-700)] mb-1">
                Email (Compte de formation)
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] px-3.5 py-2.5 text-sm text-[color:var(--neutral-500)] cursor-not-allowed"
              />
              <p className="mt-1 text-[10px] text-[color:var(--neutral-400)]">
                L&apos;email sert d&apos;identifiant unique de formation et ne peut être modifié.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[color:var(--neutral-700)] mb-1">
                Numéro WhatsApp
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2.5 text-sm focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/20"
              />
            </div>
          </div>

          {/* Section 3 : Mot de passe */}
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[color:var(--neutral-800)]">
                Sécurité & Mot de passe
              </span>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[11px] text-[color:var(--neutral-500)] hover:text-[color:var(--neutral-800)] cursor-pointer"
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>

            <div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nouveau mot de passe (min. 6 caractères)"
                className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs focus:border-[color:var(--accent)] focus:outline-none"
              />
            </div>

            {password && (
              <div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le nouveau mot de passe"
                  className="w-full rounded-xl border border-[color:var(--border)] bg-white px-3.5 py-2 text-xs focus:border-[color:var(--accent)] focus:outline-none"
                />
              </div>
            )}

            <p className="text-[10px] text-[color:var(--neutral-500)]">
              💡 Laisser vide pour conserver votre mode de connexion actuel. Définir un mot de passe vous permet de vous connecter directement sans code.
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-[color:var(--border)] bg-white px-4 py-2.5 text-xs font-semibold text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-100)] cursor-pointer disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:opacity-90 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="size-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Enregistrement...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
