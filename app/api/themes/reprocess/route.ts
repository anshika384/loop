import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { clusterTheme, classifyLocalKeywords } from "@/lib/ai/themes";
import { analyzeSentiment } from "@/lib/ai/sentiment";
import { resolveAndOrCreateTheme, triggerTrendAnalysis } from "@/lib/feedback-service";

/**
 * Concurrency worker pool execution utility.
 */
async function processInBatches<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const promises: Promise<void>[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const curIndex = index++;
      const item = items[curIndex];
      try {
        results[curIndex] = await fn(item);
      } catch (err) {
        console.error(`Error in worker for item at index ${curIndex}:`, err);
      }
    }
  }

  for (let i = 0; i < Math.min(concurrency, items.length); i++) {
    promises.push(worker());
  }

  await Promise.all(promises);
  return results;
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: sessionToken } });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 401 });
    }

    if (user.role === "VIEWER") {
      return NextResponse.json(
        { success: false, message: "Access Denied: Only ADMINs and ANALYSTs can reprocess feedback." },
        { status: 403 }
      );
    }

    const workspaceId = user.workspaceId;
    console.log(`[ThemesReprocess] Rebuilding theme index for workspaceId=${workspaceId} user=${user.email}`);

    // Query ALL feedback items in the workspace for indexing
    const allFeedback = await prisma.feedback.findMany({
      where: { workspaceId },
      select: {
        id: true,
        content: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const totalFeedback = allFeedback.length;
    console.log(`[ThemesReprocess] Total Feedback to Index: ${totalFeedback}`);

    if (totalFeedback === 0) {
      return NextResponse.json({
        success: true,
        message: "No feedback items found to reprocess.",
        processed: 0,
        failed: 0,
        totalFeedback: 0,
      });
    }

    // Load existing workspace themes once
    let existingThemes = await prisma.theme.findMany({
      where: { workspaceId },
      select: { id: true, name: true },
    });

    let processed = 0;
    let failed = 0;

    const processFeedbackItem = async (fb: { id: string; content: string }) => {
      let sentiment: "POS" | "NEU" | "NEG" = "NEU";
      let score = 0.5;
      let themeName = "Other";
      let confidence = 0.7;

      // 1. Analyze Sentiment
      try {
        const sentimentResult = await analyzeSentiment(fb.content);
        sentiment = sentimentResult.sentiment;
        score = sentimentResult.score;
      } catch (err: any) {
        console.warn(`[ThemesReprocess] Sentiment analysis failed for fb ID: ${fb.id}. Using keyword classifier.`, err?.message || err);
        const fallback = classifyLocalKeywords(fb.content);
        sentiment = fallback.sentiment;
        score = fallback.sentimentScore;
      }

      // 2. Classify Theme
      try {
        const themeList = existingThemes.map((t) => t.name);
        const themeResult = await clusterTheme(fb.content, themeList);
        themeName = themeResult.theme;
        confidence = themeResult.confidence;
      } catch (err: any) {
        console.warn(`[ThemesReprocess] Theme clustering failed for fb ID: ${fb.id}. Using keyword classifier.`, err?.message || err);
        const fallback = classifyLocalKeywords(fb.content);
        themeName = fallback.theme;
        confidence = fallback.confidence;
      }

      // 3. Resolve and Save (with Normalization & Similarity Check)
      try {
        const themeId = await resolveAndOrCreateTheme(themeName, workspaceId, existingThemes);

        // Update sentiment & processing meta on Feedback
        await prisma.feedback.update({
          where: { id: fb.id },
          data: {
            sentiment,
            sentimentScore: score,
            aiProcessed: true,
            processedAt: new Date(),
          },
        });

        // Upsert FeedbackTheme relationship
        await prisma.feedbackTheme.upsert({
          where: { feedbackId_themeId: { feedbackId: fb.id, themeId } },
          create: { feedbackId: fb.id, themeId, confidence },
          update: { confidence },
        });

        processed++;
      } catch (err: any) {
        console.error(`[ThemesReprocess] Failed database upsert for fb ID: ${fb.id}. Error: ${err?.message || err}`);
        failed++;
      }
    };

    // Process all feedbacks concurrently with concurrency = 2
    await processInBatches(allFeedback, 2, processFeedbackItem);

    // Recompute and store the trend summary
    await triggerTrendAnalysis(workspaceId);

    const summaryText = `Index Rebuilt. Processed: ${totalFeedback}, Succeeded: ${processed}, Failed: ${failed}`;
    console.log(`[ThemesReprocess] Final summary: ${summaryText}`);

    return NextResponse.json({
      success: true,
      message: summaryText,
      processed,
      failed,
      totalFeedback,
    });
  } catch (error: any) {
    console.error("[ThemesReprocess] POST error:", error);
    return NextResponse.json(
      { success: false, message: "Theme index rebuilding failed due to server error." },
      { status: 500 }
    );
  }
}
