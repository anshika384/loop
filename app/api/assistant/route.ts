import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { generateContentWithRetry } from "@/lib/ai/gemini";
import { getCachedContext, setCachedContext } from "@/lib/assistant-cache";

export async function POST(req: Request) {
  const startTime = Date.now();
  let dbQueryTime = 0;
  let promptBuildTime = 0;
  let geminiTime = 0;

  try {
    // STEP 1 Authentication
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

    // Lazy retrieval checks
    const promptLower = prompt.toLowerCase();
    const wantsComplaints = promptLower.includes("show all complaints") || promptLower.includes("complaint") || promptLower.includes("negative") || promptLower.includes("bad") || promptLower.includes("issue") || promptLower.includes("problem") || promptLower.includes("bug") || promptLower.includes("crash") || promptLower.includes("error") || promptLower.includes("fail") || promptLower.includes("slow") || promptLower.includes("lag");
    const wantsPositive = promptLower.includes("show positive reviews") || promptLower.includes("positive") || promptLower.includes("praise") || promptLower.includes("good") || promptLower.includes("love") || promptLower.includes("like") || promptLower.includes("recommend") || promptLower.includes("satisfy");
    const wantsCheckout = promptLower.includes("show checkout complaints") || promptLower.includes("checkout") || promptLower.includes("payment") || promptLower.includes("stripe") || promptLower.includes("billing") || promptLower.includes("invoice");

    let dbStart = Date.now();

    // Get static context from cache or database
    let contextData = getCachedContext(workspaceId);

    if (!contextData) {
      const [
        countDb,
        sentimentsDb,
        themesDb,
        trendDb
      ] = await Promise.all([
        prisma.feedback.count({ where: { workspaceId } }),
        prisma.feedback.groupBy({
          by: ["sentiment"],
          where: { workspaceId },
          _count: { sentiment: true },
        } as any),
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

      const totalFeedback = countDb;
      const sentiments = Array.isArray(sentimentsDb) ? (sentimentsDb as any[]) : [];
      const themes = Array.isArray(themesDb) ? themesDb : [];
      const latestTrendReport = trendDb;

      // Sort themes by feedback count descending and take top 5
      const topThemes = themes
        .map((t) => ({
          name: t.name,
          description: t.description,
          feedbackCount: Array.isArray(t.feedbacks) ? t.feedbacks.length : 0,
          negCount: Array.isArray(t.feedbacks) ? t.feedbacks.filter((f: any) => f?.feedback?.sentiment === "NEG").length : 0,
        }))
        .sort((a, b) => b.feedbackCount - a.feedbackCount)
        .slice(0, 5);

      let posCount = 0;
      let neuCount = 0;
      let negCount = 0;
      sentiments.forEach((item) => {
        if (item && item.sentiment === "POS") posCount = item._count?.sentiment || 0;
        else if (item && item.sentiment === "NEU") neuCount = item._count?.sentiment || 0;
        else if (item && item.sentiment === "NEG") negCount = item._count?.sentiment || 0;
      });

      const themesSummary = topThemes
        .map((t) => `- Theme "${t.name}": ${t.feedbackCount} comments (${t.negCount} negative). Desc: ${t.description ? t.description.substring(0, 60) : "No description"}`)
        .join("\n");

      let trendsText = "No trend analysis available yet.";
      if (latestTrendReport && latestTrendReport.contentJson) {
        try {
          const trendData = typeof latestTrendReport.contentJson === "string"
            ? JSON.parse(latestTrendReport.contentJson)
            : latestTrendReport.contentJson;

          if (trendData && Array.isArray(trendData.spikes) && trendData.spikes.length > 0) {
            trendsText = trendData.spikes
              .slice(0, 3)
              .map((s: any) => `- [${s.severity}] ${s.title}: Spike of ${s.spike} (${s.delta}) on ${s.channel}`)
              .join("\n");
          } else {
            trendsText = "No abnormal volume spikes currently flagged.";
          }
        } catch (err) {}
      }

      contextData = {
        workspaceName,
        totalFeedback,
        posCount,
        neuCount,
        negCount,
        themesSummary,
        trendsText,
      };
      setCachedContext(workspaceId, contextData);
    }

    // Lazy retrieval queries
    let recentNegatives: any[] = [];
    let recentPositives: any[] = [];
    let checkoutComplaints: any[] = [];

    const lazyQueries: Promise<any>[] = [];

    if (wantsComplaints) {
      lazyQueries.push(
        prisma.feedback.findMany({
          where: { workspaceId, sentiment: "NEG" },
          select: { content: true, channel: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }).then(res => { recentNegatives = res; })
      );
    }

    if (wantsPositive) {
      lazyQueries.push(
        prisma.feedback.findMany({
          where: { workspaceId, sentiment: "POS" },
          select: { content: true, channel: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }).then(res => { recentPositives = res; })
      );
    }

    if (wantsCheckout) {
      lazyQueries.push(
        prisma.feedback.findMany({
          where: {
            workspaceId,
            sentiment: "NEG",
            OR: [
              { content: { contains: "checkout", mode: "insensitive" } },
              { content: { contains: "stripe", mode: "insensitive" } },
              { content: { contains: "payment", mode: "insensitive" } },
            ],
          },
          select: { content: true, channel: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }).then(res => { checkoutComplaints = res; })
      );
    }

    if (lazyQueries.length > 0) {
      await Promise.all(lazyQueries);
    }
    dbQueryTime = Date.now() - dbStart;

    // STEP 6 Prompt Generated
    const promptBuildStart = Date.now();

    // Fallback if there's no feedback
    if (contextData.totalFeedback === 0) {
      return NextResponse.json({
        success: true,
        reply: "There is currently not enough customer feedback to generate detailed insights.",
      });
    }

    // Format optional lazy retrieved comments
    let negativesText = "";
    if (wantsComplaints && recentNegatives.length > 0) {
      negativesText = "\n\nRECENT CUSTOMER COMPLAINTS:\n" + recentNegatives
        .map((f, i) => `${i + 1}. "${f.content}" (Channel: ${f.channel})`)
        .join("\n");
    }

    let positivesText = "";
    if (wantsPositive && recentPositives.length > 0) {
      positivesText = "\n\nRECENT CUSTOMER PRAISE:\n" + recentPositives
        .map((f, i) => `${i + 1}. "${f.content}" (Channel: ${f.channel})`)
        .join("\n");
    }

    let checkoutText = "";
    if (wantsCheckout && checkoutComplaints.length > 0) {
      checkoutText = "\n\nCHECKOUT / PAYMENT COMPLAINTS:\n" + checkoutComplaints
        .map((f, i) => `${i + 1}. "${f.content}" (Channel: ${f.channel})`)
        .join("\n");
    }

    let systemPrompt = `You are the LOOP AI customer feedback assistant.
Answer questions about workspace feedback using the data below. Ground all answers strictly in this data.

CONTEXT DATABASE DATA:
- Workspace Name: "${contextData.workspaceName}"
- Total Feedback Items: ${contextData.totalFeedback}
- Sentiment Distribution:
  * Positive: ${contextData.posCount}
  * Neutral: ${contextData.neuCount}
  * Negative: ${contextData.negCount}

TOP 5 THEMES:
${contextData.themesSummary || "No themes defined."}

LATEST TREND SUMMARY:
${contextData.trendsText}${negativesText}${positivesText}${checkoutText}`;

    // Ensure prompt size fits strictly < 3000 characters
    if (systemPrompt.length > 2000) {
      systemPrompt = systemPrompt.substring(0, 2000) + "\n[Truncated to fit limits]";
    }

    // Limit chat history to last 5 messages in total (including the current user prompt)
    // So history slice length should be at most 4.
    let messagesInput: any[] = [];
    if (history && Array.isArray(history)) {
      const slicedHistory = history.slice(-4);
      messagesInput = slicedHistory
        .map((h: any) => {
          if (!h || typeof h.content !== "string") return null;
          let text = h.content;
          if (text.length > 200) {
            text = text.substring(0, 200) + "...";
          }
          return {
            role: h.role === "user" ? "user" : "model",
            parts: [{ text }],
          };
        })
        .filter(Boolean);
    }
    
    // Add current user prompt
    let trimmedPrompt = prompt;
    if (trimmedPrompt.length > 500) {
      trimmedPrompt = trimmedPrompt.substring(0, 500) + "...";
    }
    messagesInput.push({
      role: "user",
      parts: [{ text: trimmedPrompt }],
    });

    promptBuildTime = Date.now() - promptBuildStart;

    // STEP 7 Gemini Request
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

      geminiTime = Date.now() - geminiStartTime;

      if (response && response.text) {
        responseText = response.text;
      } else {
        throw new Error("Returned response text from generateContentWithRetry() is empty.");
      }
    } catch (geminiErr: any) {
      console.error("[Assistant] Gemini request failed permanently after retries:", geminiErr.message);
      return NextResponse.json({
        success: true,
        reply: "I'm temporarily unable to analyze the latest customer feedback. Please try again in a moment.",
      });
    }

    // Log performance metrics
    const totalRequestTime = Date.now() - startTime;
    console.log(`[Assistant Performance Metrics]`);
    console.log(`- DB Query Time: ${dbQueryTime} ms`);
    console.log(`- Prompt Build Time: ${promptBuildTime} ms`);
    console.log(`- Gemini Time: ${geminiTime} ms`);
    console.log(`- Total Request Time: ${totalRequestTime} ms`);

    return NextResponse.json({ success: true, reply: responseText });
  } catch (error: any) {
    console.error("[Assistant] POST outer handler error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "An unexpected assistant handler error occurred.",
      },
      { status: 500 }
    );
  }
}
