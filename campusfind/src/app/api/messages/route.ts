import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { Message } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get('user_id');
    const itemId = searchParams.get('item_id');

    let sql = `
      SELECT
        m.*,
        s.name as sender_name,
        r.name as receiver_name,
        i.title as item_title
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      LEFT JOIN items i ON m.item_id = i.id
      WHERE (m.sender_id = ? OR m.receiver_id = ?)
    `;
    const params: (string | number)[] = [user.id, user.id];

    if (otherUserId) {
      sql += ' AND (m.sender_id = ? OR m.receiver_id = ?)';
      params.push(Number(otherUserId), Number(otherUserId));
    }

    if (itemId) {
      sql += ' AND m.item_id = ?';
      params.push(Number(itemId));
    }

    sql += ' ORDER BY m.id ASC';

    const messages = db.prepare(sql).all(...params) as Message[];

    // Mark messages directed to current user as read
    if (otherUserId || itemId) {
      db.prepare(`
        UPDATE messages SET read_status = 1
        WHERE receiver_id = ? AND read_status = 0
      `).run(user.id);
    }

    // Also get active conversation threads summary
    const threads = db.prepare(`
      SELECT
        DISTINCT CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as contact_id,
        u.name as contact_name,
        u.role as contact_role,
        u.department as contact_department,
        u.profile_image as contact_image,
        m.item_id,
        i.title as item_title,
        (SELECT message FROM messages WHERE (sender_id = contact_id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = contact_id) ORDER BY id DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE (sender_id = contact_id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = contact_id) ORDER BY id DESC LIMIT 1) as last_timestamp,
        (SELECT COUNT(*) FROM messages WHERE sender_id = contact_id AND receiver_id = ? AND read_status = 0) as unread_count
      FROM messages m
      JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
      LEFT JOIN items i ON m.item_id = i.id
      WHERE m.sender_id = ? OR m.receiver_id = ?
    `).all(
      user.id, user.id, user.id, user.id, user.id, user.id, user.id, user.id, user.id
    );

    return NextResponse.json({ messages, threads });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
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
    const { receiver_id, item_id, message } = body;

    if (!receiver_id || !message || !message.trim()) {
      return NextResponse.json({ error: 'Receiver ID and message content are required' }, { status: 400 });
    }

    if (Number(receiver_id) === user.id) {
      return NextResponse.json({ error: 'You cannot send a message to yourself' }, { status: 400 });
    }

    const receiver = db.prepare('SELECT id, name FROM users WHERE id = ?').get(Number(receiver_id)) as { id: number; name: string } | undefined;
    if (!receiver) {
      return NextResponse.json({ error: 'Recipient user not found' }, { status: 404 });
    }

    const result = db.prepare(`
      INSERT INTO messages (sender_id, receiver_id, item_id, message)
      VALUES (?, ?, ?, ?)
    `).run(user.id, Number(receiver_id), item_id ? Number(item_id) : null, message.trim());

    // Send in-app notification to receiver
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      Number(receiver_id),
      `💬 New Message from ${user.name}`,
      message.trim().length > 60 ? `${message.trim().substring(0, 60)}...` : message.trim(),
      'message',
      `/messages?user_id=${user.id}${item_id ? `&item_id=${item_id}` : ''}`
    );

    const newMessage: Message = {
      id: Number(result.lastInsertRowid),
      sender_id: user.id,
      sender_name: user.name,
      receiver_id: Number(receiver_id),
      receiver_name: receiver.name,
      item_id: item_id ? Number(item_id) : undefined,
      message: message.trim(),
      created_at: new Date().toISOString(),
      read_status: false,
    };

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
