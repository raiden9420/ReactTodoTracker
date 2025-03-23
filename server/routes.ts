import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { genAI } from "./gemini";
import {
  surveySchema,
  goalSchema,
  createGoalSchema,
  updateGoalSchema,
} from "@shared/schema";
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
          errors: validatedData.error.flatten(),
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
          ...result.profile,
        },
      });
    } catch (error) {
      console.error("Error submitting survey:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to submit survey",
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
          message: "Invalid user ID",
        });
      }

      // Get the user
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
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
            hasProfile: false,
          },
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
          created_at: profile.created_at,
        },
      });
    } catch (error) {
      console.error("Error getting user data:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get user data",
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
          message: "Invalid user ID",
        });
      }

      // Get the user profile
      const profile = await storage.getUserProfile(userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
        });
      }

      // Get the user's learning goals
      let userGoals = await storage.getGoals(userId);

      // Clear all existing goals if refreshing suggestions
      if (req.url.includes("/goals/suggest/")) {
        // Delete all existing goals
        await Promise.all(userGoals.map((goal) => storage.deleteGoal(goal.id)));

        // Generate only AI suggestions
        const suggestions = await suggestGoals(
          profile.subjects,
          profile.skills,
          profile.interests,
          3, // Increased to 3 suggestions since we're not adding defaults
        );

        if (suggestions && suggestions.length > 0) {
          userGoals = await Promise.all(
            suggestions.map((task) =>
              storage.createGoal({
                task,
                completed: false,
                userId,
              }),
            ),
          );
        }
        return res.status(200).json({
          success: true,
          data: userGoals,
        });
      }

      // If no goals exist, return empty array
      if (userGoals.length === 0) {
        userGoals = [];
      }

      // Transform goals to match the dashboard format
      const formattedGoals = userGoals.map((goal) => ({
        id: goal.id,
        title: goal.task,
        completed: goal.completed,
        progress: goal.completed ? 100 : 0,
      }));

      // Generate dashboard data based on user profile
      const dashboardData = {
        username: (await storage.getUser(userId))?.username || "User",
        avatar: profile.avatar,
        progress: 25, // Sample progress percentage
        goals: formattedGoals,
        trendingTopics: await fetchTrends(profile.subjects[0] || "Career Development"), //Call the new function here
        activities: await storage.getActivities(userId),
        nextSteps: {
          course: { title: "Skills Assessment Workshop" },
          video: { title: "How to Network Effectively" },
        },
      };

      return res.status(200).json({
        success: true,
        data: dashboardData,
      });
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get dashboard data",
      });
    }
  });

  // Course recommendation endpoint
  app.get(
    "/api/course-recommendation/:userId",
    async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.userId, 10);

        if (isNaN(userId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid user ID",
          });
        }

        const profile = await storage.getUserProfile(userId);
        if (!profile) {
          return res.status(404).json({
            success: false,
            message: "User profile not found",
          });
        }

        const result = await getCourseRecommendation(profile);
        return res.status(200).json(result);
      } catch (error) {
        console.error("Error getting course recommendation:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to get course recommendation",
        });
      }
    },
  );

  // Personalized recommendations endpoint
  app.get(
    "/api/personalized-recommendations/:userId",
    async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.userId, 10);

        if (isNaN(userId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid user ID",
          });
        }

        // Get both user and profile
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(200).json({
            success: true,
            data: {
              video: null,
            },
          });
        }

        const profile = await storage.getUserProfile(userId);
        if (!profile || !profile.subjects || !profile.interests) {
          return res.status(200).json({
            success: true,
            data: {
              video: null,
            },
          });
        }

        // Get primary subject and ensure data exists
        const primarySubject = profile.subjects[0] || "career development";
        const interests =
          profile.interests?.split(",")[0]?.trim() ||
          "professional development";

        // Check for YouTube API key
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
        if (!YOUTUBE_API_KEY) {
          return res.status(500).json({
            success: false,
            message: "YouTube API key not configured",
          });
        }

        // Generate search query based on profile
        const searchQuery = encodeURIComponent(
          `${primarySubject} ${interests} career guide 2024`,
        );

        try {
          // Fetch video recommendations from YouTube
          const youtubeResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}&relevanceLanguage=en&videoDuration=medium&order=relevance`,
          );

          if (!youtubeResponse.ok) {
            throw new Error(`YouTube API error: ${youtubeResponse.statusText}`);
          }

          const youtubeData = await youtubeResponse.json();

          if (youtubeData.error) {
            console.error("YouTube API error:", youtubeData.error);
            throw new Error(youtubeData.error.message);
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
                url: `https://youtube.com/watch?v=${video.id.videoId}`,
              },
            },
          });
        } catch (error) {
          console.error("Error getting recommendations:", error);
          // Return a fallback video recommendation
          return res.status(200).json({
            success: true,
            data: {
              video: {
                title: `${primarySubject} Career Guide`,
                description: `Learn about career opportunities in ${primarySubject}`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${primarySubject} career guide`)}`,
              },
            },
          });
        }
          } catch (error) {
        console.error("Error getting video recommendations:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to get video recommendations",
        });
      }
    },
  );

  // Trending topics endpoint
  app.get(
    "/api/career-trends/:subject",
    async (req: Request, res: Response) => {
      try {
        const subject = decodeURIComponent(req.params.subject);

        // Generate trends based on subject
        const trends = await fetchTrends(subject); //Use new function here

        return res.status(200).json({
          success: true,
          data: trends,
        });
      } catch (error) {
        console.error("Error getting trends:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to get trends",
        });
      }
    },
  );

  // Goals API endpoints

  // GET AI-suggested goals (must be before the general /goals/:userId route to avoid conflict)
  app.get("/api/goals/suggest/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // Get the user profile to create personalized suggestions
      const profile = await storage.getUserProfile(userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
        });
      }

      // Generate new goal suggestion using Gemini AI
      const suggestions = await suggestGoals(
        profile.subjects,
        profile.skills,
        profile.interests,
        1, // Number of suggestions to generate
      );

      // If suggestions could not be generated, return a helpful message
      if (!suggestions || suggestions.length === 0) {
        return res.status(500).json({
          success: false,
          message: "Could not generate goal suggestions at this time",
        });
      }

      // Create only the AI-generated goals in the database
      const createdGoals = await Promise.all(
        suggestions.map((task) =>
          storage.createGoal({
            task,
            completed: false,
            userId,
          }),
        ),
      );

      return res.status(200).json({
        success: true,
        message: "Goal suggestions generated successfully",
        data: createdGoals,
      });
    } catch (error) {
      console.error("Error generating goal suggestions:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to generate goal suggestions",
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
          message: "Invalid user ID",
        });
      }

      const goals = await storage.getGoals(userId);

      return res.status(200).json({
        success: true,
        data: goals,
      });
    } catch (error) {
      console.error("Error getting goals:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get goals",
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
          errors: validatedData.error.flatten(),
        });
      }

      // Create the goal with default progress
      const goalData = {
        ...validatedData.data,
        progress: 0
      };

      // Create the goal
      const newGoal = await storage.createGoal(goalData);

      if (!newGoal) {
        throw new Error("Failed to create goal");
      }

      return res.status(201).json({
        success: true,
        message: "Goal created successfully",
        data: {
          id: newGoal.id,
          title: newGoal.task,
          completed: newGoal.completed,
          progress: 0
        },
      });
    } catch (error) {
      console.error("Error creating goal:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create goal",
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
          errors: validatedData.error.flatten(),
        });
      }

      // Update the goal
      const updatedGoal = await storage.updateGoal(goalId, validatedData.data);

      if (!updatedGoal) {
        return res.status(404).json({
          success: false,
          message: "Goal not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Goal updated successfully",
        data: updatedGoal,
      });
    } catch (error) {
      console.error("Error updating goal:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update goal",
      });
    }
  });

  // DELETE a goal
  // POST create a new activity
  app.post("/api/activities", async (req: Request, res: Response) => {
    try {
      const { userId, type, title } = req.body;

      if (!userId || !type || !title) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields"
        });
      }

      await storage.createActivity({ userId, type, title });

      return res.status(201).json({
        success: true,
        message: "Activity recorded successfully"
      });
    } catch (error) {
      console.error("Error creating activity:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to record activity"
      });
    }
  });

  // Career coach endpoint
  app.post("/api/career-coach", async (req: Request, res: Response) => {
    try {
      const { message, userData } = req.body;
      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required"
        });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Create a context-aware prompt using user data
      const contextPrompt = `As a career coach, consider this user's profile:
Subjects: ${userData?.subjects?.join(', ') || 'Not specified'}
Interests: ${userData?.interests?.join(', ') || 'Not specified'}
Skills: ${userData?.skills?.join(', ') || 'Not specified'}
Career Goal: ${userData?.goal || 'Not specified'}
Thinking Style: ${userData?.thinkingStyle || 'Not specified'}

Based on this profile, respond to their question: ${message}

Provide personalized, actionable advice that aligns with their interests and goals. Keep the response concise and practical.`;

      const result = await model.generateContent(contextPrompt);
      const response = await result.response;

      return res.status(200).json({
        success: true,
        response: response.text()
      });
    } catch (error) {
      console.error('Career coach error:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to process request"
      });
    }
  });

  app.delete("/api/goals/:id", async (req: Request, res: Response) => {
    try {
      const goalId = req.params.id;

      // Delete the goal
      const success = await storage.deleteGoal(goalId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Goal not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Goal deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting goal:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete goal",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to validate requests
async function validateRequest(req: any, res: any, next: any) {
  try {
    await next();
  } catch (error) {
    console.error("Request validation error:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}

async function fetchTrends(subject: string) {
  const trends = [
    {
      id: "trend1",
      title: `Top Skills in ${subject} for 2024`,
      description: `Key skills and technologies that are shaping the ${subject} field this year. Learn what employers are looking for and how to stay competitive.`,
      url: "https://www.bls.gov/ooh/",
      type: "article",
    },
    {
      id: "trend2",
      title: `${subject} Industry Outlook`,
      description: `Latest market trends and future projections for careers in ${subject}.`,
      url: `https://www.onetonline.org/find/quick?s=${encodeURIComponent(subject)}`,
      type: "article",
    }
  ];

  // Temporarily disabled X API integration
  /*
  if (!process.env.X_API_KEY) {
    console.warn('X_API_KEY not configured');
    return trends;
  }

  try {
    const query = encodeURIComponent(`${subject} career OR ${subject} trends OR ${subject} jobs -is:retweet -is:reply lang:en`);
    const response = await fetch(`https://api.twitter.com/2/tweets/search/recent?query=${query}&tweet.fields=public_metrics,created_at,author_id&max_results=10`, {
      headers: {
        'Authorization': `Bearer ${process.env.X_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('X API Error:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorText
      });
      if (response.status === 429) {
        console.log('X API rate limited, using default trends');
      }
      return trends;
    }

    const data = await response.json();
    console.log('X API Response:', JSON.stringify(data, null, 2));

    if (!data.data || !Array.isArray(data.data)) {
      console.warn('Invalid response format from X API');
      return trends;
    }

    // Filter and sort tweets by engagement, get only the top one
    const relevantTweets = data.data
      .filter(tweet => 
        tweet.text.toLowerCase().includes(subject.toLowerCase()) &&
        tweet.public_metrics &&
        (tweet.public_metrics.like_count > 0 || tweet.public_metrics.retweet_count > 0)
      )
      .sort((a, b) => {
        const aEngagement = (a.public_metrics?.like_count || 0) + (a.public_metrics?.retweet_count || 0);
        const bEngagement = (b.public_metrics?.like_count || 0) + (b.public_metrics?.retweet_count || 0);
        return bEngagement - aEngagement;
      })
      .slice(0, 1);

    const xPosts = relevantTweets.map((tweet, index) => ({
      id: `x-${index}`,
      title: `Trending in ${subject}`,
      description: tweet.text.length > 150 ? tweet.text.substring(0, 147) + '...' : tweet.text,
      url: `https://twitter.com/i/web/status/${tweet.id}`,
      type: 'post',
      metrics: {
        like_count: tweet.public_metrics.like_count,
        retweet_count: tweet.public_metrics.retweet_count
      }
    }));

    return [...trends, ...xPosts];
  } catch (error) {
    console.error('Error fetching X posts:', error);
    return trends;
  }
  */
  return trends;
}

function generateTrendingTopics(subjects: string[]) {
  const primarySubject = subjects[0] || "Career Development";
  const currentYear = new Date().getFullYear();
  return [
    {
      id: "trend1",
      title: `${currentYear} ${primarySubject} Industry Report`,
      description: `Latest industry developments and in-demand skills for ${primarySubject}.`,
      url: `https://www.bls.gov/ooh/occupation-finder.htm?pay=&education=&training=&newjobs=&growth=&submit=GO`,
      type: "article",
    },
    {
      id: "trend2",
      title: `Emerging ${primarySubject} Career Paths`,
      description: `Hot jobs and career opportunities in ${primarySubject}.`,
      url: `https://www.onetonline.org/find/quick?s=${encodeURIComponent(primarySubject)}`,
      type: "post",
    },
  ];
}