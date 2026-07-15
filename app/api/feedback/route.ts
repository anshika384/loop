import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { bulkImport, addSingleFeedback, deleteFeedback } from "@/lib/feedback-service";

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
      select: {
        id: true,
        content: true,
        channel: true,
        sourceRef: true,
        customerLabel: true,
        sentiment: true,
        sentimentScore: true,
        status: true,
        aiProcessed: true,
        processedAt: true,
        createdAt: true,
        updatedAt: true,
        workspaceId: true,
        assignedToId: true,
        themes: {
          select: {
            confidence: true,
            theme: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            role: true,
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
      return NextResponse.json({ success: false, message: "Access Denied: Only workspace ADMINs and ANALYSTs can import feedback." }, { status: 403 });
    }

    const body = await req.json();

    if (Array.isArray(body)) {
      // Bulk import CSV rows
      const report = await bulkImport(body, user.workspaceId);
      if (!report.success) {
        return NextResponse.json({ success: false, message: "Bulk import operation failed." }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        data: report,
        message: "CSV Feedbacks processed successfully.",
      }, { status: 201 });
    } else {
      // Single manual entry
      const { content, channel, customerLabel, sourceRef } = body;
      if (!content || !channel) {
        return NextResponse.json({ success: false, message: "Missing content or channel." }, { status: 400 });
      }

      const created = await addSingleFeedback({
        content,
        channel,
        customerLabel,
        sourceRef
      }, user.workspaceId);

      return NextResponse.json({
        success: true,
        data: created,
        message: "Manual feedback submitted successfully.",
      }, { status: 201 });
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

    const body = await req.json();
    const { feedbackId, status, assignedToId } = body;

    if (!feedbackId) {
      return NextResponse.json({ success: false, message: "Missing feedbackId." }, { status: 400 });
    }

    // Load original feedback log
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback || feedback.workspaceId !== user.workspaceId) {
      return NextResponse.json({ success: false, message: "Feedback not found." }, { status: 404 });
    }

    // Dev mode validation logging
    console.log("[Feedback PUT Auth DevLog]:", {
      authUserId: user.id,
      authUserEmail: user.email,
      authUserRole: user.role,
      userWorkspaceId: user.workspaceId,
      feedbackId,
      requestedStatus: status,
      requestedAssignedToId: assignedToId,
      currentFeedbackAssignedToId: feedback.assignedToId,
      actionType: {
        isChangingAssignment: assignedToId !== undefined,
        isChangingStatus: status !== undefined,
      }
    });

    const isAdmin = user.role === "ADMIN";

    // 1. If the request is changing assignedToId (assigning or reassigning feedback)
    if (assignedToId !== undefined) {
      if (user.role !== "ADMIN") {
        console.warn(`[Feedback PUT Auth Forbidden]: User ${user.email} (${user.role}) attempted feedback assignment update.`);
        return NextResponse.json({ success: false, message: "Access Denied: Only workspace ADMINs can assign or reassign feedback." }, { status: 403 });
      }
    }

    // 2. If the request is changing feedback status
    if (status !== undefined) {
      if (user.role === "ADMIN") {
        // ADMIN is always allowed to change status
      } else if (user.role === "ANALYST") {
        // ANALYST is allowed only if the feedback is assigned to themselves
        if (feedback.assignedToId !== user.id) {
          console.warn(`[Feedback PUT Auth Forbidden]: Analyst ${user.email} attempted status update on feedback not assigned to them.`);
          return NextResponse.json({ success: false, message: "Access Denied: Analysts can only update status for feedback assigned to themselves." }, { status: 403 });
        }
      } else {
        // Reject everyone else (including VIEWERS)
        console.warn(`[Feedback PUT Auth Forbidden]: User ${user.email} (${user.role}) attempted status update.`);
        return NextResponse.json({ success: false, message: "Access Denied: You do not have permission to update feedback status." }, { status: 403 });
      }
    }

    let updatedData: any = {};
    let messages: string[] = [];

    // 1. Process Assignment Changes (ADMIN only)
    if (assignedToId !== undefined) {
      if (!isAdmin) {
        return NextResponse.json({ success: false, message: "Access Denied: Only workspace ADMINs can change assignments." }, { status: 403 });
      }

      let assigneeName = "Unassigned";
      if (assignedToId) {
        const assignee = await prisma.user.findUnique({
          where: { id: assignedToId },
        });
        if (!assignee || assignee.workspaceId !== user.workspaceId) {
          return NextResponse.json({ success: false, message: "Assignee user not found in this workspace." }, { status: 400 });
        }
        assigneeName = assignee.name;
      }

      updatedData.assignedToId = assignedToId;
      messages.push(assignedToId ? `Feedback assigned to ${assigneeName}.` : "Feedback unassigned.");

      // Log assignment activity
      await prisma.activity.create({
        data: {
          action: "Feedback assigned",
          target: assignedToId ? `to ${assigneeName}` : "Unassigned",
          workspaceId: user.workspaceId,
        },
      });
    }

    // 2. Process Status Transitions
    if (status !== undefined) {
      const currentStatus = feedback.status;

      // Validate transitions for non-ADMINs (ADMINs have overrides/reverts bypass)
      if (!isAdmin) {
        if (currentStatus === "NEW" && status === "ACTIONED") {
          return NextResponse.json({ success: false, message: "Access Denied: Direct transitions from NEW to ACTIONED are blocked. Feedbacks must be REVIEWED first." }, { status: 400 });
        }
        if (status === "REVIEWED" && currentStatus !== "NEW") {
          return NextResponse.json({ success: false, message: "Access Denied: Analysts can only mark NEW feedbacks as REVIEWED." }, { status: 400 });
        }
        if (status === "ACTIONED" && currentStatus !== "REVIEWED") {
          return NextResponse.json({ success: false, message: "Access Denied: Only REVIEWED feedbacks can be marked as ACTIONED." }, { status: 400 });
        }
      } else {
        // Even for admins, block skipping NEW -> ACTIONED directly to preserve lifecycle integrity
        if (currentStatus === "NEW" && status === "ACTIONED") {
          return NextResponse.json({ success: false, message: "Access Denied: Direct transitions from NEW to ACTIONED are blocked. Feedbacks must be REVIEWED first." }, { status: 400 });
        }
      }

      updatedData.status = status;
      
      let actionLabel = "status updated";
      let logTarget = `Status set to ${status} by ${user.name}`;

      if (status === "REVIEWED") {
        actionLabel = "Feedback marked as Reviewed";
        logTarget = `by ${user.name}`;
        messages.push("Feedback marked as Reviewed.");
      } else if (status === "ACTIONED") {
        actionLabel = "Feedback marked as Actioned";
        logTarget = `by ${user.name}`;
        messages.push("Feedback marked as Actioned.");
      } else {
        messages.push(`Feedback status updated to ${status}.`);
      }

      // Log transition activity
      await prisma.activity.create({
        data: {
          action: actionLabel,
          target: logTarget,
          workspaceId: user.workspaceId,
        },
      });
    }

    if (Object.keys(updatedData).length === 0) {
      return NextResponse.json({ success: false, message: "No attributes to update." }, { status: 400 });
    }

    const updated = await prisma.feedback.update({
      where: { id: feedbackId },
      data: updatedData,
      include: {
        assignedTo: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: messages.join(" "),
    });
  } catch (error) {
    console.error("Feedback PUT error:", error);
    return NextResponse.json({ success: false, message: "Failed to update feedback attributes." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
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

    // RBAC: Only ADMIN can delete feedback records
    if (user.role !== "ADMIN") {
      console.warn(`[Feedback DELETE Auth Forbidden]: Non-ADMIN user ${user.email} (${user.role}) attempted delete.`);
      return NextResponse.json({ success: false, message: "Access Denied: Only workspace ADMINs can delete feedback." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const feedbackId = searchParams.get("feedbackId");

    if (!feedbackId) {
      return NextResponse.json({ success: false, message: "Missing feedbackId parameter." }, { status: 400 });
    }

    await deleteFeedback(feedbackId, user.workspaceId, user.name);

    return NextResponse.json({
      success: true,
      message: "Feedback deleted successfully.",
    });
  } catch (error: any) {
    console.error("Feedback DELETE error:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to delete feedback." }, { status: 500 });
  }
}
