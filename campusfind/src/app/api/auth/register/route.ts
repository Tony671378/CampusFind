import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, createToken, TOKEN_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { name, email, password, college_id, department, year, role = 'student' } = body;

    if (!name || !email || !password || !college_id || !department) {
      return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 });
    }

    // Check allowed domain setting
    const domainRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('allowed_email_domain') as { value: string } | undefined;
    const allowedDomain = domainRow ? domainRow.value.toLowerCase().trim() : '@college.edu';

    if (allowedDomain && !email.toLowerCase().endsWith(allowedDomain)) {
      return NextResponse.json({
        error: `Registration requires a valid campus email ending in ${allowedDomain}`
      }, { status: 400 });
    }

    // Check existing email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const validRole = ['student', 'staff', 'admin'].includes(role) ? role : 'student';

    const defaultAvatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`;

    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash, college_id, department, year, role, profile_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      email.toLowerCase().trim(),
      passwordHash,
      college_id.trim(),
      department.trim(),
      year || '1st Year',
      validRole,
      defaultAvatar
    );

    const user = {
      id: Number(result.lastInsertRowid),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      college_id: college_id.trim(),
      department: department.trim(),
      year: year || '1st Year',
      role: validRole,
      profile_image: defaultAvatar,
      is_flagged: false,
      false_claims_count: 0,
      created_at: new Date().toISOString(),
    };

    const token = createToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    // Create welcome notification
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      user.id,
      'Welcome to CampusFind! 🎉',
      'Your account is verified. You can now report lost or found items and search campus reports.',
      'admin',
      '/items'
    );

    const response = NextResponse.json({ user, message: 'Account created successfully' });
    response.cookies.set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error during registration' }, { status: 500 });
  }
}
