import { uniqueSlug } from "./slug";

export const DEFAULT_INSTITUTION = "Ambassade / Mission permanente de Côte d'Ivoire - Vienne";

export interface Staff {
  id: number;
  slug: string;
  matricule: string;
  full_name: string;
  function_title: string;
  institution: string;
  phone_office: string | null;
  phone_cell: string | null;
  email: string | null;
  photo_key: string | null;
  valid_until: string | null;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface StaffInput {
  full_name: string;
  function_title: string;
  institution?: string;
  phone_office?: string | null;
  phone_cell?: string | null;
  email?: string | null;
  valid_until?: string | null;
  active?: boolean;
  matricule?: string;
}

export function isBadgeValid(staff: Pick<Staff, "active" | "valid_until">): boolean {
  if (!staff.active) return false;
  if (!staff.valid_until) return true;
  return new Date(staff.valid_until) >= new Date(new Date().toDateString());
}

export async function listStaff(db: D1Database, search?: string): Promise<Staff[]> {
  if (search && search.trim()) {
    const like = `%${search.trim()}%`;
    const { results } = await db
      .prepare(
        "SELECT * FROM staff WHERE full_name LIKE ? OR matricule LIKE ? OR function_title LIKE ? ORDER BY full_name"
      )
      .bind(like, like, like)
      .all<Staff>();
    return results;
  }
  const { results } = await db.prepare("SELECT * FROM staff ORDER BY full_name").all<Staff>();
  return results;
}

export async function getStaffById(db: D1Database, id: number): Promise<Staff | null> {
  return db.prepare("SELECT * FROM staff WHERE id = ?").bind(id).first<Staff>();
}

export async function getStaffBySlug(db: D1Database, slug: string): Promise<Staff | null> {
  return db.prepare("SELECT * FROM staff WHERE slug = ?").bind(slug).first<Staff>();
}

export async function getStaffByMatricule(db: D1Database, matricule: string): Promise<Staff | null> {
  return db.prepare("SELECT * FROM staff WHERE matricule = ?").bind(matricule).first<Staff>();
}

async function generateMatricule(db: D1Database): Promise<string> {
  const row = await db.prepare("SELECT COUNT(*) as count FROM staff").first<{ count: number }>();
  let n = (row?.count ?? 0) + 1;

  while (true) {
    const candidate = `AMB-VIE-${String(n).padStart(4, "0")}`;
    const existing = await getStaffByMatricule(db, candidate);
    if (!existing) return candidate;
    n += 1;
  }
}

export async function createStaff(db: D1Database, input: StaffInput): Promise<Staff> {
  const slug = await uniqueSlug(db, input.full_name);
  const matricule = input.matricule?.trim() || (await generateMatricule(db));

  const result = await db
    .prepare(
      `INSERT INTO staff (slug, matricule, full_name, function_title, institution, phone_office, phone_cell, email, valid_until, active, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       RETURNING *`
    )
    .bind(
      slug,
      matricule,
      input.full_name.trim(),
      input.function_title.trim(),
      input.institution?.trim() || DEFAULT_INSTITUTION,
      input.phone_office?.trim() || null,
      input.phone_cell?.trim() || null,
      input.email?.trim() || null,
      input.valid_until?.trim() || null,
      input.active === false ? 0 : 1
    )
    .first<Staff>();

  if (!result) throw new Error("Échec de la création de la fiche personnel");
  return result;
}

export async function updateStaff(db: D1Database, id: number, input: StaffInput): Promise<Staff | null> {
  const current = await getStaffById(db, id);
  if (!current) return null;

  const slug =
    input.full_name.trim() === current.full_name ? current.slug : await uniqueSlug(db, input.full_name, id);

  const result = await db
    .prepare(
      `UPDATE staff SET
        slug = ?, matricule = ?, full_name = ?, function_title = ?, institution = ?,
        phone_office = ?, phone_cell = ?, email = ?, valid_until = ?, active = ?,
        updated_at = datetime('now')
       WHERE id = ?
       RETURNING *`
    )
    .bind(
      slug,
      input.matricule?.trim() || current.matricule,
      input.full_name.trim(),
      input.function_title.trim(),
      input.institution?.trim() || DEFAULT_INSTITUTION,
      input.phone_office?.trim() || null,
      input.phone_cell?.trim() || null,
      input.email?.trim() || null,
      input.valid_until?.trim() || null,
      input.active === false ? 0 : 1,
      id
    )
    .first<Staff>();

  return result;
}

export async function setStaffPhoto(db: D1Database, id: number, photoKey: string): Promise<void> {
  await db
    .prepare("UPDATE staff SET photo_key = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(photoKey, id)
    .run();
}

export async function deleteStaff(db: D1Database, id: number): Promise<Staff | null> {
  return db.prepare("DELETE FROM staff WHERE id = ? RETURNING *").bind(id).first<Staff>();
}
