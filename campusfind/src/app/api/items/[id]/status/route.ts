import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Item, ItemStatus } from '@/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = getDb();
    const item = db.prepare(`
      SELECT i.*, u.name as user_name
      FROM items i JOIN users u ON i.user_id = u.id
      WHERE i.id = ?
    `).get(Number(id)) as (Item & { user_name: string }) | undefined;

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const isAuthorized =
      currentUser.id === item.user_id || currentUser.role === 'admin' || currentUser.role === 'staff';

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized to change status of this item' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body as { status: ItemStatus };

    const validStatuses: ItemStatus[] = [
      'lost', 'found', 'possible_match', 'claim_pending', 'verified', 'returned', 'closed'
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid item status' }, { status: 400 });
    }

    db.prepare('UPDATE items SET status = ?, updated_at = datetime("now") WHERE id = ?').run(status, Number(id));

    // If marked returned, create celebration notification
    if (status === 'returned') {
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        item.user_id,
        '🎉 Item Successfully Returned!',
        `Your item "${item.title}" was marked as returned. Thank you for making our campus a better community!`,
        'returned',
        `/items/${item.id}`
      );
    }

    return NextResponse.json({
      message: `Status updated to ${status}`,
      status
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Failed to update item status' }, { status: 500 });
  }
}
