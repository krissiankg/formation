import path from "path";

export const MAX_RESOURCE_SIZE = 500 * 1024 * 1024;

/**
 * Nom de fichier sûr et unique pour une ressource téléversée :
 * "<base_assaini>_<id><ext>" (ex. "guide_ia_1760000000000_ab12cd.pdf").
 */
export function buildResourceFileName(originalName: string): { id: string; fileName: string } {
  const name = originalName || "fichier";
  const ext = path.extname(name);
  const rawBase = path
    .basename(name, ext)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9_-]/g, "_")
    .slice(0, 60);

  const safeBase = rawBase || "document";
  const id = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  return { id, fileName: `${safeBase}_${id}${ext}` };
}
