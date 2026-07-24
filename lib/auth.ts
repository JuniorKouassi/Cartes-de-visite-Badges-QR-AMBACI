export const SESSION_COOKIE = "ambaci_admin_session";
const SESSION_TTL_SECONDS = 30 * 60; // 30 minutes, refreshed on each authenticated request

export interface AdminUser {
  email: string;
  password: string;
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function createSessionToken(secret: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = String(expiresAt);
  const signature = await hmacHex(secret, payload);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = await hmacHex(secret, payload);
  if (!timingSafeEqual(signature, expected)) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}

export function parseAdminUsers(json: string): AdminUser[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (u): u is AdminUser => typeof u?.email === "string" && typeof u?.password === "string"
    );
  } catch {
    return [];
  }
}

export function verifyCredentials(email: string, password: string, users: AdminUser[]): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  return users.some(
    (u) => timingSafeEqual(normalizedEmail, u.email.trim().toLowerCase()) && timingSafeEqual(password, u.password)
  );
}

export { SESSION_TTL_SECONDS };
