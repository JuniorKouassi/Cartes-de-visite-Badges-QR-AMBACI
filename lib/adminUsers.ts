export interface AdminUser {
  id: number;
  email: string;
  password_hash: string;
  totp_secret: string | null;
  totp_enabled: number;
  created_at: string;
  updated_at: string;
}

export const DEPARTMENTS = ["protocole", "consulaire", "paierie"] as const;
export type Department = (typeof DEPARTMENTS)[number];

export function isDepartment(value: string): value is Department {
  return (DEPARTMENTS as readonly string[]).includes(value);
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

export interface AdminUserSummary {
  id: number;
  email: string;
  totp_enabled: number;
  created_at: string;
  departments: Department[];
}

export async function listAdminUsers(db: D1Database): Promise<AdminUserSummary[]> {
  const [{ results: admins }, { results: grants }] = await Promise.all([
    db.prepare("SELECT id, email, totp_enabled, created_at FROM admin_users ORDER BY email").all<
      Omit<AdminUserSummary, "departments">
    >(),
    db.prepare("SELECT admin_id, department FROM admin_departments").all<{ admin_id: number; department: Department }>(),
  ]);

  const byAdmin = new Map<number, Department[]>();
  for (const grant of grants) {
    const list = byAdmin.get(grant.admin_id) ?? [];
    list.push(grant.department);
    byAdmin.set(grant.admin_id, list);
  }

  return admins.map((admin) => ({ ...admin, departments: byAdmin.get(admin.id) ?? [] }));
}

export async function getAdminDepartments(db: D1Database, adminId: number): Promise<Department[]> {
  const { results } = await db
    .prepare("SELECT department FROM admin_departments WHERE admin_id = ?")
    .bind(adminId)
    .all<{ department: Department }>();
  return results.map((r) => r.department);
}

export async function hasDepartment(db: D1Database, adminId: number, department: Department): Promise<boolean> {
  const row = await db
    .prepare("SELECT 1 FROM admin_departments WHERE admin_id = ? AND department = ?")
    .bind(adminId, department)
    .first();
  return row !== null;
}

export async function setAdminDepartments(db: D1Database, adminId: number, departments: Department[]): Promise<void> {
  const statements = [
    db.prepare("DELETE FROM admin_departments WHERE admin_id = ?").bind(adminId),
    ...departments.map((department) =>
      db.prepare("INSERT INTO admin_departments (admin_id, department) VALUES (?, ?)").bind(adminId, department)
    ),
  ];
  await db.batch(statements);
}

export async function countAdminUsers(db: D1Database): Promise<number> {
  const row = await db.prepare("SELECT COUNT(*) as count FROM admin_users").first<{ count: number }>();
  return row?.count ?? 0;
}

export async function deleteAdminUser(db: D1Database, id: number): Promise<void> {
  await db.prepare("DELETE FROM admin_users WHERE id = ?").bind(id).run();
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
