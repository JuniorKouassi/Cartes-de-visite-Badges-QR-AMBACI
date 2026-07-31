import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifySessionToken, SESSION_COOKIE } from "./auth";
import { getAdminUserByEmail, type AdminUser } from "./adminUsers";

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const { env } = getCloudflareContext();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token, env.SESSION_SECRET);
  if (!session) return null;
  return getAdminUserByEmail(env.DB, session.email);
}
