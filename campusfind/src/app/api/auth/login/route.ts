import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, createToken, TOKEN_COOKIE_NAME } from '@/lib/auth';
import { User } from '@/types';

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Please enter email and password' }, { status: 400 });
    }

    const row = db.prepare(`
      SELECT id, name, email, password_hash, college_id, department, year, role, profile_image, is_flagged, false_claims_count, created_at
      FROM users WHERE email = ?
    `).get(email.toLowerCase().trim()) as (User & { password_hash: string }) | undefined;

    if (!row) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (row.is_flagged) {
      return NextResponse.json({
        error: 'Your account has been temporarily suspended due to repeated fraudulent claims or policy violations. Please contact Campus Security or Dean of Student Affairs.'
      }, { status: 403 });
    }

    const valid = await verifyPassword(password, row.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user: User = {
      id: row.id,
      name: row.name,
      email: row.email,
      college_id: row.college_id,
      department: row.department,
      year: row.year,
      role: row.role,
      profile_image: row.profile_image,
      is_flagged: Boolean(row.is_flagged),
      false_claims_count: row.false_claims_count,
      created_at: row.created_at,
    };

    const token = createToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    const response = NextResponse.json({ user, message: 'Logged in successfully' });
    response.cookies.set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  }
}
