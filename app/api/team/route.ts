import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

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

    const team = await prisma.user.findMany({
      where: { workspaceId: user.workspaceId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ success: true, data: team });
  } catch (error) {
    console.error("Team GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to load team list." }, { status: 500 });
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

    // Only ADMIN can invite team members
    if (user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Access Denied: Only workspace ADMINs can invite team members." }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, message: "Missing name or email." }, { status: 400 });
    }

    // Check duplicate
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ success: false, message: "A user with this email is already registered." }, { status: 400 });
    }

    // Hash a placeholder password since they are being invited
    const hashedPassword = await bcrypt.hash("TempPassword123!", 10);

    const created = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: role || "VIEWER", // Default role is VIEWER as per workspace rules
        workspaceId: user.workspaceId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        createdAt: created.createdAt,
      },
      message: "Teammate successfully invited.",
    }, { status: 201 });
  } catch (error) {
    console.error("Team POST error:", error);
    return NextResponse.json({ success: false, message: "Failed to invite teammate." }, { status: 500 });
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

    // Only ADMIN can change roles or modify team settings
    if (user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Access Denied: Only workspace ADMINs can change roles." }, { status: 403 });
    }

    const body = await req.json();
    const { targetUserId, role } = body;

    if (!targetUserId || !role) {
      return NextResponse.json({ success: false, message: "Missing targetUserId or role." }, { status: 400 });
    }

    // Prevent changing own role (owner must remain admin)
    if (targetUserId === user.id) {
      return NextResponse.json({ success: false, message: "Access Denied: Workspace owners cannot change their own role." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId, workspaceId: user.workspaceId },
      data: { role: role as any },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
      message: "Teammate role updated successfully.",
    });
  } catch (error) {
    console.error("Team PUT error:", error);
    return NextResponse.json({ success: false, message: "Failed to update user role." }, { status: 500 });
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

    // Only ADMIN can remove team members
    if (user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Access Denied: Only workspace ADMINs can remove members." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("targetUserId");

    if (!targetUserId) {
      return NextResponse.json({ success: false, message: "Missing targetUserId." }, { status: 400 });
    }

    // Prevent deleting self
    if (targetUserId === user.id) {
      return NextResponse.json({ success: false, message: "Access Denied: Workspace owners cannot delete themselves." }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: targetUserId, workspaceId: user.workspaceId },
    });

    return NextResponse.json({ success: true, message: "Teammate successfully removed from workspace." });
  } catch (error) {
    console.error("Team DELETE error:", error);
    return NextResponse.json({ success: false, message: "Failed to remove teammate." }, { status: 500 });
  }
}
