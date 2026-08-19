export const SESSION_COOKIE = "ambaci_admin_session";
export const PENDING_2FA_COOKIE = "ambaci_pending_2fa";

// 30 days, refreshed on each authenticated request (sliding window) — was 30
// minutes; raised at the user's request to stop logging admins out mid-work.
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
export const PENDING_2FA_TTL_SECONDS = 5 * 60;
export const RESET_TOKEN_TTL_SECONDS = 30 * 60;
export const INVITE_TOKEN_TTL_SECONDS = 24 * 60 * 60;

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

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Generic signed token: base64url(JSON payload) + "." + HMAC signature.
 * Every payload carries its own `purpose` and `exp` so a token minted for
 * one flow (e.g. pending-2FA) can never be replayed as another (e.g. a
 * full session) even though they share the same signing secret.
 */
export async function createToken<T extends Record<string, unknown>>(
  secret: string,
  purpose: string,
  data: T,
  ttlSeconds: number
): Promise<string> {
  const payload = { ...data, purpose, exp: Date.now() + ttlSeconds * 1000 };
  const encoded = btoa(JSON.stringify(payload));
  const signature = await hmacHex(secret, encoded);
  return `${encoded}.${signature}`;
}

export async function verifyToken<T>(
  token: string | undefined,
  secret: string,
  expectedPurpose: string
): Promise<T | null> {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = await hmacHex(secret, encoded);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(atob(encoded)) as { purpose?: string; exp?: number } & T;
    if (payload.purpose !== expectedPurpose) return null;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSessionToken(secret: string, email: string): Promise<string> {
  return createToken(secret, "session", { email }, SESSION_TTL_SECONDS);
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string
): Promise<{ email: string } | null> {
  return verifyToken<{ email: string }>(token, secret, "session");
}
