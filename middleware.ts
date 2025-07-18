import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserForMiddleware } from "./utils/supabase/server";

export default async function middleware(req: NextRequest) {
  const user = await getCurrentUserForMiddleware(req);

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
}