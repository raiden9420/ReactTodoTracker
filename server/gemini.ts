import { GoogleGenerativeAI } from "@google/generative-ai";

// Access API key from environment variables (Replit Secrets)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

export async function suggestGoals(subjects: string[], skills: string, interests: string, count: number = 2): Promise<string[]> {
  try {
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Format subjects as a comma-separated string
    const subjectsString = subjects.join(", ");
    
    // Create the prompt
    const prompt = `Suggest ${count} specific and actionable career development goals focused on the subjects: ${subjectsString}
Consider these aspects - Current Skills: ${skills}, Interests: ${interests}, Career Goals: ${profile.careerGoals || 'Not specified'}, Thinking Style: ${profile.thinkingStyle || 'Not specified'}, Additional Info: ${profile.additionalInfo || 'Not specified'}

Based on the user's thinking style and career goals, adjust the difficulty and complexity of tasks accordingly.

Requirements for goals:
- Must be achievable in 1-2 hours
- Focus on career exploration and professional development in the subject field
- Should help understand career paths and opportunities
- Include industry-relevant skills or knowledge
- Be specific and measurable
- Example: "Research 2 companies hiring ${subjectsString.split(',')[0]} professionals and list their requirements"

Format as JSON array of strings. Example:
["Complete 3 linear algebra practice problems", "Write a 1-page summary of photosynthesis process"]

Response must be only the JSON array, no other text.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the JSON array from the response
    // Look for anything that resembles a JSON array in the response
    const match = text.match(/\[[\s\S]*\]/);
    
    if (match) {
      try {
        const goals = JSON.parse(match[0]);
        return Array.isArray(goals) ? goals : [];
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError);
        return [];
      }
    }
    
    return [];
  } catch (error) {
    console.error("Error generating goals with Gemini:", error);
    return [];
  }
}