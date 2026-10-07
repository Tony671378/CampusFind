import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Claim, ClaimStatus, Item } from '@/types';

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
    const claim = db.prepare(`
      SELECT c.*, i.user_id as item_owner_id, i.title as item_title, i.private_details, u.name as claimant_name, u.false_claims_count
      FROM claims c
      JOIN items i ON c.item_id = i.id
      JOIN users u ON c.claimant_id = u.id
      WHERE c.id = ?
    `).get(Number(id)) as (Claim & { item_owner_id: number; item_title: string; private_details: string; false_claims_count: number }) | undefined;

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    const isAuthorized =
      currentUser.id === claim.item_owner_id ||
      currentUser.role === 'admin' ||
      currentUser.role === 'staff';

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized to review this claim' }, { status: 403 });
    }

    const body = await request.json();
    const { status, admin_notes } = body as { status: ClaimStatus; admin_notes?: string };

    const validStatuses: ClaimStatus[] = ['pending', 'under_review', 'approved', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid claim status' }, { status: 400 });
    }

    // Update claim
    db.prepare(`
      UPDATE claims SET
        status = ?,
        reviewed_by = ?,
        admin_notes = COALESCE(?, admin_notes),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(status, currentUser.id, admin_notes || null, Number(id));

    // Handle status transitions
    if (status === 'approved') {
      // Set item to verified
      db.prepare("UPDATE items SET status = 'verified', updated_at = datetime('now') WHERE id = ?").run(claim.item_id);

      // Get safe handover setting
      const handoverRow = db.prepare("SELECT value FROM settings WHERE key = 'safe_handover_location'").get() as { value: string } | undefined;
      const handoverLoc = handoverRow ? handoverRow.value : 'Campus Security Office or Library Front Desk';

      // Notify claimant with safe handover instructions
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        claim.claimant_id,
        '✅ Ownership Claim Approved!',
        `Your ownership claim for "${claim.item_title}" was verified and approved by ${currentUser.name}! Please arrange handover at a safe campus location: ${handoverLoc}.`,
        'claim_status',
        `/claims`
      );
    } else if (status === 'rejected') {
      // Revert item status if no other active claims
      const otherClaims = db.prepare(`
        SELECT COUNT(*) as count FROM claims WHERE item_id = ? AND id != ? AND status IN ('pending', 'under_review', 'approved')
      `).get(claim.item_id, Number(id)) as { count: number };

      if (otherClaims.count === 0) {
        db.prepare("UPDATE items SET status = 'found', updated_at = datetime('now') WHERE id = ?").run(claim.item_id);
      }

      // Increment false claims counter for anti-fraud
      const newFalseCount = (claim.false_claims_count || 0) + 1;
      let flagUser = 0;
      if (newFalseCount >= 3) {
        flagUser = 1;
      }

      db.prepare(`
        UPDATE users SET
          false_claims_count = ?,
          is_flagged = ?
        WHERE id = ?
      `).run(newFalseCount, flagUser, claim.claimant_id);

      // Notify claimant
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        claim.claimant_id,
        '❌ Claim Not Verified',
        `Your claim for "${claim.item_title}" could not be verified against the item\'s identifying details.${flagUser ? ' WARNING: Your account has been flagged for multiple unverified claims.' : ''}`,
        'claim_status',
        '/claims'
      );

      // If user flagged, notify admin
      if (flagUser) {
        const admins = db.prepare("SELECT id FROM users WHERE role = 'admin'").all() as { id: number }[];
        for (const adm of admins) {
          db.prepare(`
            INSERT INTO notifications (user_id, title, message, type, link)
            VALUES (?, ?, ?, ?, ?)
          `).run(
            adm.id,
            '⚠️ Suspicious User Flagged (Anti-Fraud)',
            `Student ID #${claim.claimant_id} has accumulated ${newFalseCount} rejected claims and was automatically restricted.`,
            'admin',
            '/admin'
          );
        }
      }
    } else if (status === 'completed') {
      // Set item to returned
      db.prepare("UPDATE items SET status = 'returned', updated_at = datetime('now') WHERE id = ?").run(claim.item_id);

      // Notify both parties
      db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        claim.claimant_id,
        '🎉 Item Recovered Successfully!',
        `Your claim for "${claim.item_title}" is marked as complete. Glad you got your item back!`,
        'returned',
        `/items/${claim.item_id}`
      );
    }

    return NextResponse.json({
      message: `Claim status updated to ${status}`,
      status
    });
  } catch (error) {
    console.error('Error updating claim status:', error);
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 });
  }
}
