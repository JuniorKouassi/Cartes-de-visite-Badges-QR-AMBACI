const COMBINING_MARKS = /[̀-ͯ]/g;

export function slugify(fullName: string): string {
  return fullName
    .normalize("NFD")
    .replace(COMBINING_MARKS, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function uniqueSlug(
  db: D1Database,
  fullName: string,
  excludeId?: number
): Promise<string> {
  const base = slugify(fullName) || "membre";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await db
      .prepare("SELECT id FROM staff WHERE slug = ?")
      .bind(candidate)
      .first<{ id: number }>();

    if (!existing || existing.id === excludeId) return candidate;

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}
