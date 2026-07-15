import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    // Authenticate user
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

    // Retrieve report
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        workspace: true,
        generatedBy: { select: { name: true } }
      }
    });

    if (!report || report.workspaceId !== user.workspaceId) {
      return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 });
    }

    const rawContent = report.contentJson as any;
    const content = typeof rawContent === "string" ? JSON.parse(rawContent) : (rawContent || {});

    // Compute live workspace sentiment statistics
    const [totalFeedback, posCount, negCount, neuCount] = await Promise.all([
      prisma.feedback.count({ where: { workspaceId: report.workspaceId } }),
      prisma.feedback.count({ where: { workspaceId: report.workspaceId, sentiment: "POS" } }),
      prisma.feedback.count({ where: { workspaceId: report.workspaceId, sentiment: "NEG" } }),
      prisma.feedback.count({ where: { workspaceId: report.workspaceId, sentiment: "NEU" } })
    ]);

    const csat = content.csat || (totalFeedback > 0 ? ((posCount / totalFeedback) * 100).toFixed(1) + "%" : "85.0%");
    const topThemes = content.topThemes || [];
    const recommendations = content.recommendations || [];
    const customerQuotes = content.customerQuotes || [];

    // Helper to safely format CSV values (escape quotes and wrap in quotes)
    const escapeCsv = (val: any) => {
      if (val === undefined || val === null) return '""';
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    // Construct CSV content
    const rows = [
      ["Metric", "Value"],
      ["Report Title", report.title],
      ["Workspace", report.workspace.name],
      ["Generated Date", new Date(report.createdAt).toLocaleDateString()],
      ["CSAT Index", csat],
      ["Total Feedback Processed", totalFeedback],
      ["Positive Feedback count", posCount],
      ["Neutral Feedback count", neuCount],
      ["Negative Feedback count", negCount],
      ["Top Themes", topThemes.join(" | ")],
      ["AI Recommendations", recommendations.join(" | ")],
      ["Representative Customer Quotes", customerQuotes.join(" | ")]
    ];

    const csvContent = rows
      .map(row => row.map(cell => escapeCsv(cell)).join(","))
      .join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="voice-of-customer-report-${id.slice(0, 5)}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("CSV Export error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to export CSV report." },
      { status: 500 }
    );
  }
}
