import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyToken } from "@/lib/auth";
import { getAdminUserById, updateAdminPassword } from "@/lib/adminUsers";
import { hashPassword } from "@/lib/passwordHash";

export async function POST(request: Request) {
  const { env } = getCloudflareContext();
  const body = (await request.json().catch(() => null)) as { token?: string; password?: string } | null;

  if (!body?.token || !body?.password) {
    return NextResponse.json({ error: "Lien invalide ou mot de passe manquant" }, { status: 400 });
  }
  if (body.password.length < 10) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 10 caractères" }, { status: 400 });
  }

  const payload = await verifyToken<{ userId: number }>(body.token, env.SESSION_SECRET, "password-reset");
  if (!payload) {
    return NextResponse.json({ error: "Ce lien de réinitialisation est invalide ou a expiré" }, { status: 401 });
  }

  const user = await getAdminUserById(env.DB, payload.userId);
  if (!user) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 401 });
  }

  const passwordHash = await hashPassword(body.password);
  await updateAdminPassword(env.DB, user.id, passwordHash);

  return NextResponse.json({ ok: true });
}
