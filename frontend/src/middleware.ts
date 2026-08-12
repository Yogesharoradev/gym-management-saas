import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/jwt";
import { ROLES } from "@/lib/constants";

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "gymos_session";

const GYM_ROUTES = [
  "/dashboard",
  "/members",
  "/memberships",
  "/attendance",
  "/payments",
  "/expiry",
  "/reports",
  "/announcements",
  "/settings",
];

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;

  const isSuperRoute = pathname.startsWith("/super-admin");
  const isGymRoute = GYM_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isSuperRoute && payload.role !== ROLES.SUPER_ADMIN) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isGymRoute && payload.role === ROLES.SUPER_ADMIN) {
    return NextResponse.redirect(new URL("/super-admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/members/:path*",
    "/memberships/:path*",
    "/attendance/:path*",
    "/payments/:path*",
    "/expiry/:path*",
    "/reports/:path*",
    "/announcements/:path*",
    "/settings/:path*",
    "/super-admin/:path*",
  ],
};
