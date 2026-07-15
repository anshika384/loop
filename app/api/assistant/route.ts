import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { generateContentWithRetry } from "@/lib/ai/gemini";

export async function POST(req: Request) {
  try {
    // STEP 1 Authentication
    console.log("STEP 1 Authentication");
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionToken },
      include: { workspace: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 401 });
    }

    // STEP 2 Workspace
    console.log("STEP 2 Workspace");
    if (!user.workspace) {
      console.warn("STEP 2 Workspace WARNING: user.workspace is null/undefined!");
    }
    const workspaceId = user.workspaceId;
    const workspaceName = user.workspace?.name || "Loop Workspace";

    // Validate request body
    let body: any;
    try {
      body = await req.json();
    } catch (jsonErr) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Request body must be a valid JSON object." },
        { status: 400 }
      );
    }

    const { prompt, history } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { success: false, message: "Prompt is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    // STEP 3 Feedback
    // STEP 4 Themes
    // STEP 5 Trends
    console.log("STEP 3 Feedback");
    console.log("STEP 4 Themes");
    console.log("STEP 5 Trends");

    let totalFeedback = 0;
    let sentiments: any[] = [];
    let recentNegatives: any[] = [];
    let recentPositives: any[] = [];
    let themes: any[] = [];
    let latestTrendReport: any = null;

    try {
      // Execute all database queries in parallel for maximum performance
      const [
        countDb,
        sentimentsDb,
        recentNegativesDb,
        recentPositivesDb,
        themesDb,
        trendDb
      ] = await Promise.all([
        prisma.feedback.count({ where: { workspaceId } }),
        prisma.feedback.groupBy({
          by: ["sentiment"],
          where: { workspaceId },
          _count: { sentiment: true },
        } as any),
        prisma.feedback.findMany({
          where: { workspaceId, sentiment: "NEG" },
          select: { content: true, channel: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 5, // Limit 1: Only load 5 newest negative feedback items
        }),
        prisma.feedback.findMany({
          where: { workspaceId, sentiment: "POS" },
          select: { content: true, channel: true },
          orderBy: { createdAt: "desc" },
          take: 3, // Limit 2: Only load 3 newest positive feedback items
        }),
        prisma.theme.findMany({
          where: { workspaceId },
          select: {
            id: true,
            name: true,
            description: true,
            feedbacks: {
              select: {
                confidence: true,
                feedback: {
                  select: { sentiment: true }
                }
              }
            }
          }
        }),
        prisma.report.findFirst({
          where: { workspaceId, title: "Workspace Trend Detection" },
          orderBy: { createdAt: "desc" },
        })
      ]);

      totalFeedback = countDb;
      sentiments = Array.isArray(sentimentsDb) ? sentimentsDb : [];
      recentNegatives = Array.isArray(recentNegativesDb) ? recentNegativesDb : [];
      recentPositives = Array.isArray(recentPositivesDb) ? recentPositivesDb : [];
      themes = Array.isArray(themesDb) ? themesDb : [];
      latestTrendReport = trendDb;

    } catch (dbErr: any) {
      console.error("[Assistant] STEP 3/4/5 database failure:", dbErr.message, dbErr.stack);
    }

    // STEP 6 Prompt Generated
    console.log("STEP 6 Prompt Generated");

    // Fallback if there's no feedback or themes
    if (totalFeedback === 0 || themes.length === 0) {
      console.log("[Assistant] Not enough customer feedback or themes. Returning early fallback message.");
      return NextResponse.json({
        success: true,
        reply: "There is currently not enough customer feedback to generate detailed insights.",
      });
    }

    // Sort themes by feedback count descending and take top 10 (Limit 3)
    const topThemes = themes
      .map((t) => ({
        ...t,
        feedbackCount: Array.isArray(t.feedbacks) ? t.feedbacks.length : 0,
      }))
      .sort((a, b) => b.feedbackCount - a.feedbackCount)
      .slice(0, 10);

    // Format sentiments safely
    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;
    sentiments.forEach((item) => {
      if (item && item.sentiment === "POS") posCount = item._count?.sentiment || 0;
      else if (item && item.sentiment === "NEU") neuCount = item._count?.sentiment || 0;
      else if (item && item.sentiment === "NEG") negCount = item._count?.sentiment || 0;
    });

    // Format top 10 themes summary
    const themesSummary = topThemes
      .map((t) => {
        if (!t) return "";
        const feedbacksArray = Array.isArray(t.feedbacks) ? t.feedbacks : [];
        const count = feedbacksArray.length;
        const negInTheme = feedbacksArray.filter((f: any) => f?.feedback?.sentiment === "NEG").length;
        return `- Theme "${t.name || "Unnamed"}": ${count} comments (${negInTheme} negative complaints). Description: ${t.description || "No description"}`;
      })
      .filter(Boolean)
      .join("\n");

    // Format 5 negative complaints
    const negativesText = recentNegatives
      .map((f, i) => {
        if (!f) return "";
        const dateStr = f.createdAt instanceof Date ? f.createdAt.toLocaleDateString() : String(f.createdAt || "");
        return `${i + 1}. "${f.content || ""}" (Channel: ${f.channel || "Unknown"}, Date: ${dateStr})`;
      })
      .filter(Boolean)
      .join("\n");

    // Format 3 positive comments
    const positivesText = recentPositives
      .map((f, i) => {
        if (!f) return "";
        return `${i + 1}. "${f.content || ""}" (Channel: ${f.channel || "Unknown"})`;
      })
      .filter(Boolean)
      .join("\n");

    // Incorporate trend detection insights
    let trendsText = "No trend analysis available yet.";
    if (latestTrendReport && latestTrendReport.contentJson) {
      try {
        const trendData = typeof latestTrendReport.contentJson === "string"
          ? JSON.parse(latestTrendReport.contentJson)
          : latestTrendReport.contentJson;

        if (trendData && Array.isArray(trendData.spikes) && trendData.spikes.length > 0) {
          trendsText = trendData.spikes
            .map((s: any) => {
              if (!s) return "";
              return `- [${s.severity || "Medium"} Severity] ${s.title || "Spike"}: Spike of ${s.spike || "0%"} (${s.delta || ""}) on ${s.channel || "Unknown"}`;
            })
            .filter(Boolean)
            .join("\n");
        } else {
          trendsText = "Trend analysis has run, but no abnormal volume spikes are currently flagged.";
        }
      } catch (err: any) {
        console.error("[Assistant] STEP 6 parsing trend contentJson error:", err.message);
      }
    }

    const systemPrompt = `You are the LOOP AI customer feedback assistant.
Your job is to answer the user's questions about workspace customer feedback using the actual database statistics and feedback details provided below.

INSTRUCTIONS:
1. Provide extremely detailed, professional, and data-driven responses.
2. Ground all numbers, percentages, and complaints strictly in the CONTEXT DATABASE DATA. Never hallucinate feedback comments or metrics.
3. If a question is about complaints or why users are unhappy, prioritize analyzing negative feedback comments and the most negative themes.
4. Gemini should only generate natural language. Do NOT write SQL or make code modifications. Never update database records.

CONTEXT DATABASE DATA:
- Workspace Name: "${workspaceName}"
- Total Feedback Items: ${totalFeedback}
- Sentiment Distribution:
  * Positive: ${posCount} (${totalFeedback > 0 ? ((posCount / totalFeedback) * 100).toFixed(1) : 0}%)
  * Neutral: ${neuCount} (${totalFeedback > 0 ? ((neuCount / totalFeedback) * 100).toFixed(1) : 0}%)
  * Negative: ${negCount} (${totalFeedback > 0 ? ((negCount / totalFeedback) * 100).toFixed(1) : 0}%)

THEME DISTRIBUTIONS & COMPLAINTS (TOP 10):
${themesSummary || "No themes defined yet."}

FLAGGED TREND SPIKES & ANOMALIES:
${trendsText}

RECENT CUSTOMER COMPLAINTS (NEWEST 5 SNIPPETS):
${negativesText || "No negative feedback recorded."}

RECENT CUSTOMER PRAISE (NEWEST 3 SNIPPETS):
${positivesText || "No positive feedback recorded."}
`;

    // Limit chat history to last 6 messages (Limit 4)
    let messagesInput: any[] = [];
    if (history && Array.isArray(history)) {
      const slicedHistory = history.slice(-6);
      messagesInput = slicedHistory
        .map((h: any) => {
          if (!h || typeof h.content !== "string") return null;
          return {
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.content }],
          };
        })
        .filter(Boolean);
    }
    
    // Add current user prompt
    messagesInput.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    console.log(`[Assistant] Prompt: "${prompt.substring(0, 60)}..." (workspaceId=${workspaceId})`);

    // STEP 7 Gemini Request
    console.log("STEP 7 Gemini Request");
    const geminiStartTime = Date.now();
    let responseText = "";
    
    try {
      const response = await generateContentWithRetry(
        messagesInput,
        {
          systemInstruction: systemPrompt,
          temperature: 0.2,
        },
        "gemini-2.5-flash"
      );

      // STEP 8 Gemini Response
      console.log("STEP 8 Gemini Response");
      const geminiLatency = Date.now() - geminiStartTime;
      console.log(`[Assistant] Gemini call resolved in ${geminiLatency}ms`);

      if (response && response.text) {
        responseText = response.text;
      } else {
        throw new Error("Returned response text from generateContentWithRetry() is empty.");
      }
    } catch (geminiErr: any) {
      console.error("[Assistant] Gemini request failed permanently after retries.");
      console.error(geminiErr.message);
      console.error(geminiErr.stack);

      // Graceful fallback for Gemini failures (Phase 3 requirement): Never return 500
      return NextResponse.json({
        success: true,
        reply: "I'm temporarily unable to analyze the latest customer feedback. Please try again in a moment.",
      });
    }

    // STEP 9 Response Sent
    console.log("STEP 9 Response Sent");
    return NextResponse.json({ success: true, reply: responseText });
  } catch (error: any) {
    console.error("[Assistant] POST outer handler error:");
    console.error(error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "An unexpected assistant handler error occurred.",
        stack: error?.stack,
      },
      { status: 500 }
    );
  }
}
