import { NextResponse, type NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS, verifySessionToken } from "@/lib/auth";

export const runtime = "experimental-edge";

export const config = {
  matcher: ["/admin/:path*", "/api/staff/:path*"],
};

export default async function middleware(request: NextRequest) {
  const { env } = getCloudflareContext();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authenticated = await verifySessionToken(token, env.SESSION_SECRET);

  if (authenticated) {
    // Sliding-window idle timeout: renew the cookie's expiry on each
    // authenticated request, so it only expires after 30 min of inactivity.
    const res = NextResponse.next();
    const freshToken = await createSessionToken(env.SESSION_SECRET);
    res.cookies.set(SESSION_COOKIE, freshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    return res;
  }

  if (request.nextUrl.pathname.startsWith("/api/staff")) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}
