import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, isAdminAuthenticated } from './lib/auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAdminAuthenticated(req)) {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Admin API Operations
  // 1. All POST, PUT, DELETE operations on /api/forms* (except submitting responses)
  // 2. All GET operations for responses
  if (pathname.startsWith('/api/forms')) {
    const isSubmitRoute = pathname.includes('/submit');
    const isResponseRoute = pathname.includes('/responses');
    
    // Non-GET requests (e.g. POST, PUT, DELETE for creating/updating forms) or responses list
    if ((req.method !== 'GET' && !isSubmitRoute) || isResponseRoute) {
      if (!isAdminAuthenticated(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/forms/:path*'],
};
