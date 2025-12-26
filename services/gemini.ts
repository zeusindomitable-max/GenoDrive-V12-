
import { GoogleGenAI } from "@google/genai";

export const getBioExplanation = async (step: string, details: string): Promise<string> => {
  // Check if API key exists to prevent crashes in local environments
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    console.warn("Gemini API Key not found. AI Assistant is in offline mode.");
    return "System running in localized cold-storage mode. (AI Assistant needs API Key to provide detailed analysis).";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
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
    
    return response.text || "I'm analyzing the molecular structure, just a moment...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The bio-connection is currently unstable, but rest assured, your data is being handled with precision locally.";
  }
};
