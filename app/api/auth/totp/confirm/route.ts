import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentAdminUser } from "@/lib/authSession";
import { enableAdminTotp } from "@/lib/adminUsers";
import { verifyTotpCode } from "@/lib/totp";

export async function POST(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (!user.totp_secret) {
    return NextResponse.json({ error: "Aucune configuration 2FA en attente" }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as { code?: string } | null;
  if (!body?.code) {
    return NextResponse.json({ error: "Code requis" }, { status: 400 });
  }

  const valid = await verifyTotpCode(user.totp_secret, body.code);
  if (!valid) {
    return NextResponse.json({ error: "Code incorrect" }, { status: 401 });
  }

  const { env } = getCloudflareContext();
  await enableAdminTotp(env.DB, user.id);

  return NextResponse.json({ ok: true });
}
