import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Item, MatchScore } from '@/types';
import { findMatchesForLostItem, findMatchesForFoundItem, calculateMatchScore } from '@/lib/matching';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');
    const currentUser = await getSessionUser();

    const fetchAllItems = () => {
      return db.prepare(`
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
        WHERE i.status != 'closed' AND i.status != 'returned'
      `).all() as Item[];
    };

    if (itemId) {
      // Find matches for a specific item
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
      `).get(Number(itemId)) as Item | undefined;

      if (!item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      const allItems = fetchAllItems();

      let matches: MatchScore[] = [];
      if (item.type === 'lost') {
        const foundItems = allItems.filter(i => i.type === 'found');
        matches = findMatchesForLostItem(item, foundItems, 35);
      } else {
        const lostItems = allItems.filter(i => i.type === 'lost');
        matches = findMatchesForFoundItem(item, lostItems, 35);
      }

      return NextResponse.json({ item, matches });
    }

    // If no itemId provided, check if user is logged in:
    // If logged in, find matches for user's active lost/found items
    // If not logged in or requested general list, return top matches across the whole campus!
    const allItems = fetchAllItems();
    const lostItems = allItems.filter(i => i.type === 'lost');
    const foundItems = allItems.filter(i => i.type === 'found');

    let targetLostItems = lostItems;
    if (currentUser && currentUser.role === 'student') {
      const myLost = lostItems.filter(i => i.user_id === currentUser.id);
      if (myLost.length > 0) {
        targetLostItems = myLost;
      }
    }

    const allMatches: MatchScore[] = [];
    for (const lost of targetLostItems) {
      for (const found of foundItems) {
        const match = calculateMatchScore(lost, found);
        if (match.score >= 50) {
          allMatches.push(match);
        }
      }
    }

    // Sort descending by score
    allMatches.sort((a, b) => b.score - a.score);

    return NextResponse.json({ matches: allMatches.slice(0, 30) });
  } catch (error) {
    console.error('Error calculating matches:', error);
    return NextResponse.json({ error: 'Failed to compute matches' }, { status: 500 });
  }
}
