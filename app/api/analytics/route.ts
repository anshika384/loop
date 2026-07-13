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
      include: { workspace: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 401 });
    }

    const workspaceId = user.workspaceId;

    // Get time filter range if passed (default 30 days)
    const { searchParams } = new URL(req.url);
    const filterDays = parseInt(searchParams.get("days") || "30", 10);
    const dateLimit = new Date(Date.now() - filterDays * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Perform parallel queries using Promise.all() for optimal performance and concurrency
    const [
      totalFeedbackOverall,
      totalFeedback,
      sentiments,
      totalUsers,
      newFeedbackThisWeek,
      totalReports,
      recentFeedbacks,
      themes,
      channelStats,
      feedbacksForTimeline,
      recentActivityDb
    ] = await Promise.all([
      // 1. Total Feedback Count (overall)
      prisma.feedback.count({
        where: { workspaceId },
      }),
      // 2. Total Feedback Count (filtered)
      prisma.feedback.count({
        where: { workspaceId, createdAt: { gte: dateLimit } },
      }),
      // 3. Sentiment distribution in time range
      prisma.feedback.groupBy({
        by: ["sentiment"],
        where: { workspaceId, createdAt: { gte: dateLimit } },
        _count: {
          sentiment: true,
        },
      }),
      // 4. Total Users Count in workspace
      prisma.user.count({
        where: { workspaceId },
      }),
      // 5. New Feedback This Week (last 7 days)
      prisma.feedback.count({
        where: { workspaceId, createdAt: { gte: sevenDaysAgo } },
      }),
      // 6. Reports generated (AI Insights Generated)
      prisma.report.count({
        where: { workspaceId },
      }),
      // 7. Recent feedbacks list (last 10 items)
      prisma.feedback.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          themes: {
            include: {
              theme: true,
            },
          },
        },
      }),
      // 8. Theme breakdown frequencies (overall)
      prisma.theme.findMany({
        where: { workspaceId },
        include: {
          _count: {
            select: { feedbacks: true },
          },
        },
        orderBy: {
          feedbacks: {
            _count: "desc",
          },
        },
        take: 4,
      }),
      // 9. Sources & Channels distribution
      prisma.feedback.groupBy({
        by: ["channel"],
        where: { workspaceId, createdAt: { gte: dateLimit } },
        _count: {
          channel: true,
        },
        orderBy: {
          _count: {
            channel: "desc",
          },
        },
      }),
      // 10. Timeline Data (Feedback Volume Over Time)
      prisma.feedback.findMany({
        where: { workspaceId, createdAt: { gte: dateLimit } },
        select: { createdAt: true, sentiment: true },
      }),
      // 11. Recent Activity feed (from database)
      prisma.activity.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    ]);

    let posCount = 0;
    let neuCount = 0;
    let negCount = 0;

    sentiments.forEach((item) => {
      if (item.sentiment === "POS") posCount = item._count.sentiment;
      else if (item.sentiment === "NEU") neuCount = item._count.sentiment;
      else if (item.sentiment === "NEG") negCount = item._count.sentiment;
    });

    const totalCalculated = posCount + neuCount + negCount;
    const posPct = totalCalculated > 0 ? Math.round((posCount / totalCalculated) * 100) : 0;
    const neuPct = totalCalculated > 0 ? Math.round((neuCount / totalCalculated) * 100) : 0;
    const negPct = totalCalculated > 0 ? Math.round((negCount / totalCalculated) * 100) : 0;

    const totalChannelCount = channelStats.reduce((sum, item) => sum + item._count.channel, 0);

    const channelConfig: Record<string, { name: string; color: string }> = {
      Zendesk: { name: "Zendesk Support", color: "bg-blue-500" },
      Intercom: { name: "Intercom Messenger", color: "bg-indigo-500" },
      "App Store": { name: "App Store Reviews", color: "bg-emerald-500" },
      Twitter: { name: "Twitter/X Mentions", color: "bg-sky-500" },
      Hubspot: { name: "Hubspot Integration", color: "bg-orange-500" },
      Slack: { name: "Slack Integration", color: "bg-purple-500" },
      CSV: { name: "CSV Import", color: "bg-amber-500" },
    };

    const sourceData = channelStats.map((item) => {
      const config = channelConfig[item.channel] || { name: `${item.channel} Channel`, color: "bg-slate-500" };
      const pct = totalChannelCount > 0 ? Math.round((item._count.channel / totalChannelCount) * 100) : 0;
      return {
        name: config.name,
        count: item._count.channel,
        pct,
        color: config.color,
      };
    });

    const timelineData: { day: string; positive: number; negative: number }[] = [];

    if (filterDays === 7) {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
        timelineData.push({ day: dayLabel, positive: 0, negative: 0 });
      }
      feedbacksForTimeline.forEach((f) => {
        const fDate = new Date(f.createdAt);
        const dayLabel = fDate.toLocaleDateString("en-US", { weekday: "short" });
        const dayObj = timelineData.find((t) => t.day === dayLabel);
        if (dayObj) {
          if (f.sentiment === "POS") dayObj.positive++;
          else if (f.sentiment === "NEG") dayObj.negative++;
        }
      });
    } else if (filterDays === 30) {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        timelineData.push({ day: dayLabel, positive: 0, negative: 0 });
      }
      feedbacksForTimeline.forEach((f) => {
        const fDate = new Date(f.createdAt);
        const dayLabel = fDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const dayObj = timelineData.find((t) => t.day === dayLabel);
        if (dayObj) {
          if (f.sentiment === "POS") dayObj.positive++;
          else if (f.sentiment === "NEG") dayObj.negative++;
        }
      });
    } else if (filterDays === 90) {
      for (let i = 11; i >= 0; i--) {
        const label = `Wk ${12 - i}`;
        timelineData.push({ day: label, positive: 0, negative: 0 });
      }
      feedbacksForTimeline.forEach((f) => {
        const fTime = new Date(f.createdAt).getTime();
        const nowTime = Date.now();
        const diffWeeks = Math.floor((nowTime - fTime) / (7 * 24 * 60 * 60 * 1000));
        if (diffWeeks >= 0 && diffWeeks < 12) {
          const idx = 11 - diffWeeks;
          if (f.sentiment === "POS") timelineData[idx].positive++;
          else if (f.sentiment === "NEG") timelineData[idx].negative++;
        }
      });
    } else {
      // 365 Days or default
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleDateString("en-US", { month: "short" });
        timelineData.push({ day: label, positive: 0, negative: 0 });
      }
      feedbacksForTimeline.forEach((f) => {
        const fDate = new Date(f.createdAt);
        const fLabel = fDate.toLocaleDateString("en-US", { month: "short" });
        const dayObj = timelineData.find((t) => t.day === fLabel);
        if (dayObj) {
          if (f.sentiment === "POS") dayObj.positive++;
          else if (f.sentiment === "NEG") dayObj.negative++;
        }
      });
    }


    return NextResponse.json({
      success: true,
      data: {
        workspaceName: user.workspace.name,
        userRole: user.role,
        totalFeedback,
        totalFeedbackOverall,
        totalUsers,
        newFeedbackThisWeek,
        posPct,
        neuPct,
        negPct,
        posCount,
        neuCount,
        negCount,
        totalReports,
        recentFeedbacks,
        topThemesData: themes.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          color: t.color,
          volume: t._count.feedbacks,
        })),
        sourceData,
        timelineData,
        recentActivity: recentActivityDb.map((act) => ({
          id: act.id,
          action: act.action,
          target: act.target,
          time: act.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ success: false, message: "Failed to load dashboard metrics." }, { status: 500 });
  }
}
