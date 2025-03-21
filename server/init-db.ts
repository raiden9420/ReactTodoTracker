
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('emerge.db');

db.serialize(() => {
  // Drop existing tables
  db.run('DROP TABLE IF EXISTS goals');
  db.run('DROP TABLE IF EXISTS users');

  // Create users table with all required fields
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subjects TEXT NOT NULL,
    interests TEXT NOT NULL,
    skills TEXT NOT NULL,
    goal TEXT NOT NULL,
    thinking_style TEXT NOT NULL,
    extra_info TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create goals table
  db.run(`CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  console.log('Database tables created successfully');
  db.close();
});
