import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ContentAttachment = {
  id: string;
  name: string;
  size: number;
  formattedSize: string;
  url: string;
  type?: string;
};

export type ContentItem = {
  id: string;
  title: string;
  body: string;
  kind: "outil" | "code" | "programme" | "annonce";
  published: boolean;
  createdAt: string;
  attachments?: ContentAttachment[];
};

type ContentRow = {
  id: string;
  title: string;
  body: string;
  kind: ContentItem["kind"];
  published: boolean;
  created_at: string;
  attachments?: ContentAttachment[] | null;
};

function mapRow(row: ContentRow): ContentItem {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    kind: row.kind,
    published: row.published,
    createdAt: row.created_at,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
  };
}

export async function listContent(): Promise<ContentItem[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("published_content")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as ContentRow[]).map(mapRow);
}

export async function listPublishedContent(): Promise<ContentItem[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("published_content")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as ContentRow[]).map(mapRow);
}

export async function createContent(input: {
  title: string;
  body: string;
  kind: ContentItem["kind"];
  publish: boolean;
  attachments?: ContentAttachment[];
}): Promise<ContentItem> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("published_content")
    .insert({
      title: input.title.trim(),
      body: input.body.trim(),
      kind: input.kind,
      published: input.publish,
      attachments: input.attachments || [],
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as ContentRow);
}

export async function deleteContent(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("published_content")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}
