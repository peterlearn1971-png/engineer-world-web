import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Completely ignore API routes so the login process can happen
  if (path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 2. Protect all Admin routes
  if (path.startsWith('/admin')) {
    // Allow access to the login page itself
    if (path === '/admin/login') {
      return NextResponse.next();
    }

    // Check for the admin cookie
    const adminCookie = request.cookies.get('admin_key');

    // 3. If no cookie is found, redirect to login
    if (!adminCookie) {
      const loginUrl = new URL('/admin/login', request.url);
      
      // We explicitly set the fallback to /admin here 
      // This prevents the "undefined" error and stops the jump to intro-requests
      const redirectPath = path && path !== '/admin' ? path : '/admin';
      loginUrl.searchParams.set('next', redirectPath);
      
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Ensure this matches your admin pathing
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};