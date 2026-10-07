import { NextResponse } from 'next/server';
import { resetDatabase } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST() {
  try {
    const user = await getSessionUser();
    // Allow admin or initial demo setup
    if (user && user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    resetDatabase();
    return NextResponse.json({ message: 'CampusFind database reset and re-seeded with demo data successfully!' });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}
