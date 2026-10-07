import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { User } from '@/types';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const db = getDb();
    const rows = db.prepare(`
      SELECT
        u.id, u.name, u.email, u.college_id, u.department, u.year, u.role, u.profile_image, u.is_flagged, u.false_claims_count, u.created_at,
        (SELECT COUNT(*) FROM items WHERE user_id = u.id AND type = 'lost') as lost_count,
        (SELECT COUNT(*) FROM items WHERE user_id = u.id AND type = 'found') as found_count,
        (SELECT COUNT(*) FROM claims WHERE claimant_id = u.id) as claims_count
      FROM users u
      ORDER BY u.id ASC
    `).all() as (User & { lost_count: number; found_count: number; claims_count: number })[];

    const users = rows.map(u => ({
      ...u,
      is_flagged: Boolean(u.is_flagged),
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const db = getDb();
    const body = await request.json();
    const { id, is_flagged, role, reset_claims } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (is_flagged !== undefined) {
      db.prepare('UPDATE users SET is_flagged = ? WHERE id = ?').run(is_flagged ? 1 : 0, Number(id));
    }

    if (role && ['student', 'staff', 'admin'].includes(role)) {
      db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, Number(id));
    }

    if (reset_claims) {
      db.prepare('UPDATE users SET false_claims_count = 0, is_flagged = 0 WHERE id = ?').run(Number(id));
    }

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
