/**
 * Lien d'invitation du groupe WhatsApp FORGEIA. Stocké en base (app_settings), jamais dans le dépôt
 * qui est public, et montré seulement aux apprenants dont la préinscription est payée.
 */

import { hasRegistrationAccess } from "@/lib/access/registration";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { Enrollment } from "@/lib/types";

const SETTINGS_KEY = "whatsapp_group_url";

export function isWhatsAppGroupUrl(url: string): boolean {
  return /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+(\?[^\s]*)?$/.test(url);
}

export async function getWhatsAppGroupUrl(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("app_settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();
  if (error) {
    console.error("[whatsapp-group] lecture:", error.message);
    return null;
  }
  const url = (data?.value as { url?: string } | undefined)?.url;
  return url && isWhatsAppGroupUrl(url) ? url : null;
}

/** Lien du groupe pour cet apprenant : null tant que sa préinscription n'est pas payée. */
export async function getWhatsAppGroupUrlFor(enrollment: Pick<Enrollment, "payments" | "accessOverride">) {
  return hasRegistrationAccess(enrollment) ? getWhatsAppGroupUrl() : null;
}

export async function setWhatsAppGroupUrl(url: string | null): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("app_settings")
    .upsert({ key: SETTINGS_KEY, value: { url }, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}
