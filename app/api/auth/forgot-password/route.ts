import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createToken, RESET_TOKEN_TTL_SECONDS } from "@/lib/auth";
import { getAdminUserByEmail } from "@/lib/adminUsers";
import { sendPasswordResetEmail } from "@/lib/email";

const GENERIC_MESSAGE =
  "Si un compte existe avec cette adresse, un e-mail de réinitialisation vient de lui être envoyé.";

export async function POST(request: Request) {
  const { env } = getCloudflareContext();
  const body = (await request.json().catch(() => null)) as { email?: string } | null;

  if (!body?.email) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }

  const user = await getAdminUserByEmail(env.DB, body.email);
  if (user) {
    const token = await createToken(env.SESSION_SECRET, "password-reset", { userId: user.id }, RESET_TOKEN_TTL_SECONDS);
    const resetUrl = new URL(`/reset-password?token=${encodeURIComponent(token)}`, request.url).toString();
    try {
      await sendPasswordResetEmail(env, user.email, resetUrl);
    } catch (err) {
      console.error("Échec de l'envoi de l'e-mail de réinitialisation", err);
    }
  }

  return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
}
