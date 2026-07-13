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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const sentiment = searchParams.get("sentiment");
    const status = searchParams.get("status");
    const channel = searchParams.get("channel");
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {
      workspaceId: user.workspaceId,
    };

    if (search) {
      whereClause.content = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (sentiment) {
      whereClause.sentiment = sentiment as any;
    }

    if (status) {
      whereClause.status = status as any;
    }

    if (channel) {
      whereClause.channel = channel;
    }

    const totalItems = await prisma.feedback.count({
      where: whereClause,
    });

    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      include: {
        themes: {
          include: {
            theme: true,
          },
        },
      },
      orderBy: {
        createdAt: sortBy === "oldest" ? "asc" : "desc",
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: feedbacks,
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error("Feedback GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to load feedback logs." }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    // Role verification (VIEWER cannot import or submit feedbacks)
    if (user.role === "VIEWER") {
      return NextResponse.json({ success: false, message: "Access Denied: VIEWERS cannot create or import feedback." }, { status: 403 });
    }

    const body = await req.json();

    if (Array.isArray(body)) {
      // Bulk import
      const createdCount = await prisma.$transaction(async (tx) => {
        let count = 0;
        for (const item of body) {
          if (!item.content || !item.channel) continue;
          await tx.feedback.create({
            data: {
              content: item.content,
              channel: item.channel,
              sentiment: (item.sentiment || "NEU") as any,
              sentimentScore: item.sentimentScore || 0.5,
              status: "NEW",
              workspaceId: user.workspaceId,
            },
          });
          count++;
        }

        if (count > 0) {
          await tx.activity.create({
            data: {
              action: "CSV imported",
              target: `${count} feedback items`,
              workspaceId: user.workspaceId,
            },
          });
        }

        return count;
      });

      return NextResponse.json({ success: true, message: `Successfully imported ${createdCount} feedback items.` }, { status: 201 });
    } else {
      // Single feedback creation
      const { content, channel, sentiment } = body;
      if (!content || !channel) {
        return NextResponse.json({ success: false, message: "Missing content or channel." }, { status: 400 });
      }

      // Simple mock AI classification for single entry
      let detectedSentiment = sentiment || "NEU";
      let score = 0.5;
      if (!sentiment) {
        const positiveKeywords = ["great", "love", "amazing", "good", "fast", "awesome", "beautiful"];
        const negativeKeywords = ["lag", "slow", "fail", "timeout", "bug", "error", "worst", "unhappy"];
        const contentLower = content.toLowerCase();
        
        const isPos = positiveKeywords.some(kw => contentLower.includes(kw));
        const isNeg = negativeKeywords.some(kw => contentLower.includes(kw));
        
        if (isPos && !isNeg) {
          detectedSentiment = "POS";
          score = 0.9;
        } else if (isNeg && !isPos) {
          detectedSentiment = "NEG";
          score = 0.15;
        }
      } else {
        score = sentiment === "POS" ? 0.95 : sentiment === "NEG" ? 0.12 : 0.5;
      }

      const created = await prisma.feedback.create({
        data: {
          content,
          channel,
          sentiment: detectedSentiment as any,
          sentimentScore: score,
          status: "NEW",
          workspaceId: user.workspaceId,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          action: "Feedback added",
          target: `Via ${channel}`,
          workspaceId: user.workspaceId,
        },
      });

      return NextResponse.json({ success: true, data: created, message: "Feedback submitted successfully." }, { status: 201 });
    }
  } catch (error) {
    console.error("Feedback POST error:", error);
    return NextResponse.json({ success: false, message: "Failed to submit feedback." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
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

    // Role verification (VIEWER cannot modify feedbacks)
    if (user.role === "VIEWER") {
      return NextResponse.json({ success: false, message: "Access Denied: VIEWERS cannot update feedback status." }, { status: 403 });
    }

    const body = await req.json();
    const { feedbackId, status } = body;

    if (!feedbackId || !status) {
      return NextResponse.json({ success: false, message: "Missing feedbackId or status." }, { status: 400 });
    }

    const updated = await prisma.feedback.update({
      where: { id: feedbackId, workspaceId: user.workspaceId },
      data: { status: status as any },
    });

    return NextResponse.json({ success: true, data: updated, message: "Feedback status updated." });
  } catch (error) {
    console.error("Feedback PUT error:", error);
    return NextResponse.json({ success: false, message: "Failed to update feedback attributes." }, { status: 500 });
  }
}
