import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { surveySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // API endpoint to submit survey data
  app.post("/api/survey", async (req: Request, res: Response) => {
    try {
      // Validate the request body using Zod schema
      const validatedData = surveySchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid survey data", 
          errors: validatedData.error.flatten() 
        });
      }
      
      // Get the survey data
      const surveyData = validatedData.data;
      
      // Store the survey data (for now using demo user ID 1)
      const result = await storage.submitSurvey(surveyData);
      
      // Return success response
      return res.status(200).json({ 
        success: true, 
        message: "Survey submitted successfully",
        userId: result.userId,
        profileId: result.profile.id
      });
    } catch (error) {
      console.error("Error submitting survey:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to submit survey" 
      });
    }
  });

  // API endpoint to get user profile data
  app.get("/api/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      
      if (isNaN(userId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid user ID" 
        });
      }
      
      // Get the user
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }
      
      // Get the user profile
      const profile = await storage.getUserProfile(userId);
      
      // If no profile exists yet, return basic user info
      if (!profile) {
        return res.status(200).json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            hasProfile: false
          }
        });
      }
      
      // Return user data with profile
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          hasProfile: true,
          subjects: profile.subjects,
          interests: profile.interests,
          skills: profile.skills,
          goal: profile.goal,
          thinking_style: profile.thinking_style,
          extra_info: profile.extra_info,
          created_at: profile.created_at
        }
      });
    } catch (error) {
      console.error("Error getting user data:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to get user data" 
      });
    }
  });

  // Endpoint to get current progress data for the dashboard
  app.get("/api/dashboard/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      
      if (isNaN(userId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid user ID" 
        });
      }
      
      // Get the user profile
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ 
          success: false, 
          message: "User profile not found" 
        });
      }
      
      // Generate dashboard data based on user profile
      // This is where we would normally do personalization based on the profile
      const dashboardData = {
        username: (await storage.getUser(userId))?.username || "User",
        progress: 25, // Sample progress percentage
        goals: [
          { id: "1", title: "Complete career assessment", completed: true, progress: 100 },
          { id: "2", title: "Explore recommended careers", completed: false, progress: 30 },
          { id: "3", title: "Research education pathways", completed: false, progress: 0 },
          { id: "4", title: "Set up informational interviews", completed: false, progress: 0 }
        ],
        trendingTopics: generateTrendingTopics(profile.subjects),
        activities: [
          { id: "1", type: "badge", title: "Career Explorer", time: "2 days ago", isRecent: true },
          { id: "2", type: "lesson", title: "Introduction to Career Pathways", time: "5 days ago", isRecent: true },
          { id: "3", type: "course", title: "Career Decision Making", time: "1 week ago", isRecent: false }
        ],
        nextSteps: {
          course: { title: "Skills Assessment Workshop" },
          video: { title: "How to Network Effectively" }
        }
      };
      
      return res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to get dashboard data" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to generate trending topics based on user's subjects
function generateTrendingTopics(subjects: string[]) {
  const baseTopics = [
    { id: "1", name: "Career Planning", primary: true, percentage: 85 },
    { id: "2", name: "Networking", percentage: 72 },
    { id: "3", name: "Resume Building", percentage: 68 },
    { id: "4", name: "Interview Skills", percentage: 65 }
  ];
  
  // Add subject-specific topics if available
  if (subjects && subjects.length > 0) {
    const subjectTopics = subjects.slice(0, 2).map((subject, index) => ({
      id: `${5 + index}`,
      name: `${subject} Careers`,
      percentage: Math.floor(Math.random() * 15) + 55
    }));
    
    return [...baseTopics, ...subjectTopics];
  }
  
  return baseTopics;
}
