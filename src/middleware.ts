import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminSessionToken } from "@/lib/auth/admin-session";

const ADMIN_LOGIN_PATH = "/admin/connexion";

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("forge_admin_session")?.value;
  return verifyAdminSessionToken(token);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin/auth/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname === ADMIN_LOGIN_PATH) {
    if (await isAuthenticated(request)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!(await isAuthenticated(request))) {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
