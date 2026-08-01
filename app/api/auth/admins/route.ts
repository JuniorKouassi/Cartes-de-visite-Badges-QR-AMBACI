import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentAdminUser } from "@/lib/authSession";
import { createAdminUser, deleteAdminUser, getAdminUserByEmail, listAdminUsers } from "@/lib/adminUsers";
import { hashPassword } from "@/lib/passwordHash";
import { createToken, INVITE_TOKEN_TTL_SECONDS } from "@/lib/auth";
import { sendAdminInviteEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { env } = getCloudflareContext();
  const admins = await listAdminUsers(env.DB);
  return NextResponse.json({ admins });
}

export async function POST(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Adresse e-mail invalide" }, { status: 400 });
  }

  const { env } = getCloudflareContext();

  const existing = await getAdminUserByEmail(env.DB, email);
  if (existing) {
    return NextResponse.json({ error: "Un administrateur existe déjà avec cet e-mail" }, { status: 409 });
  }

  // Placeholder password the invitee will replace via the set-password link below —
  // nobody, including the inviting admin, ever knows or chooses it.
  const placeholder = crypto.randomUUID() + crypto.randomUUID();
  const passwordHash = await hashPassword(placeholder);
  const newAdmin = await createAdminUser(env.DB, email, passwordHash);

  const token = await createToken(env.SESSION_SECRET, "password-reset", { userId: newAdmin.id }, INVITE_TOKEN_TTL_SECONDS);
  const setPasswordUrl = new URL(`/reset-password?token=${encodeURIComponent(token)}`, request.url).toString();

  try {
    await sendAdminInviteEmail(env, email, setPasswordUrl);
  } catch (err) {
    console.error("Échec de l'envoi de l'e-mail d'invitation admin", err);
    // Roll back so the admin can simply retry instead of hitting a stuck 409.
    await deleteAdminUser(env.DB, newAdmin.id);
    return NextResponse.json({ error: "L'e-mail d'invitation n'a pas pu être envoyé" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
