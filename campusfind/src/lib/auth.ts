import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'campusfind-super-secret-jwt-key-2026';
const TOKEN_COOKIE_NAME = 'campusfind_token';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(payload: { id: number; email: string; role: string; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { id: number; email: string; role: string; name: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string; name: string };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    // Fetch user from DB
    const { getDb } = await import('./db');
    const db = getDb();
    const user = db.prepare(`
      SELECT id, name, email, college_id, department, year, role, profile_image, is_flagged, false_claims_count, created_at
      FROM users WHERE id = ?
    `).get(payload.id) as User | undefined;

    if (!user) return null;
    return {
      ...user,
      is_flagged: Boolean(user.is_flagged),
    };
  } catch (error) {
    console.error('getSessionUser error:', error);
    return null;
  }
}

export { TOKEN_COOKIE_NAME };
