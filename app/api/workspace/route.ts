import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

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

    // Only ADMIN can modify workspace settings
    if (user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Access Denied: Only workspace ADMINs can update settings." }, { status: 403 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ success: false, message: "Workspace name cannot be empty." }, { status: 400 });
    }

    const updated = await prisma.workspace.update({
      where: { id: user.workspaceId },
      data: { name: name.trim() },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Workspace preferences updated successfully.",
    });
  } catch (error) {
    console.error("Workspace PUT error:", error);
    return NextResponse.json({ success: false, message: "Failed to update workspace details." }, { status: 500 });
  }
}
