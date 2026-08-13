import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentAdminUser } from "@/lib/authSession";
import { createAdminUser, getAdminUserByEmail, isDepartment, listAdminUsers, setAdminDepartments } from "@/lib/adminUsers";
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

  const body = (await request.json().catch(() => null)) as { email?: string; departments?: string[] } | null;
  const email = body?.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Adresse e-mail invalide" }, { status: 400 });
  }

  const departments = (body?.departments ?? []).filter(isDepartment);
  if (departments.length === 0) {
    return NextResponse.json({ error: "Sélectionnez au moins un département" }, { status: 400 });
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
  await setAdminDepartments(env.DB, newAdmin.id, departments);

  const token = await createToken(env.SESSION_SECRET, "password-reset", { userId: newAdmin.id }, INVITE_TOKEN_TTL_SECONDS);
  const setPasswordUrl = new URL(`/reset-password?token=${encodeURIComponent(token)}`, request.url).toString();

  let emailSent = true;
  try {
    await sendAdminInviteEmail(env, email, setPasswordUrl);
  } catch (err) {
    console.error("Échec de l'envoi de l'e-mail d'invitation admin", err);
    emailSent = false;
  }

  // The account is created either way — if the email couldn't be sent (e.g. no
  // verified Resend domain yet), the inviting admin can share this link manually
  // instead of being stuck.
  return NextResponse.json({ ok: true, emailSent, setPasswordUrl: emailSent ? undefined : setPasswordUrl });
}
