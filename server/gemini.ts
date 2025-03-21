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
    const prompt = `Suggest ${count} specific and actionable micro-goals for a student with:
- Subjects: ${subjectsString}
- Skills: ${skills}
- Interests: ${interests}

The goals should be concrete, achievable learning tasks that help build career-relevant skills.
Format your response as a simple JSON array of strings, each containing one goal. 
For example: ["Learn basic Python syntax", "Practice data visualization with matplotlib"]
Don't include any explanations, just the JSON array.`;

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