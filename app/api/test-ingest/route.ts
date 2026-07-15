import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { bulkImport } from "@/lib/feedback-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "admin_gemini_test4@gmail.com";

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const rows = [
      { content: "Payment failed during checkout", channel: "Website", customerLabel: "Customer A", sourceRef: "WEB001" },
      { content: "App crashes after login", channel: "Google Play", customerLabel: "Customer B", sourceRef: "APP002" },
      { content: "Love the new dashboard UI", channel: "Twitter", customerLabel: "Customer C", sourceRef: "TW003" },
      { content: "Invoice download is not working", channel: "Intercom", customerLabel: "Customer D", sourceRef: "INT004" },
      { content: "Need dark mode support", channel: "App Store", customerLabel: "Customer E", sourceRef: "APP005" }
    ];

    const result = await bulkImport(rows, user.workspaceId);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
