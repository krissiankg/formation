import type { ContentItem } from "@/lib/store/content";

const styles: Record<ContentItem["kind"], string> = {
  outil: "bg-[color:var(--accent-lightest)] text-[color:var(--accent-darkest)]",
  code: "bg-[#e8f0f5] text-[#2a4a5c]",
  programme: "bg-[#f0ebe3] text-[color:var(--neutral-700)]",
  annonce: "bg-[#f5e8e8] text-[#6b3030]",
};

const labels: Record<ContentItem["kind"], string> = {
  outil: "Outil",
  code: "Code",
  programme: "Programme",
  annonce: "Annonce",
};

export function ContentKindBadge({ kind }: { kind: ContentItem["kind"] }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${styles[kind]}`}
    >
      {labels[kind]}
    </span>
  );
}
