import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Report } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      return NextResponse.json({ error: 'Staff or admin authorization required' }, { status: 403 });
    }

    const db = getDb();
    const reports = db.prepare(`
      SELECT
        r.*,
        u.name as reporter_name,
        i.title as item_title
      FROM reports r
      JOIN users u ON r.reported_by = u.id
      JOIN items i ON r.item_id = i.id
      ORDER BY r.id DESC
    `).all() as Report[];

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch moderation reports' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = getDb();
    const body = await request.json();
    const { item_id, reason } = body;

    if (!item_id || !reason || !reason.trim()) {
      return NextResponse.json({ error: 'Item ID and reason are required' }, { status: 400 });
    }

    const item = db.prepare('SELECT id, title FROM items WHERE id = ?').get(Number(item_id)) as { id: number; title: string } | undefined;
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const result = db.prepare(`
      INSERT INTO reports (reported_by, item_id, reason, status)
      VALUES (?, ?, ?, 'pending')
    `).run(user.id, Number(item_id), reason.trim());

    // Notify admins
    const admins = db.prepare("SELECT id FROM users WHERE role = 'admin'").all() as { id: number }[];
    for (const adm of admins) {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        adm.id,
        '🚨 Item Flagged for Review',
        `User ${user.name} reported item "${item.title}" for review: "${reason.trim().slice(0, 50)}..."`,
        'admin',
        `/admin`
      );
    }

    return NextResponse.json({
      reportId: Number(result.lastInsertRowid),
      message: 'Report submitted. Campus administrators have been alerted for review.'
    });
  } catch (error) {
    console.error('Error submitting report:', error);
    return NextResponse.json({ error: 'Failed to report item' }, { status: 500 });
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
    const { id, status } = body;

    if (!id || !['pending', 'reviewed', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid report status' }, { status: 400 });
    }

    db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, Number(id));

    return NextResponse.json({ message: `Report marked as ${status}` });
  } catch (error) {
    console.error('Error updating report status:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
