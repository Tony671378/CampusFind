import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Item } from '@/types';
import { findMatchesForLostItem, findMatchesForFoundItem } from '@/lib/matching';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type'); // 'lost', 'found', or null for all
    const categoryId = searchParams.get('category_id');
    const locationId = searchParams.get('location_id');
    const search = searchParams.get('search');
    const color = searchParams.get('color');
    const brand = searchParams.get('brand');
    const status = searchParams.get('status');
    const userId = searchParams.get('user_id');
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

    let sql = `
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
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (type && (type === 'lost' || type === 'found')) {
      sql += ' AND i.type = ?';
      params.push(type);
    }

    if (categoryId) {
      sql += ' AND i.category_id = ?';
      params.push(Number(categoryId));
    }

    if (locationId) {
      sql += ' AND i.location_id = ?';
      params.push(Number(locationId));
    }

    if (status) {
      sql += ' AND i.status = ?';
      params.push(status);
    }

    if (color) {
      sql += ' AND LOWER(i.color) LIKE ?';
      params.push(`%${color.toLowerCase()}%`);
    }

    if (brand) {
      sql += ' AND LOWER(i.brand) LIKE ?';
      params.push(`%${brand.toLowerCase()}%`);
    }

    if (userId) {
      sql += ' AND i.user_id = ?';
      params.push(Number(userId));
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      sql += ` AND (
        LOWER(i.title) LIKE ? OR
        LOWER(i.description) LIKE ? OR
        LOWER(i.brand) LIKE ? OR
        LOWER(i.color) LIKE ? OR
        LOWER(i.model) LIKE ? OR
        LOWER(l.name) LIKE ? OR
        LOWER(c.name) LIKE ?
      )`;
      params.push(q, q, q, q, q, q, q);
    }

    sql += ' ORDER BY i.id DESC LIMIT ?';
    params.push(limit);

    const rows = db.prepare(sql).all(...params) as Item[];

    // Mask private_details from public listing
    const sanitizedRows = rows.map(item => ({
      ...item,
      private_details: undefined, // Never expose in bulk listings
    }));

    return NextResponse.json({ items: sanitizedRows });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required. Please login first.' }, { status: 401 });
    }

    const db = getDb();
    const body = await request.json();

    const {
      type, // 'lost' | 'found'
      title,
      category_id,
      description,
      brand = '',
      color = '',
      model = '',
      location_id,
      date,
      approximate_time = '',
      image_url = '',
      private_details = '',
      reward = '',
      storage_location = '',
    } = body;

    if (!type || !title || !category_id || !description || !location_id || !date) {
      return NextResponse.json({ error: 'Missing required report fields' }, { status: 400 });
    }

    // Default status: 'lost' or 'found'
    let initialStatus = type === 'lost' ? 'lost' : 'found';

    const insertStmt = db.prepare(`
      INSERT INTO items (
        user_id, type, title, category_id, description, brand, color, model,
        location_id, date, approximate_time, image_url, status,
        private_details, reward, storage_location
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      user.id,
      type,
      title.trim(),
      Number(category_id),
      description.trim(),
      brand.trim(),
      color.trim(),
      model.trim(),
      Number(location_id),
      date,
      approximate_time.trim(),
      image_url.trim() || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
      initialStatus,
      private_details.trim(),
      reward.trim(),
      storage_location.trim()
    );

    const newItemId = Number(result.lastInsertRowid);

    // Fetch the inserted item with full joined fields
    const newItem = db.prepare(`
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
    `).get(newItemId) as Item;

    // --- Run Smart Matching immediately ---
    let matchFound = false;
    let topMatchScore = 0;

    if (type === 'lost') {
      const allFound = db.prepare(`
        SELECT i.*, c.name as category_name, l.name as location_name
        FROM items i
        JOIN categories c ON i.category_id = c.id
        JOIN locations l ON i.location_id = l.id
        WHERE i.type = 'found' AND i.status != 'returned'
      `).all() as Item[];

      const matches = findMatchesForLostItem(newItem, allFound, 60);

      if (matches.length > 0) {
        matchFound = true;
        topMatchScore = matches[0].score;
        db.prepare("UPDATE items SET status = 'possible_match' WHERE id = ?").run(newItemId);

        // Notify reporter of top match
        const topMatch = matches[0];
        db.prepare(`
          INSERT INTO notifications (user_id, title, message, type, link)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          user.id,
          `🔔 Possible Match Found (${topMatch.score}%)`,
          `A found report "${topMatch.foundItem.title}" at ${topMatch.foundItem.location_name} may match your lost report. Review and submit a claim to verify ownership.`,
          'match',
          `/items/${topMatch.foundItem.id}`
        );

        // Also notify the finder that a lost report matched
        db.prepare(`
          INSERT INTO notifications (user_id, title, message, type, link)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          topMatch.foundItem.user_id,
          `🔔 Possible Match for Found Item (${topMatch.score}%)`,
          `A student just reported losing "${newItem.title}" which matches your found item report at ${newItem.location_name}.`,
          'match',
          `/items/${newItem.id}`
        );
      }
    } else if (type === 'found') {
      const allLost = db.prepare(`
        SELECT i.*, c.name as category_name, l.name as location_name
        FROM items i
        JOIN categories c ON i.category_id = c.id
        JOIN locations l ON i.location_id = l.id
        WHERE i.type = 'lost' AND i.status != 'returned'
      `).all() as Item[];

      const matches = findMatchesForFoundItem(newItem, allLost, 60);

      if (matches.length > 0) {
        matchFound = true;
        topMatchScore = matches[0].score;

        for (const m of matches.slice(0, 3)) {
          // Update lost item status to possible_match
          db.prepare("UPDATE items SET status = 'possible_match' WHERE id = ?").run(m.lostItem.id);

          // Notify the person who lost it
          db.prepare(`
            INSERT INTO notifications (user_id, title, message, type, link)
            VALUES (?, ?, ?, ?, ?)
          `).run(
            m.lostItem.user_id,
            `🔔 Possible Match Found (${m.score}%)`,
            `An item matching your lost "${m.lostItem.title}" was just found at ${newItem.location_name}! Check details and submit a claim.`,
            'match',
            `/items/${newItem.id}`
          );
        }
      }
    }

    return NextResponse.json({
      item: newItem,
      matched: matchFound,
      matchScore: topMatchScore,
      message: `${type === 'lost' ? 'Lost' : 'Found'} item reported successfully!`
    });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Failed to report item' }, { status: 500 });
  }
}
