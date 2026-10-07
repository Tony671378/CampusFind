import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Item } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const currentUser = await getSessionUser();

    // Increment views count
    db.prepare('UPDATE items SET views_count = views_count + 1 WHERE id = ?').run(Number(id));

    const item = db.prepare(`
      SELECT
        i.*,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role,
        c.name as category_name,
        c.icon as category_icon,
        l.name as location_name
      FROM items i
      JOIN users u ON i.user_id = u.id
      JOIN categories c ON i.category_id = c.id
      JOIN locations l ON i.location_id = l.id
      WHERE i.id = ?
    `).get(Number(id)) as Item | undefined;

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const isAuthorized =
      currentUser &&
      (currentUser.id === item.user_id || currentUser.role === 'admin' || currentUser.role === 'staff');

    // Protect private verification details from public viewers
    const sanitizedItem = {
      ...item,
      has_private_verification: Boolean(item.private_details && item.private_details.trim().length > 0),
      private_details: isAuthorized ? item.private_details : undefined,
    };

    return NextResponse.json({ item: sanitizedItem, canEdit: isAuthorized });
  } catch (error) {
    console.error('Error fetching item details:', error);
    return NextResponse.json({ error: 'Failed to retrieve item details' }, { status: 500 });
  }
}

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
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(Number(id)) as Item | undefined;
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.user_id !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized to edit this item' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, brand, color, model, location_id, category_id, reward, storage_location, image_url, private_details } = body;

    db.prepare(`
      UPDATE items SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        brand = COALESCE(?, brand),
        color = COALESCE(?, color),
        model = COALESCE(?, model),
        location_id = COALESCE(?, location_id),
        category_id = COALESCE(?, category_id),
        reward = COALESCE(?, reward),
        storage_location = COALESCE(?, storage_location),
        image_url = COALESCE(?, image_url),
        private_details = COALESCE(?, private_details),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(
      title, description, brand, color, model,
      location_id ? Number(location_id) : null,
      category_id ? Number(category_id) : null,
      reward, storage_location, image_url, private_details,
      Number(id)
    );

    const updated = db.prepare(`
      SELECT i.*, c.name as category_name, l.name as location_name
      FROM items i
      JOIN categories c ON i.category_id = c.id
      JOIN locations l ON i.location_id = l.id
      WHERE i.id = ?
    `).get(Number(id));

    return NextResponse.json({ item: updated, message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
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
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(Number(id)) as Item | undefined;
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.user_id !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized to delete this item' }, { status: 403 });
    }

    db.prepare('DELETE FROM items WHERE id = ?').run(Number(id));
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
