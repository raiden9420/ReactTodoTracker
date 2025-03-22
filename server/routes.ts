import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { surveySchema, goalSchema, createGoalSchema, updateGoalSchema } from "@shared/schema";
import { z } from "zod";
import { suggestGoals, getCourseRecommendation } from "./gemini";

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

      // Return success response with user profile
      return res.status(200).json({ 
        success: true, 
        message: "Survey submitted successfully",
        userId: result.userId,
        user: {
          id: result.userId,
          hasProfile: true,
          ...result.profile
        }
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

      // Get the user's learning goals
      let userGoals = await storage.getGoals(userId);

      // Clear all existing goals if refreshing suggestions
      if (req.url.includes('/goals/suggest/')) {
        // Delete all existing goals
        await Promise.all(userGoals.map(goal => storage.deleteGoal(goal.id)));

        // Generate only AI suggestions
        const suggestions = await suggestGoals(
          profile.subjects,
          profile.skills,
          profile.interests,
          3 // Increased to 3 suggestions since we're not adding defaults
        );

        if (suggestions && suggestions.length > 0) {
          userGoals = await Promise.all(
            suggestions.map(task => 
              storage.createGoal({
                task,
                completed: false,
                userId
              })
            )
          );
        }
        return res.status(200).json({
          success: true,
          data: userGoals
        });
      }

      // If no goals exist, return empty array
      if (userGoals.length === 0) {
        userGoals = [];
      }

      // Transform goals to match the dashboard format
      const formattedGoals = userGoals.map(goal => ({
        id: goal.id,
        title: goal.task,
        completed: goal.completed,
        progress: goal.completed ? 100 : 0
      }));

      // Generate dashboard data based on user profile
      const dashboardData = {
        username: (await storage.getUser(userId))?.username || "User",
        avatar: profile.avatar,
        progress: 25, // Sample progress percentage
        goals: formattedGoals,
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

  // Course recommendation endpoint
  app.get("/api/course-recommendation/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);

      if (isNaN(userId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid user ID" 
        });
      }

      const profile = await storage.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ 
          success: false, 
          message: "User profile not found" 
        });
      }

      const result = await getCourseRecommendation(profile);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error getting course recommendation:", error);
      return res.status(500).json({ 
        success: false, 
        message: "Failed to get course recommendation" 
      });
    }
  });

  // Personalized recommendations endpoint
  app.get("/api/personalized-recommendations/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);

      if (isNaN(userId)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid user ID" 
        });
      }
      
      // Get both user and profile
      const user = await storage.getUser(userId);
        if (!user) {
          return res.status(200).json({
            success: true,
            data: {
              video: null
            }
          });
        }

        const profile = await storage.getUserProfile(userId);
        if (!profile || !profile.subjects || !profile.interests) {
          return res.status(200).json({
            success: true,
            data: {
              video: null
            }
          });
        }

        // Get primary subject and ensure data exists
        const primarySubject = profile.subjects[0] || "career development";
        const interests = profile.interests?.split(',')[0]?.trim() || "professional development";

        // Check for YouTube API key
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
        if (!YOUTUBE_API_KEY) {
          return res.status(500).json({
            success: false,
            message: "YouTube API key not configured"
          });
        }

        // Generate search query based on profile
        const searchQuery = encodeURIComponent(`${primarySubject} ${interests} career guide 2024`);

        try {
          // Fetch video recommendations from YouTube
          const youtubeResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}&relevanceLanguage=en&videoDuration=medium&order=relevance`
          );

          const youtubeData = await youtubeResponse.json();

          if (youtubeData.error) {
            throw new Error(youtubeData.error.message || "YouTube API error");
          }

          const video = youtubeData.items?.[0];
          if (!video) {
            throw new Error("No video recommendations found");
          }

          return res.status(200).json({
            success: true,
            data: {
              video: {
                title: video.snippet.title,
                description: video.snippet.description,
                url: `https://youtube.com/watch?v=${video.id.videoId}`
              }
            }
          });
        } catch (error) {
          console.error("Error getting recommendations:", error);
          const errorMessage = error instanceof Error ? error.message : "Failed to get recommendations";
          return res.status(500).json({ 
            success: false, 
            message: errorMessage
          });
        }
      } catch (error) {
        console.error("Error getting video recommendations:", error);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to get video recommendations" 
        });
      }
    }
  );

    // Goals API endpoints

    // GET AI-suggested goals (must be before the general /goals/:userId route to avoid conflict)
    app.get("/api/goals/suggest/:userId", async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.userId, 10);

        if (isNaN(userId)) {
          return res.status(400).json({ 
            success: false, 
            message: "Invalid user ID" 
          });
        }

        // Get the user profile to create personalized suggestions
        const profile = await storage.getUserProfile(userId);

        if (!profile) {
          return res.status(404).json({ 
            success: false, 
            message: "User profile not found" 
          });
        }

        // Generate new goal suggestion using Gemini AI
        const suggestions = await suggestGoals(
          profile.subjects,
          profile.skills,
          profile.interests,
          1 // Number of suggestions to generate
        );

        // If suggestions could not be generated, return a helpful message
        if (!suggestions || suggestions.length === 0) {
          return res.status(500).json({
            success: false,
            message: "Could not generate goal suggestions at this time"
          });
        }

        // Create only the AI-generated goals in the database
        const createdGoals = await Promise.all(
          suggestions.map(task => 
            storage.createGoal({
              task,
              completed: false,
              userId
            })
          )
        );

        return res.status(200).json({
          success: true,
          message: "Goal suggestions generated successfully",
          data: createdGoals
        });
      } catch (error) {
        console.error("Error generating goal suggestions:", error);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to generate goal suggestions" 
        });
      }
    });

    // GET all goals for a user
    app.get("/api/goals/:userId", async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.userId, 10);

        if (isNaN(userId)) {
          return res.status(400).json({ 
            success: false, 
            message: "Invalid user ID" 
          });
        }

        const goals = await storage.getGoals(userId);

        return res.status(200).json({
          success: true,
          data: goals
        });
      } catch (error) {
        console.error("Error getting goals:", error);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to get goals" 
        });
      }
    });

    // POST create a new goal
    app.post("/api/goals", async (req: Request, res: Response) => {
      try {
        // Validate request body
        const validatedData = createGoalSchema.safeParse(req.body);

        if (!validatedData.success) {
          return res.status(400).json({ 
            success: false, 
            message: "Invalid goal data", 
            errors: validatedData.error.flatten() 
          });
        }

        // Create the goal
        const newGoal = await storage.createGoal(validatedData.data);

        return res.status(201).json({
          success: true,
          message: "Goal created successfully",
          data: newGoal
        });
      } catch (error) {
        console.error("Error creating goal:", error);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to create goal" 
        });
      }
    });

    // PUT update a goal
    app.put("/api/goals/:id", async (req: Request, res: Response) => {
      try {
        const goalId = req.params.id;

        // Validate request body
        const validatedData = updateGoalSchema.safeParse(req.body);

        if (!validatedData.success) {
          return res.status(400).json({ 
            success: false, 
            message: "Invalid goal update data", 
            errors: validatedData.error.flatten() 
          });
        }

        // Update the goal
        const updatedGoal = await storage.updateGoal(goalId, validatedData.data);

        if (!updatedGoal) {
          return res.status(404).json({ 
            success: false, 
            message: "Goal not found" 
          });
        }

        return res.status(200).json({
          success: true,
          message: "Goal updated successfully",
          data: updatedGoal
        });
      } catch (error) {
        console.error("Error updating goal:", error);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to update goal" 
        });
      }
    });

    // DELETE a goal
    app.delete("/api/goals/:id", async (req: Request, res: Response) => {
      try {
        const goalId = req.params.id;

        // Delete the goal
        const success = await storage.deleteGoal(goalId);

        if (!success) {
          return res.status(404).json({ 
            success: false, 
            message: "Goal not found" 
          });
        }

        return res.status(200).json({
          success: true,
          message: "Goal deleted successfully"
        });
      } catch (error) {
        console.error("Error deleting goal:", error);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to delete goal" 
        });
      }
    });

    const httpServer = createServer(app);
    return httpServer;
  }

  // Helper function to generate trending topics based on user's subjects
  async function validateRequest(req: any, res: any, next: any) {
    try {
      await next();
    } catch (error) {
      console.error('Request validation error:', error);
      res.status(500).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
    }
  }

  async function fetchCareerTrends(subject: string) {
    // This would typically use real API calls to news sources and Twitter
    // For demo, returning structured mock data
    return {
      articles: [
        {
          id: "1",
          title: `Latest Trends in ${subject}`,
          description: `Emerging career opportunities and growth areas in ${subject} field for 2024`,
          url: `https://www.bls.gov/ooh/life-physical-and-social-science/${subject.toLowerCase()}.htm`,
          type: "article"
        }
      ],
      posts: [
        {
          id: "2",
          title: `#${subject}Careers Trending`,
          description: `Industry professionals discussing latest ${subject} career opportunities and market demands`,
          url: `https://twitter.com/search?q=${encodeURIComponent(`${subject} careers`)}`,
          type: "post"
        }
      ]
    };
  }

  function generateTrendingTopics(subjects: string[]) {
    // This will be replaced by real data from fetchCareerTrends
    return [];
  }