import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function suggestGoals(subjects: string[], skills: string, interests: string, count: number = 2): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const subjectsString = subjects.join(", ");
    const prompt = `Suggest 1 specific and actionable career development goal focused on the subjects: ${subjectsString}
Consider these aspects - Current Skills: ${skills}, Interests: ${interests}

Based on the user's thinking style and career goals, suggest varied career development activities like:
- Industry research and analysis
- Skill-building exercises
- Portfolio development
- Professional networking
- Personal branding
- Technical learning
- Career exploration

Requirements for goals:
- Must be achievable in 1-2 hours
- Should be specific and actionable
- Vary between different types of activities
- Focus on career exploration and professional development in the subject field
- Should help understand career paths and opportunities
- Include industry-relevant skills or knowledge
- Be specific and measurable
- Example: "Research 2 companies hiring ${subjectsString.split(',')[0]} professionals and list their requirements"

Format as JSON array of strings. Example:
["Complete 3 linear algebra practice problems", "Write a 1-page summary of photosynthesis process"]

Response must be only the JSON array, no other text.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log("Raw Gemini response for goals:", text);
    
    // First try to parse the entire response as JSON
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 1); // Return first goal
      }
    } catch (e) {
      // If direct parsing fails, try to extract JSON array
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          const goals = JSON.parse(match[0]);
          return Array.isArray(goals) && goals.length > 0 ? [goals[0]] : [];
        } catch (parseError) {
          console.error("Error parsing Gemini response:", parseError);
        }
      }
    }
    
    console.error("Could not generate valid goals from response");
    return [];
  } catch (error) {
    console.error("Error generating goals with Gemini:", error);
    return [];
  }
}

export async function getCourseRecommendation(profile: any) {
  if (!profile) {
    return { success: false, message: "Profile data is required" };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Given this user profile with subjects: ${profile.subjects.join(", ")}, interests: ${profile.interests}, and skills: ${profile.skills}, suggest a specific online course recommendation from any major learning platform (edX, Udemy, LinkedIn Learning, etc.).
    Format the response as a JSON object with properties:
    - title: The course title
    - description: A brief 1-2 sentence description
    - duration: Estimated time to complete (e.g. "2 weeks")
    - level: Difficulty level (Beginner/Intermediate/Advanced)
    - platform: The learning platform name
    - url: A URL to the course

    Example:
    {
      "title": "Introduction to Data Science",
      "description": "Learn fundamental concepts of data analysis and statistics",
      "duration": "4 weeks",
      "level": "Beginner"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Raw Gemini response:", text);
    
    try {
      const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
      const course = JSON.parse(jsonStr);
      
      // Add default Coursera URL if none provided
      // Add specific Coursera URL for better reliability
      if (!course.url) {
        course.url = "https://www.coursera.org/courses";
      }
      
      return { success: true, course };
    } catch (parseError) {
      console.error("Error parsing course recommendation:", parseError);
      return { 
        success: true, 
        course: {
          title: "Data Analysis Fundamentals",
          description: "Learn essential data analysis skills and tools",
          duration: "4 weeks",
          level: "Beginner",
          url: "https://www.coursera.org/learn/data-analytics-foundations"
        }
      };
    }

    try {
      // Clean the response text to ensure it only contains JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      const course = JSON.parse(jsonMatch[0]);
      if (!course.title || !course.description || !course.duration || !course.level) {
        throw new Error("Invalid course data structure");
      }
      return { success: true, course };
    } catch (parseError) {
      console.error("Error parsing course recommendation:", parseError);
      return { success: false, message: "Failed to parse course recommendation" };
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to generate course recommendation"
    };
  }
}

export async function getRecommendations(profile: any) {
  if (!profile) {
    return { success: false, message: "Profile data is required" };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Given this user profile: ${JSON.stringify(profile)}, suggest 3 learning recommendations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const recommendations = text.split('\n').filter(Boolean);

    if (recommendations.length === 0) {
      return { success: false, message: "No recommendations generated" };
    }

    return { success: true, recommendations };
  } catch (error) {
    console.error('Gemini API error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to generate recommendations"
    };
  }
}