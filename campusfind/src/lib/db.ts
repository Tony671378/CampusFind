import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { seedDatabase } from './seed';

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
  const dataDir = isVercel ? os.tmpdir() : path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      // directory exists or read-only
    }
  }

  const dbPath = path.join(dataDir, 'campusfind.db');
  const db = new Database(dbPath);

  // Enable WAL mode for high performance concurrency
  try {
    db.pragma('journal_mode = WAL');
  } catch {
    // pragma fallback
  }
  db.pragma('foreign_keys = ON');

  // Create tables if not existing
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      icon TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      building TEXT,
      zone TEXT,
      map_x REAL NOT NULL DEFAULT 50,
      map_y REAL NOT NULL DEFAULT 50
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      college_id TEXT NOT NULL,
      department TEXT NOT NULL,
      year TEXT,
      role TEXT NOT NULL DEFAULT 'student',
      profile_image TEXT,
      is_flagged INTEGER NOT NULL DEFAULT 0,
      false_claims_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('lost', 'found')),
      title TEXT NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      description TEXT NOT NULL,
      brand TEXT,
      color TEXT,
      model TEXT,
      location_id INTEGER NOT NULL REFERENCES locations(id),
      date TEXT NOT NULL,
      approximate_time TEXT,
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'lost',
      private_details TEXT,
      reward TEXT,
      storage_location TEXT,
      views_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      claimant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      verification_answers TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'under_review', 'approved', 'rejected', 'completed')),
      reviewed_by INTEGER REFERENCES users(id),
      admin_notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
      message TEXT NOT NULL,
      read_status INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      link TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reported_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'dismissed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Check if initial users exist, if not run seed
  const countRow = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (countRow.count === 0) {
    seedDatabase(db);
  }

  dbInstance = db;
  return dbInstance;
}

export function resetDatabase() {
  const db = getDb();
  db.exec(`
    DELETE FROM reports;
    DELETE FROM notifications;
    DELETE FROM messages;
    DELETE FROM claims;
    DELETE FROM items;
    DELETE FROM users;
    DELETE FROM locations;
    DELETE FROM categories;
    DELETE FROM settings;
  `);
  seedDatabase(db);
}
