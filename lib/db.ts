import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getDb() {
  const { env } = getCloudflareContext();
  return env.DB;
}

export function getPhotosBucket() {
  const { env } = getCloudflareContext();
  return env.PHOTOS;
}

export function getAi() {
  const { env } = getCloudflareContext();
  return env.AI;
}

export function getVerifyMode(): "minimal" | "full" {
  const { env } = getCloudflareContext();
  return String(env.VERIFY_MODE) === "full" ? "full" : "minimal";
}
