
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('emerge.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
  db.run('PRAGMA foreign_keys = ON');
  db.run('PRAGMA journal_mode = WAL');
});

process.on('exit', () => {
  db.close((err) => {
    if (err) console.error('Error closing database:', err);
  });
});

export interface User {
  id: number;
  username: string;
  password: string;
  skills?: string;
  subjects?: string;
  interests?: string;
  goal?: string;
  thinking_style?: string;
  extra_info?: string;
}

export interface Goal {
  id: number;
  task: string;
  completed: boolean;
  user_id: number;
}

export const storage = {
  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(
        'INSERT INTO users (username, password, skills, subjects, interests, goal, thinking_style, extra_info) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );
      stmt.run(
        [user.username, user.password, user.skills, user.subjects, user.interests, user.goal, user.thinking_style, user.extra_info],
        function(err) {
          if (err) reject(err);
          resolve({ ...user, id: this.lastID });
        }
      );
    });
  },

  async getUser(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        resolve(row || null);
      });
    });
  },

  async getUserByUsername(username: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        resolve(row || null);
      });
    });
  },

  async updateUser(id: number, updates: Partial<User>): Promise<void> {
    const sets: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id') {
        sets.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    values.push(id);
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET ${sets.join(', ')} WHERE id = ?`,
        values,
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  },

  async createGoal(goal: Omit<Goal, 'id'>): Promise<Goal> {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare('INSERT INTO goals (task, completed, user_id) VALUES (?, ?, ?)');
      stmt.run([goal.task, goal.completed, goal.user_id], function(err) {
        if (err) reject(err);
        resolve({ ...goal, id: this.lastID });
      });
    });
  },

  async getGoals(userId: number): Promise<Goal[]> {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM goals WHERE user_id = ?', [userId], (err, rows) => {
        if (err) reject(err);
        resolve(rows || []);
      });
    });
  },

  async updateGoal(id: number, updates: Partial<Goal>): Promise<void> {
    const sets: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id') {
        sets.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    values.push(id);
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE goals SET ${sets.join(', ')} WHERE id = ?`,
        values,
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }
};
