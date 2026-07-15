import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { triggerTrendAnalysis } from "@/lib/feedback-service";

export async function GET() {
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

    // Fetch the latest calculated trend report from database
    let latestReport = await prisma.report.findFirst({
      where: { workspaceId, title: "Workspace Trend Detection" },
      orderBy: { createdAt: "desc" },
      select: { contentJson: true },
    });

    // If no trend report exists, calculate it on the fly from DB aggregates (no Gemini calls)
    if (!latestReport) {
      const generated = await triggerTrendAnalysis(workspaceId);
      latestReport = generated ? { contentJson: generated.contentJson } : null;
    }

    return NextResponse.json({
      success: true,
      data: latestReport ? latestReport.contentJson : { spikes: [] },
    });
  } catch (error) {
    console.error("Trends GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to load trend analysis." }, { status: 500 });
  }
}

export async function POST() {
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

    const latestReport = await triggerTrendAnalysis(user.workspaceId);

    return NextResponse.json({
      success: true,
      data: latestReport ? latestReport.contentJson : { spikes: [] },
      message: "Trend analysis generated and stored successfully.",
    });
  } catch (error) {
    console.error("Trends POST error:", error);
    return NextResponse.json({ success: false, message: "Failed to run trend analysis." }, { status: 500 });
  }
}
