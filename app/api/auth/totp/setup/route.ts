import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentAdminUser } from "@/lib/authSession";
import { setAdminTotpSecret } from "@/lib/adminUsers";
import { generateTotpSecret, buildOtpAuthUri } from "@/lib/totp";
import { generateQrDataUrl } from "@/lib/qr";

export async function POST() {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { env } = getCloudflareContext();
  const secret = generateTotpSecret();
  await setAdminTotpSecret(env.DB, user.id, secret);

  const otpauthUri = buildOtpAuthUri(user.email, secret);
  const qrDataUrl = await generateQrDataUrl(otpauthUri);

  return NextResponse.json({ secret, otpauthUri, qrDataUrl });
}
