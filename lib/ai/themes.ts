import { generateContentWithRetry } from "./gemini";
import { THEME_SYSTEM_PROMPT, THEME_SCHEMA } from "./prompts";

export interface ThemeClusteringResult {
  theme: string;
  confidence: number;
}

export interface LocalAIResult {
  sentiment: "POS" | "NEU" | "NEG";
  sentimentScore: number;
  theme: string;
  confidence: number;
}

/**
 * Standardizes theme names based on the required canonical mappings.
 */
export function normalizeThemeName(name: string): string {
  const clean = name.trim().toLowerCase();
  
  // Checkout & Payment normalization
  if (
    clean === "payment" ||
    clean === "checkout" ||
    clean === "billing" ||
    clean === "transaction" ||
    clean.includes("payment gateway") ||
    clean.includes("transaction failed") ||
    clean.includes("payment failure") ||
    clean.includes("payment failed") ||
    clean.includes("payment error") ||
    clean.includes("billing failure") ||
    clean.includes("billing issue") ||
    clean.includes("checkout issue") ||
    clean.includes("checkout error") ||
    clean.includes("checkout problem") ||
    clean.includes("checkout failure")
  ) {
    return "Payment Issues";
  }
  
  // Bug & Crash normalization
  if (
    clean === "bug" ||
    clean === "crash" ||
    clean.includes("app error") ||
    clean.includes("exception") ||
    clean.includes("500 error") ||
    clean.includes("bug report") ||
    clean.includes("system bug") ||
    clean.includes("crash report") ||
    clean.includes("bug reports")
  ) {
    return "Bug Reports";
  }
  
  // UI & Design normalization
  if (
    clean === "ui" ||
    clean === "ux" ||
    clean === "design" ||
    clean === "layout" ||
    clean.includes("ui & design") ||
    clean.includes("ui/ux") ||
    clean.includes("user interface")
  ) {
    return "UI & Design";
  }
  
  // Performance & Latency normalization
  if (
    clean === "performance" ||
    clean === "slow" ||
    clean === "lag" ||
    clean.includes("latency") ||
    clean.includes("performance issue") ||
    clean.includes("slow loader")
  ) {
    return "Performance";
  }

  // Authentication & Login normalization
  if (
    clean === "authentication" ||
    clean === "login" ||
    clean === "otp" ||
    clean === "password" ||
    clean === "signin" ||
    clean.includes("auth")
  ) {
    return "Authentication";
  }

  // Capitalize first letter of each word
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Calculates string similarity using the Sørensen-Dice coefficient (2-gram intersection).
 */
export function getSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, "");
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const bigrams1 = new Map<string, number>();
  for (let i = 0; i < s1.length - 1; i++) {
    const bigram = s1.substring(i, i + 2);
    bigrams1.set(bigram, (bigrams1.get(bigram) || 0) + 1);
  }

  let intersection = 0;
  for (let i = 0; i < s2.length - 1; i++) {
    const bigram = s2.substring(i, i + 2);
    const count = bigrams1.get(bigram) || 0;
    if (count > 0) {
      intersection++;
      bigrams1.set(bigram, count - 1);
    }
  }

  return (2.0 * intersection) / (s1.length + s2.length - 2);
}

/**
 * Fallback local keyword classifier for sentiment and theme.
 * Always returns a valid result, never fails.
 */
export function classifyLocalKeywords(content: string): LocalAIResult {
  const clean = content.toLowerCase();
  
  // Theme identification
  let theme = "Other";
  if (
    clean.includes("payment") ||
    clean.includes("checkout") ||
    clean.includes("invoice") ||
    clean.includes("refund") ||
    clean.includes("billing") ||
    clean.includes("transaction") ||
    clean.includes("stripe") ||
    clean.includes("gateway")
  ) {
    theme = "Payment Issues";
  } else if (
    clean.includes("bug") ||
    clean.includes("crash") ||
    clean.includes("500") ||
    clean.includes("error") ||
    clean.includes("exception") ||
    clean.includes("fail") ||
    clean.includes("broken")
  ) {
    theme = "Bug Reports";
  } else if (
    clean.includes("login") ||
    clean.includes("otp") ||
    clean.includes("signin") ||
    clean.includes("password") ||
    clean.includes("auth") ||
    clean.includes("authentication")
  ) {
    theme = "Authentication";
  } else if (
    clean.includes("slow") ||
    clean.includes("lag") ||
    clean.includes("loading") ||
    clean.includes("performance") ||
    clean.includes("latency") ||
    clean.includes("speed")
  ) {
    theme = "Performance";
  } else if (
    clean.includes("ui") ||
    clean.includes("design") ||
    clean.includes("layout") ||
    clean.includes("ux") ||
    clean.includes("color") ||
    clean.includes("style")
  ) {
    theme = "UI & Design";
  }
  
  // Sentiment identification
  let sentiment: "POS" | "NEU" | "NEG" = "NEU";
  let sentimentScore = 0.5;
  
  const positiveKeywords = ["great", "love", "amazing", "good", "fast", "awesome", "beautiful", "satisfied", "helpful", "perfect", "resolved", "recommend"];
  const negativeKeywords = ["lag", "slow", "fail", "timeout", "bug", "error", "worst", "unhappy", "broken", "missing", "crash", "stuck", "terrible", "bad"];
  
  const hasPos = positiveKeywords.some((kw) => clean.includes(kw));
  const hasNeg = negativeKeywords.some((kw) => clean.includes(kw));
  
  if (hasPos && !hasNeg) {
    sentiment = "POS";
    sentimentScore = 0.85;
  } else if (hasNeg && !hasPos) {
    sentiment = "NEG";
    sentimentScore = 0.15;
  }
  
  return {
    sentiment,
    sentimentScore,
    theme,
    confidence: 0.7,
  };
}

export async function clusterTheme(content: string, existingThemes: string[] = []): Promise<ThemeClusteringResult> {
  if (!content || !content.trim()) {
    throw new Error("Feedback content is empty.");
  }

  const existingThemesText = existingThemes.length > 0
    ? `Existing themes in this workspace to choose from if applicable:\n${existingThemes.map((t) => `- ${t}`).join("\n")}`
    : "No existing themes in this workspace yet.";

  const prompt = `${existingThemesText}\n\nFeedback Content to analyze:\n"${content}"`;

  console.log(`[ThemeClustering] Calling Gemini for content: "${content.substring(0, 60)}..."`);
  console.log(`[ThemeClustering] Existing themes passed: [${existingThemes.join(", ")}]`);

  let response;
  try {
    response = await generateContentWithRetry(
      prompt,
      {
        systemInstruction: THEME_SYSTEM_PROMPT,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: THEME_SCHEMA,
      },
      "gemini-3.5-flash"
    );
  } catch (apiError: any) {
    console.error(`[ThemeClustering] Gemini API call FAILED:`, apiError?.message ?? apiError);
    throw apiError;
  }

  const text = response.text;
  console.log(`[ThemeClustering] Gemini raw response: ${text}`);

  if (!text) {
    throw new Error("Empty response from Gemini API.");
  }

  const parsed = JSON.parse(text);

  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof parsed.theme !== "string" ||
    typeof parsed.confidence !== "number"
  ) {
    throw new Error(`Invalid response schema returned from Gemini: ${text}`);
  }

  const confidence = Math.max(0.0, Math.min(1.0, parsed.confidence));
  const rawTheme = parsed.theme.trim();
  const theme = normalizeThemeName(rawTheme);

  console.log(`[ThemeClustering] Parsed result — raw theme: "${rawTheme}", normalized theme: "${theme}", confidence: ${confidence}`);

  return {
    theme,
    confidence,
  };
}
