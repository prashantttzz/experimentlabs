import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();
const cleanJsonString = (responseText) => {
    const match = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        return match[1].trim();
    }
    return responseText.trim();
};
export const evaluateAssessment = async (chatHistory, chunkContext) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in the environment.");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const evaluationPrompt = `
    You are a strict but fair examiner. A student has completed a learning module, and you must assess if they have understood the core concepts based on their conversation with an AI tutor.

    --- MODULE CONTEXT ---
    Description: "${chunkContext.description}"
    Learning Objectives: ${JSON.stringify(chunkContext.objectives)}
    Skills to Master: ${JSON.stringify(chunkContext.skills)}
    --------------------

    --- CONVERSATION HISTORY ---
    ${JSON.stringify(chatHistory)}
    --------------------------

    --- YOUR TASK ---
    Evaluate the user's messages in the conversation history against the provided module context.
    - Did they ask relevant questions?
    - Do their answers demonstrate a grasp of the learning objectives and skills?
    - Is their understanding sufficient to move to the next module?

    Respond with ONLY a JSON object in the following format:
    - If understanding is sufficient, respond with: {"assessment": "passed", "feedback": "Excellent work. The user clearly understands the key concepts and is ready to proceed."}
    - If understanding is weak, respond with: {"assessment": "failed", "feedback": "The user should review the material. Their understanding of [mention specific objective or skill] seems weak."}
  `;
    try {
        const result = await model.generateContent(evaluationPrompt);
        const rawResponseText = result.response.text();
        // --- FIX: Clean the response before parsing ---
        const cleanResponse = cleanJsonString(rawResponseText);
        const evaluation = JSON.parse(cleanResponse);
        return evaluation;
    }
    catch (error) {
        console.error("Error during AI evaluation:", error);
        return {
            assessment: "failed",
            feedback: "An error occurred during the evaluation. Please try again."
        };
    }
};
