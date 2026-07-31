export interface AdminUser {
  id: number;
  email: string;
  password_hash: string;
  totp_secret: string | null;
  totp_enabled: number;
  created_at: string;
  updated_at: string;
}

export async function getAdminUserByEmail(db: D1Database, email: string): Promise<AdminUser | null> {
  return db
    .prepare("SELECT * FROM admin_users WHERE lower(email) = lower(?)")
    .bind(email.trim())
    .first<AdminUser>();
}

export async function getAdminUserById(db: D1Database, id: number): Promise<AdminUser | null> {
  return db.prepare("SELECT * FROM admin_users WHERE id = ?").bind(id).first<AdminUser>();
}

export async function createAdminUser(db: D1Database, email: string, passwordHash: string): Promise<AdminUser> {
  const result = await db
    .prepare(
      `INSERT INTO admin_users (email, password_hash, updated_at) VALUES (?, ?, datetime('now')) RETURNING *`
    )
    .bind(email.trim().toLowerCase(), passwordHash)
    .first<AdminUser>();
  if (!result) throw new Error("Échec de la création de l'administrateur");
  return result;
}

export async function updateAdminPassword(db: D1Database, id: number, passwordHash: string): Promise<void> {
  await db
    .prepare("UPDATE admin_users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(passwordHash, id)
    .run();
}

export async function setAdminTotpSecret(db: D1Database, id: number, secret: string): Promise<void> {
  await db
    .prepare("UPDATE admin_users SET totp_secret = ?, totp_enabled = 0, updated_at = datetime('now') WHERE id = ?")
    .bind(secret, id)
    .run();
}

export async function enableAdminTotp(db: D1Database, id: number): Promise<void> {
  await db
    .prepare("UPDATE admin_users SET totp_enabled = 1, updated_at = datetime('now') WHERE id = ?")
    .bind(id)
    .run();
}

export async function disableAdminTotp(db: D1Database, id: number): Promise<void> {
  await db
    .prepare(
      "UPDATE admin_users SET totp_enabled = 0, totp_secret = NULL, updated_at = datetime('now') WHERE id = ?"
    )
    .bind(id)
    .run();
}
