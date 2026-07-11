import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

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

    const workspaceId = user.workspaceId;

    // Check if feedback already exists in this workspace
    const existingFeedback = await prisma.feedback.findFirst({
      where: { workspaceId },
    });

    if (existingFeedback) {
      return NextResponse.json({ success: true, message: "Workspace already seeded." });
    }

    // Seed themes
    const billingTheme = await prisma.theme.create({
      data: {
        name: "Payment Failures & Currency",
        description: "Issues related to checkout processes, Stripe errors, and missing currencies.",
        color: "#EF4444",
        workspaceId,
      },
    });

    const speedTheme = await prisma.theme.create({
      data: {
        name: "Performance & Latency",
        description: "Slow loading states, image lagging, page latency, and system timeouts.",
        color: "#F59E0B",
        workspaceId,
      },
    });

    const uiTheme = await prisma.theme.create({
      data: {
        name: "UI Layout & Styling",
        description: "Feedback about drag-and-drop builders, layout preferences, and dark mode suggestions.",
        color: "#10B981",
        workspaceId,
      },
    });

    // Seed feedback items
    const feedbackItems = [
      { content: "The billing section timed out twice when I tried processing my invoice payment.", channel: "Zendesk", sentiment: "NEG", sentimentScore: 0.12, status: "NEW", themeId: billingTheme.id },
      { content: "Amazing drag & drop builder! Cuts our feedback collection design time in half.", channel: "App Store", sentiment: "POS", sentimentScore: 0.94, status: "REVIEWED", themeId: uiTheme.id },
      { content: "Android Stripe errors are blocking checkout, getting error code 402.", channel: "Zendesk", sentiment: "NEG", sentimentScore: 0.08, status: "NEW", themeId: billingTheme.id },
      { content: "Could you add a dark mode toggle option to the profile settings tab?", channel: "Twitter", sentiment: "NEU", sentimentScore: 0.52, status: "NEW", themeId: uiTheme.id },
      { content: "Safari browser lags significantly when exporting weekly charts to PDF format.", channel: "Intercom", sentiment: "NEG", sentimentScore: 0.22, status: "NEW", themeId: speedTheme.id },
      { content: "Customer support was super quick, issue resolved in 5 mins!", channel: "Slack", sentiment: "POS", sentimentScore: 0.96, status: "ACTIONED" },
      { content: "My receipt for checkout didn't deliver to my billing email inbox.", channel: "Hubspot", sentiment: "NEU", sentimentScore: 0.48, status: "REVIEWED", themeId: billingTheme.id },
      { content: "Exporting summaries sometimes throws 504 gateway timeout, takes 15 seconds.", channel: "Intercom", sentiment: "NEG", sentimentScore: 0.18, status: "NEW", themeId: speedTheme.id },
      { content: "The dashboard design looks premium, but charts load slowly on slow networks.", channel: "App Store", sentiment: "NEU", sentimentScore: 0.45, status: "REVIEWED", themeId: speedTheme.id },
      { content: "Loving the new feedback widgets! They integrate seamlessly with our site.", channel: "App Store", sentiment: "POS", sentimentScore: 0.92, status: "ACTIONED" },
      { content: "Need support for billing in Euros (€) and British Pounds (£) for regional checkout.", channel: "Hubspot", sentiment: "NEU", sentimentScore: 0.55, status: "NEW", themeId: billingTheme.id },
      { content: "Invoice downloads fail entirely when I click the export report button.", channel: "Intercom", sentiment: "NEG", sentimentScore: 0.14, status: "NEW", themeId: billingTheme.id },
      { content: "The analytics layout is very intuitive. Recharts fit the grid beautifully.", channel: "Twitter", sentiment: "POS", sentimentScore: 0.88, status: "REVIEWED", themeId: uiTheme.id },
      { content: "Dark mode layout lacks contrast in sidebar settings menu.", channel: "Twitter", sentiment: "NEU", sentimentScore: 0.42, status: "NEW", themeId: uiTheme.id },
      { content: "Image upload latency is very high, takes 8 seconds for a 2MB png.", channel: "Zendesk", sentiment: "NEG", sentimentScore: 0.25, status: "NEW", themeId: speedTheme.id },
    ];

    for (const item of feedbackItems) {
      const createdFeedback = await prisma.feedback.create({
        data: {
          content: item.content,
          channel: item.channel,
          sentiment: item.sentiment as any,
          sentimentScore: item.sentimentScore,
          status: item.status as any,
          workspaceId,
        },
      });

      if (item.themeId) {
        await prisma.feedbackTheme.create({
          data: {
            feedbackId: createdFeedback.id,
            themeId: item.themeId,
            confidence: 0.95,
          },
        });
      }
    }

    // Seed sample report
    await prisma.report.create({
      data: {
        title: "Weekly Feedback Summary & Recommendations",
        periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(),
        contentJson: {
          csat: "89.4%",
          recommendations: [
            "Optimize Stripe transaction timeouts (timeouts exceed 5 seconds in 52% of checkout failures).",
            "Address Safari rendering lag on invoice export actions.",
            "Implement Euros (€) and GBP (£) currency supports in checkout forms.",
          ],
        },
        workspaceId,
        generatedById: user.id,
      },
    });

    // Seed mock team members if not already present
    const mockAnalystEmail = `analyst_${workspaceId.slice(0, 4)}@gmail.com`;
    const mockViewerEmail = `viewer_${workspaceId.slice(0, 4)}@gmail.com`;

    const existingAnalyst = await prisma.user.findUnique({ where: { email: mockAnalystEmail } });
    if (!existingAnalyst) {
      await prisma.user.create({
        data: {
          name: "Sarah Jenkins",
          email: mockAnalystEmail,
          passwordHash: user.passwordHash,
          role: "ANALYST",
          workspaceId,
        },
      });
    }

    const existingViewer = await prisma.user.findUnique({ where: { email: mockViewerEmail } });
    if (!existingViewer) {
      await prisma.user.create({
        data: {
          name: "David Miller",
          email: mockViewerEmail,
          passwordHash: user.passwordHash,
          role: "VIEWER",
          workspaceId,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Demo data successfully seeded." });
  } catch (error) {
    console.error("Demo seeding error:", error);
    return NextResponse.json({ success: false, message: "Failed to seed demo data." }, { status: 500 });
  }
}
