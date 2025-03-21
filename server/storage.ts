import { users, type User, type InsertUser, type Survey, type UserProfile, type InsertUserProfile } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // User profile methods
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, profile: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  
  // Survey submission method
  submitSurvey(survey: Survey, userId?: number): Promise<{ userId: number, profile: UserProfile }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userProfiles: Map<number, UserProfile>;
  private userIdCounter: number;
  private profileIdCounter: number;

  constructor() {
    this.users = new Map();
    this.userProfiles = new Map();
    this.userIdCounter = 1;
    this.profileIdCounter = 1;
    
    // Add a demo user for testing
    const demoUser: User = {
      id: this.userIdCounter++,
      username: "demo_user",
      password: "password123",
    };
    this.users.set(demoUser.id, demoUser);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    // Find the profile for this user
    return Array.from(this.userProfiles.values()).find(
      (profile) => profile.userId === userId
    );
  }
  
  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const id = this.profileIdCounter++;
    const now = new Date().toISOString();
    const userProfile: UserProfile = { 
      ...profile, 
      id,
      extra_info: profile.extra_info || null,
      created_at: now
    };
    
    this.userProfiles.set(id, userProfile);
    return userProfile;
  }
  
  async updateUserProfile(userId: number, updatedProfile: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    // Find the profile to update
    const existingProfile = await this.getUserProfile(userId);
    
    if (!existingProfile) {
      return undefined;
    }
    
    // Create updated profile
    const updatedUserProfile: UserProfile = {
      ...existingProfile,
      ...updatedProfile
    };
    
    // Save updated profile
    this.userProfiles.set(existingProfile.id, updatedUserProfile);
    
    return updatedUserProfile;
  }
  
  async submitSurvey(survey: Survey, userId: number = 1): Promise<{ userId: number, profile: UserProfile }> {
    // Get or create user if needed
    let user = await this.getUser(userId);
    
    if (!user) {
      user = await this.createUser({
        username: `user_${Date.now()}`,
        password: `pass_${Date.now()}`
      });
    }
    
    // Check if user already has a profile
    const existingProfile = await this.getUserProfile(user.id);
    
    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await this.updateUserProfile(user.id, {
        subjects: survey.subjects,
        interests: survey.interests,
        skills: survey.skills,
        goal: survey.goal,
        thinking_style: survey.thinking_style,
        extra_info: survey.extra_info || null
      });
      
      return { userId: user.id, profile: updatedProfile! };
    } else {
      // Create new profile
      const newProfile = await this.createUserProfile({
        userId: user.id,
        subjects: survey.subjects,
        interests: survey.interests,
        skills: survey.skills,
        goal: survey.goal,
        thinking_style: survey.thinking_style,
        extra_info: survey.extra_info || null
      });
      
      return { userId: user.id, profile: newProfile };
    }
  }
}

export const storage = new MemStorage();
