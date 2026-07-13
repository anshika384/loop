import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ success: false, message: "Missing invitation token." }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { workspace: true },
    });

    if (!invitation) {
      return NextResponse.json({ success: false, message: "Invitation token is invalid." }, { status: 404 });
    }

    if (invitation.accepted) {
      return NextResponse.json({ success: false, message: "This invitation has already been accepted." }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ success: false, message: "This invitation has expired." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        name: invitation.name,
        email: invitation.email,
        role: invitation.role,
        workspaceName: invitation.workspace.name,
      },
    });
  } catch (error) {
    console.error("Invite validate GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to validate invitation." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, name, password } = body;

    if (!token || !name || !password) {
      return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, message: "Password must be at least 8 characters long." }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json({ success: false, message: "Invitation token is invalid." }, { status: 404 });
    }

    if (invitation.accepted) {
      return NextResponse.json({ success: false, message: "This invitation has already been accepted." }, { status: 400 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ success: false, message: "This invitation has expired." }, { status: 400 });
    }

    // Verify email duplicate user
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, message: "A user with this email address has already registered." }, { status: 400 });
    }

    // Hash password and complete transaction
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const createdUser = await tx.user.create({
        data: {
          name: name.trim(),
          email: invitation.email,
          passwordHash: hashedPassword,
          role: invitation.role,
          workspaceId: invitation.workspaceId,
        },
      });

      // Mark invitation accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { accepted: true },
      });

      // Log activity
      await tx.activity.create({
        data: {
          action: "User joined workspace",
          target: name.trim(),
          workspaceId: invitation.workspaceId,
        },
      });

      return createdUser;
    });

    // Sign in the user automatically
    const cookieStore = await cookies();
    cookieStore.set("session_token", result.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Invitation accepted. Redirecting to dashboard...",
    });
  } catch (error) {
    console.error("Invite accept POST error:", error);
    return NextResponse.json({ success: false, message: "Failed to accept invitation." }, { status: 500 });
  }
}
