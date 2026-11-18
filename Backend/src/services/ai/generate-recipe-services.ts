// src/services/ai/generate-recipe-service.ts
import { GoogleGenAI } from "@google/genai";
import { recipeBody } from "@/schema/recipe-schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateRecipeService(prompt: string, userId: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // confirm this is still current in AI Studio
      contents: `You write recipe drafts as JSON only — no markdown, no commentary.
Return an object with exactly these fields: name, cuisine, mealType (array),
difficulty ("Easy" | "Medium" | "Hard"), cookTimeMinutes (non-negative integer),
tags (array), image (always ""), ingredients (non-empty array),
instructions (non-empty array).

User request: ${prompt}`,
    });

    const parsed = JSON.parse(response.text ?? "");
    const draft = recipeBody.parse(parsed); // same validation as before, reused as-is

    return { code: 200, status: "success", data: { draft } };
  } catch (err) {
    console.error("generateRecipeService failed:", err);
    return { code: 502, status: "error", message: "AI did not return a usable recipe" };
  }
}