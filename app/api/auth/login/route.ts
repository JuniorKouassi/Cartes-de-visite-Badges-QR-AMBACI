import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createSessionToken, parseAdminUsers, verifyCredentials, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/auth";

export async function POST(request: Request) {
  const { env } = getCloudflareContext();
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  }

  const users = parseAdminUsers(env.ADMIN_USERS);
  const valid = verifyCredentials(body.email, body.password, users);
  if (!valid) {
    return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
  }

  const token = await createSessionToken(env.SESSION_SECRET);
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
