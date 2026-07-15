import { generateContentWithRetry } from "./gemini";
import { SENTIMENT_SYSTEM_PROMPT, SENTIMENT_SCHEMA } from "./prompts";

export interface SentimentAnalysisResult {
  sentiment: "POS" | "NEU" | "NEG";
  score: number;
}

export async function analyzeSentiment(content: string): Promise<SentimentAnalysisResult> {
  if (!content || !content.trim()) {
    throw new Error("Feedback content is empty.");
  }

  // Call the official Google Gemini API using the latest SDK retry wrapper
  const response = await generateContentWithRetry(
    content,
    {
      systemInstruction: SENTIMENT_SYSTEM_PROMPT,
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: SENTIMENT_SCHEMA,
    },
    "gemini-3.5-flash"
  );

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini API.");
  }

  const parsed = JSON.parse(text);

  // Validate the response shape
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !["POS", "NEU", "NEG"].includes(parsed.sentiment) ||
    typeof parsed.score !== "number"
  ) {
    throw new Error(`Invalid response schema returned from Gemini: ${text}`);
  }

  // Ensure score is bounded between 0.00 and 1.00
  const score = Math.max(0.0, Math.min(1.0, parsed.score));

  return {
    sentiment: parsed.sentiment as "POS" | "NEU" | "NEG",
    score,
  };
}
