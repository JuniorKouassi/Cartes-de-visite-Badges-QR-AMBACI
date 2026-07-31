import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentAdminUser } from "@/lib/authSession";
import { disableAdminTotp } from "@/lib/adminUsers";
import { verifyPassword } from "@/lib/passwordHash";

export async function POST(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  if (!body?.password) {
    return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 });
  }

  const valid = await verifyPassword(body.password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const { env } = getCloudflareContext();
  await disableAdminTotp(env.DB, user.id);

  return NextResponse.json({ ok: true });
}
