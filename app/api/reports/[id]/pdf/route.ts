import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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

    // Initialize PDF Document
    const pdfDoc = await PDFDocument.create();
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 54;
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = 730;

    const addPageIfNeeded = (neededHeight: number) => {
      if (y - neededHeight < 60) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = 730;
        
        // Draw pagination line
        page.drawLine({
          start: { x: margin, y: 750 },
          end: { x: pageWidth - margin, y: 750 },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
      }
    };

    const drawTextWrapped = (
      text: string,
      fontSize: number,
      font: any,
      color: any,
      spacing = 4,
      bold = false
    ) => {
      const words = text.split(" ");
      let currentLine = "";
      const maxTextWidth = pageWidth - 2 * margin;

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width > maxTextWidth) {
          addPageIfNeeded(fontSize + spacing);
          page.drawText(currentLine, {
            x: margin,
            y,
            size: fontSize,
            font,
            color,
          });
          y -= (fontSize + spacing);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        addPageIfNeeded(fontSize + spacing + 4);
        page.drawText(currentLine, {
          x: margin,
          y,
          size: fontSize,
          font,
          color,
        });
        y -= (fontSize + spacing + 6);
      }
    };

    // 1. Draw PDF Header with LOOP Logo
    // Stylized Logo Icon
    page.drawRectangle({
      x: margin,
      y: y - 10,
      width: 48,
      height: 22,
      color: rgb(0.06, 0.09, 0.16), // Dark Slate
    });
    page.drawText("LOOP", {
      x: margin + 9,
      y: y - 2,
      size: 11,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // Subtitle Workspace
    page.drawText(`${report.workspace.name.toUpperCase()} • CUSTOMER INTELLIGENCE`, {
      x: margin + 60,
      y: y + 2,
      size: 8,
      font: fontBold,
      color: rgb(0.4, 0.45, 0.55),
    });

    page.drawText(`Generated on ${new Date(report.createdAt).toLocaleDateString()}`, {
      x: pageWidth - margin - 120,
      y: y + 2,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

    y -= 30;

    // Report Title
    page.drawText(report.title, {
      x: margin,
      y,
      size: 18,
      font: fontBold,
      color: rgb(0.06, 0.09, 0.16),
    });
    y -= 12;

    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 1.5,
      color: rgb(0.06, 0.09, 0.16),
    });
    y -= 25;

    // 2. Executive Summary
    if (content.executiveSummary) {
      addPageIfNeeded(45);
      page.drawText("EXECUTIVE SUMMARY", {
        x: margin,
        y,
        size: 10,
        font: fontBold,
        color: rgb(0.3, 0.35, 0.45),
      });
      y -= 14;
      drawTextWrapped(content.executiveSummary, 9.5, fontRegular, rgb(0.2, 0.2, 0.2));
      y -= 10;
    }

    // 3. Stats Overview Cards
    addPageIfNeeded(65);
    // Draw CSAT box
    page.drawRectangle({
      x: margin,
      y: y - 45,
      width: 240,
      height: 45,
      color: rgb(0.96, 0.98, 0.96),
      borderColor: rgb(0.85, 0.92, 0.85),
      borderWidth: 1,
    });
    page.drawText("CSAT INDEX SCORE", {
      x: margin + 12,
      y: y - 16,
      size: 7,
      font: fontBold,
      color: rgb(0.3, 0.5, 0.3),
    });
    page.drawText(csat, {
      x: margin + 12,
      y: y - 36,
      size: 16,
      font: fontBold,
      color: rgb(0.1, 0.5, 0.1),
    });

    // Draw total processed box
    page.drawRectangle({
      x: margin + 260,
      y: y - 45,
      width: 240,
      height: 45,
      color: rgb(0.96, 0.96, 0.98),
      borderColor: rgb(0.88, 0.88, 0.93),
      borderWidth: 1,
    });
    page.drawText("FEEDBACK ITEMS INDEXED", {
      x: margin + 272,
      y: y - 16,
      size: 7,
      font: fontBold,
      color: rgb(0.3, 0.3, 0.5),
    });
    page.drawText(`${totalFeedback} items`, {
      x: margin + 272,
      y: y - 36,
      size: 16,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.3),
    });

    y -= 65;

    // 4. Sentiment Details
    addPageIfNeeded(30);
    page.drawText("SENTIMENT DISTRIBUTION ANALYSIS", {
      x: margin,
      y,
      size: 10,
      font: fontBold,
      color: rgb(0.3, 0.35, 0.45),
    });
    y -= 14;

    const sentimentStr = `Positive Feedback: ${posCount} items (${totalFeedback > 0 ? ((posCount / totalFeedback) * 100).toFixed(1) : 0}%)   |   Neutral: ${neuCount} items (${totalFeedback > 0 ? ((neuCount / totalFeedback) * 100).toFixed(1) : 0}%)   |   Negative: ${negCount} items (${totalFeedback > 0 ? ((negCount / totalFeedback) * 100).toFixed(1) : 0}%)`;
    page.drawText(sentimentStr, {
      x: margin,
      y,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 25;

    // 5. Top Themes
    const topThemes = content.topThemes || [];
    if (topThemes.length > 0) {
      addPageIfNeeded(40);
      page.drawText("PRIMARY VOICE THEMES MAP", {
        x: margin,
        y,
        size: 10,
        font: fontBold,
        color: rgb(0.3, 0.35, 0.45),
      });
      y -= 14;

      page.drawText(`Top Categories: ${topThemes.join(", ")}`, {
        x: margin,
        y,
        size: 9.5,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 25;
    }

    // 6. AI Recommendations
    const recommendations = content.recommendations || [];
    if (recommendations.length > 0) {
      addPageIfNeeded(40);
      page.drawText("CORE STRATEGIC RECOMMENDATIONS", {
        x: margin,
        y,
        size: 10,
        font: fontBold,
        color: rgb(0.3, 0.35, 0.45),
      });
      y -= 14;

      for (const rec of recommendations) {
        addPageIfNeeded(18);
        page.drawText("• ", { x: margin, y, size: 10, font: fontBold, color: rgb(0.06, 0.09, 0.16) });
        page.drawText(rec, { x: margin + 12, y, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
        y -= 14;
      }
      y -= 12;
    }

    // 7. Priority Actions
    const priorityActions = content.priorityActions || [];
    if (priorityActions.length > 0) {
      addPageIfNeeded(40);
      page.drawText("IMMEDIATE ACTION PLAN", {
        x: margin,
        y,
        size: 10,
        font: fontBold,
        color: rgb(0.3, 0.35, 0.45),
      });
      y -= 14;

      for (const act of priorityActions) {
        addPageIfNeeded(18);
        page.drawText("[x] ", { x: margin, y, size: 9, font: fontBold, color: rgb(0.1, 0.5, 0.1) });
        page.drawText(act, { x: margin + 22, y, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
        y -= 14;
      }
      y -= 12;
    }

    // 8. Key Business Risks
    const businessRisks = content.businessRisks || [];
    if (businessRisks.length > 0) {
      addPageIfNeeded(40);
      page.drawText("KEY BUSINESS RISKS IDENTIFIED", {
        x: margin,
        y,
        size: 10,
        font: fontBold,
        color: rgb(0.7, 0.1, 0.1),
      });
      y -= 14;

      for (const risk of businessRisks) {
        addPageIfNeeded(18);
        page.drawText("[!] ", { x: margin, y, size: 9, font: fontBold, color: rgb(0.7, 0.1, 0.1) });
        page.drawText(risk, { x: margin + 22, y, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
        y -= 14;
      }
      y -= 12;
    }

    // 9. Customer Quotes
    const customerQuotes = content.customerQuotes || [];
    if (customerQuotes.length > 0) {
      addPageIfNeeded(40);
      page.drawText("REPRESENTATIVE CUSTOMER VERBATIMS", {
        x: margin,
        y,
        size: 10,
        font: fontBold,
        color: rgb(0.3, 0.35, 0.45),
      });
      y -= 14;

      for (const quote of customerQuotes) {
        addPageIfNeeded(24);
        drawTextWrapped(`"${quote}"`, 9, fontItalic, rgb(0.3, 0.3, 0.45));
        y -= 4;
      }
    }

    // Output PDF Buffer
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="voice-of-customer-report-${id.slice(0, 5)}.pdf"`,
        "Content-Length": String(pdfBytes.length),
      },
    });
  } catch (error: any) {
    console.error("PDF Export error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to export PDF report." },
      { status: 500 }
    );
  }
}
