
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('emerge.db');

db.serialize(() => {
  // Drop existing tables
  db.run('DROP TABLE IF EXISTS users');
  db.run('DROP TABLE IF EXISTS goals');

  // Create users table with all required fields
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    email TEXT,
    subjects TEXT,
    interests TEXT,
    skills TEXT,
    goal TEXT,
    thinking_style TEXT,
    extra_info TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create goals table
  db.run(`CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    completed BOOLEAN DEFAULT 0,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  console.log('Database tables created successfully');
  db.close();
});
