import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  createSessionToken,
  verifyToken,
  PENDING_2FA_COOKIE,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "@/lib/auth";
import { getAdminUserById } from "@/lib/adminUsers";
import { verifyTotpCode } from "@/lib/totp";

export async function POST(request: Request) {
  const { env } = getCloudflareContext();
  const body = (await request.json().catch(() => null)) as { code?: string } | null;

  if (!body?.code) {
    return NextResponse.json({ error: "Code requis" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const pendingToken = cookieStore.get(PENDING_2FA_COOKIE)?.value;
  const pending = await verifyToken<{ userId: number }>(pendingToken, env.SESSION_SECRET, "pending-2fa");
  if (!pending) {
    return NextResponse.json({ error: "Session de connexion expirée, reconnectez-vous" }, { status: 401 });
  }

  const user = await getAdminUserById(env.DB, pending.userId);
  if (!user || !user.totp_secret) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 401 });
  }

  const valid = await verifyTotpCode(user.totp_secret, body.code);
  if (!valid) {
    return NextResponse.json({ error: "Code incorrect" }, { status: 401 });
  }

  const token = await createSessionToken(env.SESSION_SECRET, user.email);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  res.cookies.set(PENDING_2FA_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
