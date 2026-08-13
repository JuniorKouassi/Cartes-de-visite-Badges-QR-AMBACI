export interface ConsularHolder {
  id: number;
  card_number: string;
  last_name: string;
  first_names: string;
  date_of_birth: string | null;
  place_of_birth: string | null;
  sex: string | null;
  country_of_residence: string | null;
  profession: string | null;
  phone: string | null;
  address: string | null;
  card_valid_from: string | null;
  card_valid_until: string | null;
  passport_number: string | null;
  passport_issued_at: string | null;
  passport_expires_at: string | null;
  passport_issuing_authority: string | null;
  photo_key: string | null;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface ConsularHolderInput {
  last_name: string;
  first_names: string;
  date_of_birth?: string | null;
  place_of_birth?: string | null;
  sex?: string | null;
  country_of_residence?: string | null;
  profession?: string | null;
  phone?: string | null;
  address?: string | null;
  card_valid_from?: string | null;
  card_valid_until?: string | null;
  passport_number?: string | null;
  passport_issued_at?: string | null;
  passport_expires_at?: string | null;
  passport_issuing_authority?: string | null;
  active?: boolean;
  card_number?: string;
}

export function isConsularCardValid(holder: Pick<ConsularHolder, "active" | "card_valid_until">): boolean {
  if (!holder.active) return false;
  if (!holder.card_valid_until) return true;
  return new Date(holder.card_valid_until) >= new Date(new Date().toDateString());
}

export async function listConsularHolders(db: D1Database, search?: string): Promise<ConsularHolder[]> {
  if (search && search.trim()) {
    const like = `%${search.trim()}%`;
    const { results } = await db
      .prepare(
        `SELECT * FROM consular_holders
         WHERE last_name LIKE ? OR first_names LIKE ? OR card_number LIKE ? OR passport_number LIKE ?
         ORDER BY last_name`
      )
      .bind(like, like, like, like)
      .all<ConsularHolder>();
    return results;
  }
  const { results } = await db.prepare("SELECT * FROM consular_holders ORDER BY last_name").all<ConsularHolder>();
  return results;
}

export async function getConsularHolderById(db: D1Database, id: number): Promise<ConsularHolder | null> {
  return db.prepare("SELECT * FROM consular_holders WHERE id = ?").bind(id).first<ConsularHolder>();
}

export async function getConsularHolderByCardNumber(db: D1Database, cardNumber: string): Promise<ConsularHolder | null> {
  return db.prepare("SELECT * FROM consular_holders WHERE card_number = ?").bind(cardNumber).first<ConsularHolder>();
}

async function generateCardNumber(db: D1Database): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const row = await db.prepare("SELECT COUNT(*) as count FROM consular_holders").first<{ count: number }>();
  let n = (row?.count ?? 0) + 1;

  while (true) {
    const candidate = `AUT-${year}-${month}-${String(n).padStart(3, "0")}A`;
    const existing = await getConsularHolderByCardNumber(db, candidate);
    if (!existing) return candidate;
    n += 1;
  }
}

export async function createConsularHolder(db: D1Database, input: ConsularHolderInput): Promise<ConsularHolder> {
  const cardNumber = input.card_number?.trim() || (await generateCardNumber(db));

  const result = await db
    .prepare(
      `INSERT INTO consular_holders (
        card_number, last_name, first_names, date_of_birth, place_of_birth, sex, country_of_residence,
        profession, phone, address, card_valid_from, card_valid_until,
        passport_number, passport_issued_at, passport_expires_at, passport_issuing_authority, active, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      RETURNING *`
    )
    .bind(
      cardNumber,
      input.last_name.trim(),
      input.first_names.trim(),
      input.date_of_birth?.trim() || null,
      input.place_of_birth?.trim() || null,
      input.sex?.trim() || null,
      input.country_of_residence?.trim() || null,
      input.profession?.trim() || null,
      input.phone?.trim() || null,
      input.address?.trim() || null,
      input.card_valid_from?.trim() || null,
      input.card_valid_until?.trim() || null,
      input.passport_number?.trim() || null,
      input.passport_issued_at?.trim() || null,
      input.passport_expires_at?.trim() || null,
      input.passport_issuing_authority?.trim() || null,
      input.active === false ? 0 : 1
    )
    .first<ConsularHolder>();

  if (!result) throw new Error("Échec de la création de la fiche consulaire");
  return result;
}

export async function updateConsularHolder(
  db: D1Database,
  id: number,
  input: ConsularHolderInput
): Promise<ConsularHolder | null> {
  const current = await getConsularHolderById(db, id);
  if (!current) return null;

  const result = await db
    .prepare(
      `UPDATE consular_holders SET
        card_number = ?, last_name = ?, first_names = ?, date_of_birth = ?, place_of_birth = ?, sex = ?,
        country_of_residence = ?, profession = ?, phone = ?, address = ?, card_valid_from = ?, card_valid_until = ?,
        passport_number = ?, passport_issued_at = ?, passport_expires_at = ?, passport_issuing_authority = ?,
        active = ?, updated_at = datetime('now')
       WHERE id = ?
       RETURNING *`
    )
    .bind(
      input.card_number?.trim() || current.card_number,
      input.last_name.trim(),
      input.first_names.trim(),
      input.date_of_birth?.trim() || null,
      input.place_of_birth?.trim() || null,
      input.sex?.trim() || null,
      input.country_of_residence?.trim() || null,
      input.profession?.trim() || null,
      input.phone?.trim() || null,
      input.address?.trim() || null,
      input.card_valid_from?.trim() || null,
      input.card_valid_until?.trim() || null,
      input.passport_number?.trim() || null,
      input.passport_issued_at?.trim() || null,
      input.passport_expires_at?.trim() || null,
      input.passport_issuing_authority?.trim() || null,
      input.active === false ? 0 : 1,
      id
    )
    .first<ConsularHolder>();

  return result;
}

export async function setConsularHolderPhoto(db: D1Database, id: number, photoKey: string): Promise<void> {
  await db
    .prepare("UPDATE consular_holders SET photo_key = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(photoKey, id)
    .run();
}

export async function deleteConsularHolder(db: D1Database, id: number): Promise<ConsularHolder | null> {
  return db.prepare("DELETE FROM consular_holders WHERE id = ? RETURNING *").bind(id).first<ConsularHolder>();
}
