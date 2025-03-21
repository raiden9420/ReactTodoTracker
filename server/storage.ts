
import { Database } from 'sqlite3';
import * as schema from '../shared/schema';

const db = new Database('emerge.db');

export async function validateConnection() {
  return new Promise((resolve) => {
    db.get("SELECT 1", (err) => {
      resolve(!err);
    });
  });
}

export class SQLiteStorage implements IStorage {
  async getUser(id: number): Promise<schema.User | undefined> {
    return new Promise((resolve) => {
      db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
        resolve(row);
      });
    });
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    return new Promise((resolve) => {
      db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        resolve(row);
      });
    });
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    return new Promise((resolve, reject) => {
      db.run("INSERT INTO users (username, password) VALUES (?, ?)", 
        [user.username, user.password],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, ...user });
        });
    });
  }

  async getUserProfile(userId: number): Promise<schema.UserProfile | undefined> {
    return new Promise((resolve) => {
      db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
        resolve(row);
      });
    });
  }

  async createUserProfile(profile: schema.InsertUserProfile): Promise<schema.UserProfile> {
    return new Promise((resolve, reject) => {
      db.run("UPDATE users SET skills = ?, subjects = ?, interests = ?, goal = ?, thinking_style = ?, extra_info = ? WHERE id = ?",
        [profile.skills, JSON.stringify(profile.subjects), profile.interests, profile.goal, profile.thinking_style, profile.extra_info, profile.userId],
        (err) => {
          if (err) reject(err);
          resolve(profile as schema.UserProfile);
        });
    });
  }

  async updateUserProfile(userId: number, profile: Partial<schema.InsertUserProfile>): Promise<schema.UserProfile | undefined> {
    const current = await this.getUserProfile(userId);
    if (!current) return undefined;
    
    const updated = { ...current, ...profile };
    return new Promise((resolve, reject) => {
      db.run("UPDATE users SET skills = ?, subjects = ?, interests = ?, goal = ?, thinking_style = ?, extra_info = ? WHERE id = ?",
        [updated.skills, JSON.stringify(updated.subjects), updated.interests, updated.goal, updated.thinking_style, updated.extra_info, userId],
        (err) => {
          if (err) reject(err);
          resolve(updated as schema.UserProfile);
        });
    });
  }

  async submitSurvey(survey: schema.Survey, userId?: number): Promise<{ userId: number; profile: schema.UserProfile }> {
    // Implementation depends on your specific requirements
    throw new Error("Method not implemented.");
  }

  async getGoals(userId: number): Promise<schema.Goal[]> {
    return new Promise((resolve) => {
      db.all("SELECT * FROM goals WHERE user_id = ?", [userId], (err, rows) => {
        resolve(rows || []);
      });
    });
  }

  async createGoal(goal: schema.CreateGoal): Promise<schema.Goal> {
    return new Promise((resolve, reject) => {
      db.run("INSERT INTO goals (task, completed, user_id) VALUES (?, ?, ?)",
        [goal.task, goal.completed, goal.userId],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID.toString(), ...goal });
        });
    });
  }

  async updateGoal(id: string, updates: schema.UpdateGoal): Promise<schema.Goal | undefined> {
    return new Promise((resolve) => {
      db.run("UPDATE goals SET completed = ? WHERE id = ?",
        [updates.completed, id],
        (err) => {
          if (!err) {
            resolve({ id, ...updates } as schema.Goal);
          } else {
            resolve(undefined);
          }
        });
    });
  }

  async deleteGoal(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      db.run("DELETE FROM goals WHERE id = ?", [id], (err) => {
        resolve(!err);
      });
    });
  }
}

export const storage = new SQLiteStorage();
