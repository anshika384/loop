import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionToken },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 401 });
    }

    const workspaceId = user.workspaceId;

    console.log(`[ThemesGET] Fetching themes for workspaceId=${workspaceId} (user=${user.email})`);

    // Fetch themes with feedbacks and related details using select for performance
    const themes = await prisma.theme.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        createdAt: true,
        feedbacks: {
          select: {
            confidence: true,
            feedback: {
              select: {
                id: true,
                content: true,
                channel: true,
                sentiment: true,
                sentimentScore: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    // Compute stats
    const data = themes.map((theme) => {
      const feedbacksList = theme.feedbacks.map((ft) => ({
        id: ft.feedback.id,
        content: ft.feedback.content,
        channel: ft.feedback.channel,
        sentiment: ft.feedback.sentiment,
        sentimentScore: ft.feedback.sentimentScore,
        status: ft.feedback.status,
        createdAt: ft.feedback.createdAt.toISOString(),
        confidence: ft.confidence,
      }));

      // Sort feedbacksList by newest first by default
      feedbacksList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const feedbackCount = theme.feedbacks.length;
      let posCount = 0;
      let neuCount = 0;
      let negCount = 0;
      let totalConfidence = 0;
      let newestFeedbackTime: string | null = null;

      theme.feedbacks.forEach((ft) => {
        const sentiment = ft.feedback.sentiment;
        if (sentiment === "POS") posCount++;
        else if (sentiment === "NEU") neuCount++;
        else if (sentiment === "NEG") negCount++;

        totalConfidence += ft.confidence;

        const fbTime = ft.feedback.createdAt.toISOString();
        if (!newestFeedbackTime || fbTime > newestFeedbackTime) {
          newestFeedbackTime = fbTime;
        }
      });

      const averageConfidence = feedbackCount > 0 ? totalConfidence / feedbackCount : 0.0;

      return {
        id: theme.id,
        name: theme.name,
        description: theme.description || "Automatically grouped feedback theme based on topic similarity.",
        color: theme.color,
        createdAt: theme.createdAt.toISOString(),
        feedbackCount,
        posCount,
        neuCount,
        negCount,
        averageConfidence,
        mostRecentFeedbackTime: newestFeedbackTime,
        feedbacks: feedbacksList,
      };
    });

    console.log(`[ThemesGET] Returning ${data.length} themes to the page for workspaceId=${workspaceId}`);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Themes GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to load workspace themes." }, { status: 500 });
  }
}
