import { GoogleGenAI } from "@google/genai";

export let ai: GoogleGenAI | null = null;

try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else {
    console.warn("WARNING: GEMINI_API_KEY is not set. Gemini API requests will fail.");
  }
} catch (err) {
  console.error("Failed to initialize GoogleGenAI client:", err);
}

/**
 * Robust retry wrapper for Gemini Content Generation.
 * Iterates over fallback candidate models (3.5-flash, 3.1-flash-lite, 2.5-flash-lite),
 * handles 503 (service unavailable) and 429 (rate limits) with exponential backoff,
 * and recovers gracefully.
 */
export async function generateContentWithRetry(
  contents: any,
  config: any,
  model: string = "gemini-3.5-flash"
): Promise<any> {
  const maxRetries = 3;
  
  // Ordered candidate fallback models. If the first fails, it falls back to the next.
  const candidateModels = Array.from(new Set([
    model,
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite"
  ]));


  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing from environment variables.");
  }

  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  // Estimate token size and characters
  let rawText = "";
  if (typeof contents === "string") {
    rawText = contents;
  } else if (Array.isArray(contents)) {
    rawText = contents.map((c: any) => {
      if (c && c.parts && Array.isArray(c.parts)) {
        return c.parts.map((p: any) => p?.text || "").join(" ");
      }
      return String(c);
    }).join(" ");
  }

  if (rawText.length > 24000) {
    rawText = rawText.substring(0, 24000) + "\n... [Truncated to prevent token limit overflow]";
  }

  const promptSize = rawText.length;
  const tokenEstimate = Math.round(promptSize / 4);

  console.log(`[Assistant] [Gemini] [Prompt Size] Prompt characters: ${promptSize}`);
  console.log(`[Assistant] [Gemini] [Token Estimate] Estimated tokens: ${tokenEstimate}`);

  for (const targetModel of candidateModels) {
    let delay = 1000;
    console.log(`[Assistant] [Gemini] Trying candidate model: "${targetModel}"`);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const startTime = Date.now();
      try {
        console.log(`[Assistant] [Gemini] Executing call to model="${targetModel}" (Attempt ${attempt + 1}/${maxRetries + 1})`);
        
        const response = await ai.models.generateContent({
          model: targetModel,
          contents,
          config,
        });

        const latency = Date.now() - startTime;
        console.log(`[Assistant] [Gemini] Latency: ${latency}ms`);

        if (!response) {
          throw new Error("Received empty response object from Gemini API.");
        }

        let responseText = "";
        const resAny = response as any;
        if (typeof resAny.text === "string" && resAny.text.trim()) {
          responseText = resAny.text.trim();
        } else if (
          resAny.candidates &&
          resAny.candidates[0]?.content?.parts &&
          resAny.candidates[0].content.parts[0]?.text
        ) {
          responseText = resAny.candidates[0].content.parts[0].text.trim();
        } else if (resAny.parts && Array.isArray(resAny.parts)) {
          responseText = resAny.parts.map((p: any) => p?.text || "").join("").trim();
        } else if (resAny.content && Array.isArray(resAny.content.parts)) {
          responseText = resAny.content.parts.map((p: any) => p?.text || "").join("").trim();
        }

        if (!responseText) {
          throw new Error("Extraction Error: Text content was not found in Gemini response.");
        }

        return {
          ...response,
          text: responseText,
        };
      } catch (error: any) {
        const latency = Date.now() - startTime;
        const errorMessage = error?.message || String(error);
        
        console.error(`[Assistant] [Gemini] [Retry] Model="${targetModel}" Attempt ${attempt + 1} failed after ${latency}ms. Exact Error: "${errorMessage}"`);

        const isRetryable =
          errorMessage.includes("fetch failed") ||
          errorMessage.includes("timeout") ||
          errorMessage.includes("429") ||
          errorMessage.includes("500") ||
          errorMessage.includes("503") ||
          errorMessage.includes("UNAVAILABLE") ||
          errorMessage.includes("high demand") ||
          errorMessage.includes("network error") ||
          error?.status === 429 ||
          error?.status === 500 ||
          error?.status === 503;

        // If it's a 404 (model not found/not available), skip to the next candidate model immediately
        if (error?.status === 404 || errorMessage.includes("not found") || errorMessage.includes("no longer available")) {
          console.warn(`[Assistant] [Gemini] Model "${targetModel}" is not available (404). Switching to next candidate model.`);
          break;
        }

        if (isRetryable && attempt < maxRetries) {
          console.warn(`[Assistant] [Gemini] [Retry] Retrying model "${targetModel}" in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          console.error(`[Assistant] [Gemini] Model "${targetModel}" failed permanently on this attempt. Trying next model.`);
          break;
        }
      }
    }
  }

  throw new Error("All candidate Gemini models failed to generate content.");
}
