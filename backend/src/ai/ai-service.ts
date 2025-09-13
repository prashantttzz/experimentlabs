import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

const generateDefaultChunks = () => {
  console.log("AI generation failed. Using default fallback journey.");
  return [
    {
      title: "Week 1-2: The Basics",
      description: "Understand the fundamental concepts and get set up.",
      week: "Week 1-2",
      duration: "2 weeks",
      difficulty: "Beginner",
      objectives: ["Complete initial setup", "Learn core terminology"],
      skills: ["Setup", "Fundamentals"],
    },
    {
      title: "Week 3-4: Core Practice",
      description: "Dive into the main topics and practice with exercises.",
      week: "Week 3-4",
      duration: "2 weeks",
      difficulty: "Intermediate",
      objectives: ["Complete 3 core exercises", "Build a small project"],
      skills: ["Core Skills", "Project Building"],
    },
    {
      title: "Week 5-6: Advanced Topics",
      description: "Explore advanced concepts and finalize your understanding.",
      week: "Week 5-6",
      duration: "2 weeks",
      difficulty: "Advanced",
      objectives: [
        "Tackle an advanced tutorial",
        "Refactor the project with new knowledge",
      ],
      skills: ["Advanced Concepts", "Refactoring"],
    },
  ];
};

export const generateAiJourneyChunks = async (
  title: string,
  timeline:string,
  description: string
) => {
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY environment variable not found.");
    return generateDefaultChunks();
  }
  const systemPrompt = `
        You are an expert curriculum and learning path designer.
        Your task is to take a user's goal and break it down into a detailed, structured learning journey spanning multiple weeks.
        You MUST return the response as a valid JSON array of objects.
        Each object in the array represents a learning module or "chunk" of the journey.

        Each JSON object MUST have the following exact structure:
        {
          "title": "A concise, engaging title for the module.",
          "week": "The time frame, e.g., 'Week 1-2'.",
          "order":"an integer, starting from 1 e.g., "1" ,"2",
        "description": "A one-sentence summary of what the user will learn.",
          "duration": "The estimated duration, e.g., '2 weeks'.",
          "difficulty": "A difficulty rating, e.g., 'Beginner', 'Intermediate', 'Advanced'.",
          "objectives": [
            "A string array of 3-4 specific, actionable learning objectives."
          ],
          "skills": [
            "A string array of 3-4 key skills the user will acquire."
          ]
        }

        Generate a complete journey with a logical progression of modules. The total number of modules should be between 4 and 8. Do not include any text or markdown formatting before or after the JSON array.
    `;

  const userPrompt = `
        Here is the user's goal:
        Title: "${title}"
        Description: "${description}"
        timeline:~${timeline}
        Now, generate the JSON array of learning modules for this goal.
    `;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        "Gemini API request failed with status:",
        response.status,
        "Body:",
        errorBody
      );
      return generateDefaultChunks();
    }

    const data = await response.json();
    const jsonString = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!jsonString) {
      console.error(
        "Invalid response structure from Gemini API.",
        JSON.stringify(data, null, 2)
      );
      return generateDefaultChunks();
    }

    // The response from Gemini is an array, which is exactly what we need.
    const parsedJson = JSON.parse(jsonString);
    if (!Array.isArray(parsedJson)) {
      console.error("Parsed JSON is not an array.");
      return generateDefaultChunks();
    }

    return parsedJson;
  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    return generateDefaultChunks();
  }
};
