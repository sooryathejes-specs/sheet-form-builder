import { NextRequest, NextResponse } from 'next/server';
import { getAdminPassword, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const correctPassword = getAdminPassword();

    if (password === correctPassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set(ADMIN_COOKIE_NAME, password, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      return response;
    }

    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
