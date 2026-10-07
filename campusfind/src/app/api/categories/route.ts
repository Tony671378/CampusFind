import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Category } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const categories = db.prepare(`
      SELECT
        c.*,
        (SELECT COUNT(*) FROM items i WHERE i.category_id = c.id AND i.status != 'returned') as active_items_count,
        (SELECT COUNT(*) FROM items i WHERE i.category_id = c.id) as total_items_count
      FROM categories c
      ORDER BY c.id ASC
    `).all() as (Category & { active_items_count: number; total_items_count: number })[];

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const db = getDb();
    const body = await request.json();
    const { name, icon, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const result = db.prepare(`
      INSERT INTO categories (name, icon, slug, description)
      VALUES (?, ?, ?, ?)
    `).run(name.trim(), icon || 'Tag', slug, description?.trim() || '');

    return NextResponse.json({
      category: { id: Number(result.lastInsertRowid), name, icon, slug, description },
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
