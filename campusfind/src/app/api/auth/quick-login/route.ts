import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createToken, TOKEN_COOKIE_NAME } from '@/lib/auth';
import { User } from '@/types';

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { userId, role } = body;

    let userRow: User | undefined;

    if (userId) {
      userRow = db.prepare(`
        SELECT id, name, email, college_id, department, year, role, profile_image, is_flagged, false_claims_count, created_at
        FROM users WHERE id = ?
      `).get(Number(userId)) as User | undefined;
    } else if (role) {
      userRow = db.prepare(`
        SELECT id, name, email, college_id, department, year, role, profile_image, is_flagged, false_claims_count, created_at
        FROM users WHERE role = ? ORDER BY id ASC LIMIT 1
      `).get(role) as User | undefined;
    } else {
      // Default to student Alex Rivera
      userRow = db.prepare(`
        SELECT id, name, email, college_id, department, year, role, profile_image, is_flagged, false_claims_count, created_at
        FROM users WHERE id = 1
      `).get() as User | undefined;
    }

    if (!userRow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user: User = {
      ...userRow,
      is_flagged: Boolean(userRow.is_flagged),
    };

    const token = createToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    const response = NextResponse.json({ user, message: `Switched session to ${user.name} (${user.role})` });
    response.cookies.set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Quick login error:', error);
    return NextResponse.json({ error: 'Quick login failed' }, { status: 500 });
  }
}
