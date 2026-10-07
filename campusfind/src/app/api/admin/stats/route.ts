import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { SystemStats } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    const usersCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count;
    const lostCount = (db.prepare("SELECT COUNT(*) as count FROM items WHERE type = 'lost'").get() as { count: number }).count;
    const foundCount = (db.prepare("SELECT COUNT(*) as count FROM items WHERE type = 'found'").get() as { count: number }).count;
    const activeClaimsCount = (db.prepare("SELECT COUNT(*) as count FROM claims WHERE status IN ('pending', 'under_review')").get() as { count: number }).count;
    const returnedCount = (db.prepare("SELECT COUNT(*) as count FROM items WHERE status = 'returned'").get() as { count: number }).count;
    const pendingReportsCount = (db.prepare("SELECT COUNT(*) as count FROM reports WHERE status = 'pending'").get() as { count: number }).count;

    const totalReported = lostCount + foundCount;
    const recoveryRate = totalReported > 0 ? Math.round((returnedCount / Math.max(1, lostCount)) * 100) : 0;

    const itemsByCategory = db.prepare(`
      SELECT c.name, COUNT(i.id) as count
      FROM categories c
      LEFT JOIN items i ON i.category_id = c.id
      GROUP BY c.id
      ORDER BY count DESC
    `).all() as { name: string; count: number }[];

    const itemsByLocation = db.prepare(`
      SELECT l.name, COUNT(i.id) as count
      FROM locations l
      LEFT JOIN items i ON i.location_id = l.id
      GROUP BY l.id
      ORDER BY count DESC
      LIMIT 8
    `).all() as { name: string; count: number }[];

    const recentItems = db.prepare(`
      SELECT type, title, created_at as date
      FROM items
      ORDER BY id DESC
      LIMIT 6
    `).all() as { type: 'lost' | 'found'; title: string; date: string }[];

    const stats: SystemStats = {
      totalUsers: usersCount,
      totalLost: lostCount,
      totalFound: foundCount,
      activeClaims: activeClaimsCount,
      returnedItems: returnedCount,
      pendingReports: pendingReportsCount,
      recoveryRatePercent: recoveryRate,
      itemsByCategory,
      itemsByLocation,
      recentActivity: recentItems.map(item => ({
        type: item.type,
        title: item.title,
        date: item.date,
      })),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error calculating admin stats:', error);
    return NextResponse.json({ error: 'Failed to compute system statistics' }, { status: 500 });
  }
}
