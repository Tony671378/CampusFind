import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Claim, Item } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');

    let sql = `
      SELECT
        c.*,
        i.title as item_title,
        i.type as item_type,
        i.image_url as item_image,
        i.user_id as item_owner_id,
        u.name as claimant_name,
        u.email as claimant_email,
        u.college_id as claimant_college_id,
        r.name as reviewer_name
      FROM claims c
      JOIN items i ON c.item_id = i.id
      JOIN users u ON c.claimant_id = u.id
      LEFT JOIN users r ON c.reviewed_by = r.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (itemId) {
      sql += ' AND c.item_id = ?';
      params.push(Number(itemId));
    }

    // Role filtering: Student only sees claims they created OR claims on items they reported
    if (user.role === 'student') {
      sql += ' AND (c.claimant_id = ? OR i.user_id = ?)';
      params.push(user.id, user.id);
    }

    sql += ' ORDER BY c.id DESC';

    const rows = db.prepare(sql).all(...params) as (Claim & { verification_answers: string })[];

    const claims: Claim[] = rows.map(r => ({
      ...r,
      verification_answers: typeof r.verification_answers === 'string'
        ? JSON.parse(r.verification_answers)
        : r.verification_answers,
    }));

    return NextResponse.json({ claims });
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required to submit a claim' }, { status: 401 });
    }

    const db = getDb();

    // Anti-Fraud check
    if (user.is_flagged || user.false_claims_count >= 3) {
      return NextResponse.json({
        error: 'Your account has been temporarily restricted from submitting claims due to suspicious activity or repeated unverified claims. Please visit the Campus Security Office in person.'
      }, { status: 403 });
    }

    const body = await request.json();
    const { item_id, verification_answers } = body;

    if (!item_id || !verification_answers) {
      return NextResponse.json({ error: 'Item ID and verification answers are required' }, { status: 400 });
    }

    const item = db.prepare(`
      SELECT i.*, u.name as user_name, u.email as user_email
      FROM items i JOIN users u ON i.user_id = u.id
      WHERE i.id = ?
    `).get(Number(item_id)) as Item | undefined;

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.user_id === user.id) {
      return NextResponse.json({ error: 'You cannot submit a claim for an item you reported yourself' }, { status: 400 });
    }

    // Check for existing pending claim
    const existing = db.prepare(`
      SELECT id FROM claims WHERE item_id = ? AND claimant_id = ? AND status IN ('pending', 'under_review')
    `).get(Number(item_id), user.id);

    if (existing) {
      return NextResponse.json({ error: 'You already have an active claim under review for this item' }, { status: 409 });
    }

    const answersJson = JSON.stringify(verification_answers);

    const insertResult = db.prepare(`
      INSERT INTO claims (item_id, claimant_id, verification_answers, status)
      VALUES (?, ?, ?, 'pending')
    `).run(Number(item_id), user.id, answersJson);

    // Update item status to claim_pending
    db.prepare("UPDATE items SET status = 'claim_pending', updated_at = datetime('now') WHERE id = ?").run(Number(item_id));

    // Notify finder / item reporter
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      item.user_id,
      '📋 New Ownership Claim Received',
      `${user.name} submitted an ownership claim with verification answers for "${item.title}". Review their answers now.`,
      'claim',
      `/claims`
    );

    // Notify claimant
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      user.id,
      'Claim Submitted Successfully',
      `Your verification claim for "${item.title}" was submitted. The finder/campus staff has been notified.`,
      'claim_status',
      `/claims`
    );

    return NextResponse.json({
      claimId: Number(insertResult.lastInsertRowid),
      message: 'Claim submitted successfully. The finder has been notified to verify your answers.'
    });
  } catch (error) {
    console.error('Error submitting claim:', error);
    return NextResponse.json({ error: 'Failed to submit claim' }, { status: 500 });
  }
}
