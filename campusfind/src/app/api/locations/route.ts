import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { CampusLocation } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const locations = db.prepare(`
      SELECT
        l.*,
        (SELECT COUNT(*) FROM items i WHERE i.location_id = l.id AND i.type = 'lost' AND i.status != 'returned') as lost_count,
        (SELECT COUNT(*) FROM items i WHERE i.location_id = l.id AND i.type = 'found' AND i.status != 'returned') as found_count,
        (SELECT COUNT(*) FROM items i WHERE i.location_id = l.id) as total_items
      FROM locations l
      ORDER BY l.id ASC
    `).all() as (CampusLocation & { lost_count: number; found_count: number; total_items: number })[];

    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ error: 'Failed to fetch campus locations' }, { status: 500 });
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
    const { name, building, zone, map_x, map_y, description } = body;

    if (!name || !building) {
      return NextResponse.json({ error: 'Location name and building are required' }, { status: 400 });
    }

    const result = db.prepare(`
      INSERT INTO locations (name, building, zone, map_x, map_y, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      building.trim(),
      zone?.trim() || 'General',
      map_x !== undefined ? Number(map_x) : 50,
      map_y !== undefined ? Number(map_y) : 50,
      description?.trim() || ''
    );

    return NextResponse.json({
      location: { id: Number(result.lastInsertRowid), name, building, zone, map_x, map_y, description },
      message: 'Location added successfully'
    });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}
