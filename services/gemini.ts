
import { GoogleGenAI } from "@google/genai";

// Always use the named parameter for apiKey and rely exclusively on process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBioExplanation = async (step: string, details: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are the 'Bio-Data Assistant' for GenoDrive V12, a cutting-edge DNA storage system.
        Explain the current step: '${step}' to a non-technical user.
        Technical details for context: ${details}.
        
        Rules:
        1. Use friendly, futuristic lab assistant tone.
        2. Use analogies like a Ferrari (high performance) or biological genetics.
        3. Keep it brief (max 3 sentences).
        4. Be encouraging and "waaah" inducing.
      `,
    });
    // Correctly accessing text property from GenerateContentResponse.
    return response.text || "I'm analyzing the molecular structure, just a moment...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The bio-connection is currently unstable, but rest assured, your data is being handled with precision.";
  }
};
