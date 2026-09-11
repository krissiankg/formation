import { formation } from "@/lib/config/formation";

export function formatFcfa(amount: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(amount)} ${formation.currencyLabel}`;
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 o";
  const units = ["o", "Ko", "Mo", "Go", "To"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function getFileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext)) return "📦";
  if (["pdf"].includes(ext)) return "📄";
  if (["mp4", "mkv", "mov", "avi", "webm", "flv"].includes(ext)) return "🎥";
  if (["mp3", "wav", "aac", "ogg", "flac"].includes(ext)) return "🎵";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp", "avif"].includes(ext)) return "🖼️";
  if (["vsix", "apk", "exe", "msi", "dmg", "deb", "iso"].includes(ext)) return "⚙️";
  if (["js", "ts", "jsx", "tsx", "py", "html", "css", "json", "sql", "sh"].includes(ext)) return "💻";
  if (["doc", "docx", "txt", "md", "rtf", "odt"].includes(ext)) return "📝";
  if (["xls", "xlsx", "csv"].includes(ext)) return "📊";
  if (["ppt", "pptx"].includes(ext)) return "📊";
  return "📁";
}

