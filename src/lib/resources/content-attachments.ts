import type { ContentAttachment, ContentItem } from "@/lib/store/content";

export function contentAttachmentUnlockId(attachment: Pick<ContentAttachment, "id">) {
  return `content:${attachment.id}`;
}

/** Ne transmet jamais les adresses de stockage aux navigateurs des élèves. */
export function studentContent(items: ContentItem[]): ContentItem[] {
  return items.map((item) => ({
    ...item,
    attachments: item.attachments?.map((attachment) => ({
      ...attachment,
      url: `/api/ressources/supports/${encodeURIComponent(attachment.id)}/download`,
    })),
  }));
}

export function resourceFileName(url: string): string | null {
  const match = /^\/uploads\/resources\/([a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,220})$/.exec(url);
  return match && !match[1].includes("..") ? match[1] : null;
}
