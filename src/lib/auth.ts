import { NextRequest } from 'next/server';

export const ADMIN_COOKIE_NAME = 'admin_session';

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'admin123';
}

export function isAdminAuthenticated(req: NextRequest): boolean {
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME);
  if (!cookie) return false;
  return cookie.value === getAdminPassword();
}
