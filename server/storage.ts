import sqlite3 from 'sqlite3';
import { Survey, Goal, User } from '@shared/schema';

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

export const storage = {
  async submitSurvey(surveyData: Survey) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(
        'INSERT INTO users (name, email, subjects, interests, skills, goal, thinking_style, extra_info, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      stmt.run(
        [
          surveyData.name,
          surveyData.email,
          JSON.stringify(surveyData.subjects),
          surveyData.interests,
          surveyData.skills,
          surveyData.goal,
          surveyData.thinking_style,
          surveyData.extra_info || '',
          new Date().toISOString()
        ],
        function(err) {
          if (err) reject(err);
          resolve({ 
            userId: this.lastID, 
            profile: {
              ...surveyData,
              created_at: new Date().toISOString()
            }
          });
        }
      );
    });
  },

  async getUserProfile(userId: number) {
    return new Promise((resolve, reject) => {
      db.get('SELECT name, email, subjects, interests, skills, goal, thinking_style, extra_info, created_at FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        if (row && row.subjects) {
          try {
            row.subjects = JSON.parse(row.subjects);
          } catch (e) {
            console.error('Error parsing subjects:', e);
            row.subjects = [];
          }
        }
        resolve(row || null);
      });
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
      stmt.run([goal.task, goal.completed ? 1 : 0, goal.userId], function(err) {
        if (err) reject(err);
        resolve({ ...goal, id: this.lastID.toString() });
      });
    });
  },

  async getGoals(userId: number): Promise<Goal[]> {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM goals WHERE user_id = ?', [userId], (err, rows) => {
        if (err) reject(err);
        resolve(rows?.map(row => ({
          ...row,
          id: row.id.toString(),
          completed: Boolean(row.completed)
        })) || []);
      });
    });
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | null> {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE goals SET completed = ? WHERE id = ?',
        [updates.completed ? 1 : 0, id],
        (err) => {
          if (err) reject(err);
          db.get('SELECT * FROM goals WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            if (!row) resolve(null);
            resolve({
              ...row,
              id: row.id.toString(),
              completed: Boolean(row.completed)
            });
          });
        }
      );
    });
  },

  async deleteGoal(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM goals WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        resolve(true);
      });
    });
  }
};