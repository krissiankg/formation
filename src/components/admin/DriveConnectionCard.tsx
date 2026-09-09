"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface DriveStatus {
  hasCredentials: boolean;
  isConnected: boolean;
  folderId: string;
  connectedEmail: string | null;
  fileCount: number;
  testError: string | null;
}

export function DriveConnectionCard() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<DriveStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const driveParam = searchParams.get("drive");
  const driveMsg = searchParams.get("msg");

  async function fetchStatus() {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/drive/status");
      if (res.ok) {
        const data = (await res.json()) as DriveStatus;
        setStatus(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6 shadow-xs">
      {/* Alertes de retour OAuth */}
      {driveParam === "success" && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          🎉 <strong>Succès !</strong> Ton compte Google Drive a été relié avec succès. Les fichiers ZIP sont maintenant accessibles par tes étudiants.
        </div>
      )}
      {driveParam === "error" && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          ⚠️ <strong>Erreur lors de la liaison :</strong> {driveMsg || "Une erreur est survenue lors de l'autorisation Google."}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--neutral-500)]">
              Passerelle Cloud Privée
            </span>
            {status?.isConnected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-600" />
                Connecté
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                <span className="size-1.5 rounded-full bg-amber-600" />
                Non connecté
              </span>
            )}
          </div>
          <h2 className="font-display mt-1 text-xl font-bold tracking-tight">
            Accès Google Drive (Fichiers ZIP)
          </h2>
          <p className="mt-1 max-w-xl text-xs text-[color:var(--neutral-600)]">
            Connecte ton compte Google en 1 clic pour que les étudiants puissent rechercher et télécharger les ZIP du dossier partagé spécifique.
          </p>
        </div>

        {/* Action principale */}
        <div className="flex items-center gap-2">
          {status?.isConnected ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchStatus}
                disabled={refreshing}
                className="rounded-xl border border-[color:var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--neutral-700)] shadow-2xs hover:bg-[color:var(--neutral-100)]"
              >
                {refreshing ? "Vérification..." : "Tester la synchro"}
              </button>
              <a
                href="/api/admin/drive/auth"
                className="rounded-xl bg-[color:var(--neutral-black)] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90"
              >
                Reconnecter
              </a>
            </div>
          ) : (
            <a
              href="/api/admin/drive/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:opacity-90 active:scale-95"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Lier mon compte Google Drive (1 clic)
            </a>
          )}
        </div>
      </div>

      {/* Détails techniques */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[color:var(--border)] bg-white p-3">
          <p className="font-mono text-[10px] uppercase text-[color:var(--neutral-500)]">Dossier Cible Verrouillé</p>
          <p className="mt-1 font-mono text-xs font-semibold text-[color:var(--neutral-black)] truncate" title={status?.folderId}>
            {status?.folderId || "1pPMsHu96fsTDiSV5EvRoSjP6fZr4UrOu"}
          </p>
        </div>

        <div className="rounded-xl border border-[color:var(--border)] bg-white p-3">
          <p className="font-mono text-[10px] uppercase text-[color:var(--neutral-500)]">Compte Google Connecté</p>
          <p className="mt-1 text-xs font-semibold text-[color:var(--accent-darkest)] truncate">
            {status?.connectedEmail || (status?.isConnected ? "Compte autorisé" : "Aucun")}
          </p>
        </div>

        <div className="rounded-xl border border-[color:var(--border)] bg-white p-3">
          <p className="font-mono text-[10px] uppercase text-[color:var(--neutral-500)]">Fichiers Détectés</p>
          <p className="mt-1 font-mono text-xs font-semibold text-[color:var(--neutral-black)]">
            {status?.isConnected ? `${status.fileCount} fichiers` : "En attente de liaison"}
          </p>
        </div>
      </div>

      {status?.testError && (
        <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
          ⚠️ <strong>Avertissement :</strong> {status.testError}
        </div>
      )}

      {!status?.hasCredentials && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
          <p className="font-semibold">⚙️ Configuration requise pour le bouton Google OAuth :</p>
          <p className="mt-1 text-amber-800">
            Pour que le bouton de connexion Google fonctionne, renseigne <code>GOOGLE_CLIENT_ID</code> et <code>GOOGLE_CLIENT_SECRET</code> dans ton fichier <code>.env.local</code>.
          </p>
          <p className="mt-1 text-amber-700">
            URI de redirection à autoriser dans Google Cloud Console :<br />
            <code className="mt-1 inline-block rounded bg-white px-2 py-0.5 font-mono text-[11px] border border-amber-200">
              https://forgeia.guelichweb.store/api/admin/drive/callback
            </code>
          </p>
        </div>
      )}
    </section>
  );
}
