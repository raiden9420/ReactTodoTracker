import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Survey schema
export const surveySchema = z.object({
  subjects: z.array(z.string()).min(1),
  interests: z.string().min(2),
  skills: z.string().min(2),
  goal: z.string(),
  thinking_style: z.enum(["Plan", "Flow"]),
  extra_info: z.string().optional(),
});

export type Survey = z.infer<typeof surveySchema>;

// Learning Goal schema
export const goalSchema = z.object({
  id: z.string().uuid().optional(),
  task: z.string().min(2),
  completed: z.boolean().default(false),
  userId: z.number().int().positive(),
});

export type Goal = z.infer<typeof goalSchema>;

// Goal creation schema
export const createGoalSchema = goalSchema.omit({ id: true });
export type CreateGoal = z.infer<typeof createGoalSchema>;

// Goal update schema
export const updateGoalSchema = goalSchema.pick({ completed: true });
export type UpdateGoal = z.infer<typeof updateGoalSchema>;

// User profile combining user account and survey data
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subjects: text("subjects").array().notNull(),
  interests: text("interests").notNull(),
  skills: text("skills").notNull(), 
  goal: text("goal").notNull(),
  thinking_style: text("thinking_style").notNull(),
  extra_info: text("extra_info"),
  created_at: text("created_at").notNull().default("NOW()"),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  created_at: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
