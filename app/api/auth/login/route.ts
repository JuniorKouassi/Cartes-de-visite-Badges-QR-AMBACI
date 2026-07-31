import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  createSessionToken,
  createToken,
  PENDING_2FA_COOKIE,
  PENDING_2FA_TTL_SECONDS,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "@/lib/auth";
import { getAdminUserByEmail } from "@/lib/adminUsers";
import { verifyPassword } from "@/lib/passwordHash";

export async function POST(request: Request) {
  const { env } = getCloudflareContext();
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  }

  const user = await getAdminUserByEmail(env.DB, body.email);
  const valid = user ? await verifyPassword(body.password, user.password_hash) : false;
  if (!user || !valid) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
  }

  if (user.totp_enabled) {
    const pendingToken = await createToken(
      env.SESSION_SECRET,
      "pending-2fa",
      { userId: user.id },
      PENDING_2FA_TTL_SECONDS
    );
    const res = NextResponse.json({ needs2fa: true });
    res.cookies.set(PENDING_2FA_COOKIE, pendingToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: PENDING_2FA_TTL_SECONDS,
    });
    return res;
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
  return res;
}
