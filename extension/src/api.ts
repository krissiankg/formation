import * as vscode from "vscode";

/** Infos renvoyées par la plateforme pour l'apprenant connecté (GET /api/ia/v1/me). */
export type Me = {
  firstName: string;
  budgetFcfa: number;
  spentFcfa: number;
  remainingFcfa: number;
  currentLesson: { title: string; url: string } | null;
};

export type LinkResult = { apiKey: string; baseUrl: string; firstName: string };

/** Adresse de la passerelle utilisée par Kilo Code (intégrée aux clés et à la configuration). */
export const IA_BASE_URL = "https://ia.guelichweb.store/v1";

export function siteUrl(): string {
  const configured = vscode.workspace.getConfiguration("forgeia").get<string>("siteUrl");
  return (configured || "https://forgeia.guelichweb.store").replace(/\/+$/, "");
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${siteUrl()}${path}`, init);
  const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } | string };
  if (!res.ok) {
    const message = typeof data.error === "string" ? data.error : data.error?.message;
    throw new Error(message || `Erreur ${res.status}`);
  }
  return data as T;
}

export function exchangeLinkToken(token: string): Promise<LinkResult> {
  return request<LinkResult>("/api/ia/link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}

export function getMe(apiKey: string): Promise<Me> {
  return request<Me>("/api/ia/v1/me", { headers: { Authorization: `Bearer ${apiKey}` } });
}
