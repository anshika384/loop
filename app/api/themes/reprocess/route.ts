import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { clusterTheme, classifyLocalKeywords, normalizeThemeName, getSimilarity } from "@/lib/ai/themes";
import { analyzeSentiment } from "@/lib/ai/sentiment";
import { triggerTrendAnalysis } from "@/lib/feedback-service";
import { invalidateCachedContext } from "@/lib/assistant-cache";
import crypto from "crypto";

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
    const existingThemes = await prisma.theme.findMany({
      where: { workspaceId },
      select: { id: true, name: true },
    });

    // In-memory cache structures for theme resolution
    const themeMap = new Map<string, string>();
    const existingThemesList: { id: string; name: string }[] = [];
    existingThemes.forEach((t) => {
      const key = t.name.toLowerCase().trim();
      themeMap.set(key, t.id);
      existingThemesList.push({ id: t.id, name: t.name });
    });

    const newThemesToCreate: { id: string; name: string; color: string; workspaceId: string }[] = [];

    // Helper to resolve theme name completely in-memory
    const resolveThemeInMemory = (themeName: string): string => {
      const normalized = normalizeThemeName(themeName);
      const key = normalized.toLowerCase().trim();

      // 1. Check exact match in Map
      if (themeMap.has(key)) {
        return themeMap.get(key)!;
      }

      // 2. Check Dice similarity coefficient (>80% overlap) in the combined list
      for (const t of existingThemesList) {
        const sim = getSimilarity(t.name, normalized);
        if (sim > 0.8) {
          themeMap.set(key, t.id);
          return t.id;
        }
      }

      // 3. Create a new canonical theme (in-memory first)
      const newId = crypto.randomUUID();
      const PRESET_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#14B8A6", "#6366F1"];
      const color = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];

      const newTheme = {
        id: newId,
        name: normalized,
        color,
        workspaceId,
      };

      newThemesToCreate.push(newTheme);
      existingThemesList.push({ id: newId, name: normalized });
      themeMap.set(key, newId);

      return newId;
    };

    let processed = 0;
    let failed = 0;

    const feedbackUpdates: {
      id: string;
      sentiment: "POS" | "NEU" | "NEG";
      sentimentScore: number;
      processedAt: Date;
    }[] = [];

    const feedbackThemesToCreate: {
      feedbackId: string;
      themeId: string;
      confidence: number;
    }[] = [];

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
        const themeList = existingThemesList.map((t) => t.name);
        const themeResult = await clusterTheme(fb.content, themeList);
        themeName = themeResult.theme;
        confidence = themeResult.confidence;
      } catch (err: any) {
        console.warn(`[ThemesReprocess] Theme clustering failed for fb ID: ${fb.id}. Using keyword classifier.`, err?.message || err);
        const fallback = classifyLocalKeywords(fb.content);
        themeName = fallback.theme;
        confidence = fallback.confidence;
      }

      // 3. Resolve theme and push updates to memory collections
      try {
        const themeId = resolveThemeInMemory(themeName);

        feedbackUpdates.push({
          id: fb.id,
          sentiment,
          sentimentScore: score,
          processedAt: new Date(),
        });

        feedbackThemesToCreate.push({
          feedbackId: fb.id,
          themeId,
          confidence,
        });

        processed++;
      } catch (err: any) {
        console.error(`[ThemesReprocess] Failed resolving theme in-memory for fb ID: ${fb.id}. Error: ${err?.message || err}`);
        failed++;
      }
    };

    // Process all feedbacks concurrently with concurrency = 3
    await processInBatches(allFeedback, 3, processFeedbackItem);

    // 4. Perform Batched Writes in a Single Transaction
    const operations = [];

    // Batch Theme creations
    if (newThemesToCreate.length > 0) {
      operations.push(
        prisma.theme.createMany({
          data: newThemesToCreate,
          skipDuplicates: true,
        })
      );
    }

    // Batch FeedbackTheme deletes (to prevent duplicate primary key violations during reprocess)
    const feedbackIds = allFeedback.map((f) => f.id);
    operations.push(
      prisma.feedbackTheme.deleteMany({
        where: {
          feedbackId: { in: feedbackIds },
        },
      })
    );

    // Batch FeedbackTheme inserts
    if (feedbackThemesToCreate.length > 0) {
      operations.push(
        prisma.feedbackTheme.createMany({
          data: feedbackThemesToCreate,
          skipDuplicates: true,
        })
      );
    }

    // Batch Feedback updates
    for (const update of feedbackUpdates) {
      operations.push(
        prisma.feedback.update({
          where: { id: update.id },
          data: {
            sentiment: update.sentiment,
            sentimentScore: update.sentimentScore,
            aiProcessed: true,
            processedAt: update.processedAt,
          },
        })
      );
    }

    if (operations.length > 0) {
      console.log(`[ThemesReprocess] Executing batch database operations in $transaction: ${operations.length} operations.`);
      await prisma.$transaction(operations);
    }

    // Recompute and store the trend summary
    await triggerTrendAnalysis(workspaceId);

    // Invalidate assistant cache for this workspace as feedback theme classifications changed
    invalidateCachedContext(workspaceId);

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
