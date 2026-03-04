import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Let the login process through!
  if (path.startsWith('/admin/login') || path.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  // 2. Protect Admin
  if (path.startsWith('/admin')) {
    const adminCookie = request.cookies.get('admin_key');
    if (!adminCookie) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};