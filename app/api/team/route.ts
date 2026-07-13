import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { sendInvitationEmail } from "@/lib/email";

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

    // 1. Fetch active users in workspace
    const activeUsers = await prisma.user.findMany({
      where: { workspaceId: user.workspaceId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("===== PRISMA DEBUG =====");
    console.log("Prisma object:", prisma);
    console.log("User delegate:", prisma.user);
    console.log("Invitation delegate:", (prisma as any).invitation);
    console.log("========================");

    // 2. Fetch pending invitations in workspace
    const pendingInvites = await prisma.invitation.findMany({
      where: { workspaceId: user.workspaceId, accepted: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        expiresAt: true,
        token: true,
      },
    });

    // Map active users
    const activeMapped = activeUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: "Active" as const,
      createdAt: u.createdAt.toISOString(),
      lastActive: u.updatedAt ? u.updatedAt.toISOString() : null,
      isInvitation: false,
    }));

    // Map invitations
    const now = new Date();
    const invitesMapped = pendingInvites.map((i) => ({
      id: i.id,
      name: i.name,
      email: i.email,
      role: i.role,
      status: i.expiresAt < now ? ("Pending" as const) : ("Invited" as const),
      createdAt: i.createdAt.toISOString(),
      lastActive: null,
      isInvitation: true,
      token: i.token,
      expiresAt: i.expiresAt.toISOString(),
    }));

    const combinedList = [...activeMapped, ...invitesMapped];

    // Sorting: ADMIN first, then ANALYST, then VIEWER. Newest first within each role.
    const roleOrder = { ADMIN: 1, ANALYST: 2, VIEWER: 3 };
    const sortedTeam = combinedList.sort((a, b) => {
      const orderA = roleOrder[a.role] || 99;
      const orderB = roleOrder[b.role] || 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ success: true, data: sortedTeam });
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
      include: { workspace: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 401 });
    }

    console.log("===== ADMIN AUTHORIZATION CHECK =====");
    console.log({
      id: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
      role: user.role
    });
    console.log("=====================================");

    // Only ADMIN can invite team members
    if (user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Access Denied: Only workspace ADMINs can invite team members." }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, role } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, message: "Missing name or email." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate active user
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, message: "A user with this email is already registered." }, { status: 400 });
    }

    // Check duplicate pending invite
    const existingInvite = await prisma.invitation.findFirst({
      where: { email: cleanEmail, accepted: false, expiresAt: { gte: new Date() } },
    });

    if (existingInvite) {
      return NextResponse.json({ success: false, message: "An active invitation has already been sent to this email address." }, { status: 400 });
    }

    // Create 7-day secure token invitation
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const createdInvite = await prisma.invitation.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        role: role || "VIEWER",
        token,
        expiresAt,
        workspaceId: user.workspaceId,
      },
    });

    // Send email using Resend/development provider
    const emailResult = await sendInvitationEmail({
      to: cleanEmail,
      name: name.trim(),
      workspaceName: user.workspace.name,
      inviterName: user.name,
      role: role || "VIEWER",
      token,
    });

    const isDevelopment = emailResult.mode === "development";
    const emailSent = emailResult.success && emailResult.mode === "resend";

    return NextResponse.json({
      success: true,
      data: {
        id: createdInvite.id,
        name: createdInvite.name,
        email: createdInvite.email,
        role: createdInvite.role,
        status: "Invited",
        createdAt: createdInvite.createdAt.toISOString(),
        lastActive: null,
        isInvitation: true,
        token: token,
        expiresAt: expiresAt.toISOString(),
      },
      inviteUrl: emailResult.inviteUrl,
      emailSent,
      mode: emailResult.mode,
      emailError: emailResult.error || null,
      message: emailSent
        ? "Workspace invitation email sent successfully."
        : "Invitation generated. Email delivery skipped or failed (falling back to manual link).",
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

    console.log("===== ADMIN AUTHORIZATION CHECK =====");
    console.log({
      id: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
      role: user.role
    });
    console.log("=====================================");

    // Only ADMIN can change roles
    if (user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Access Denied: Only workspace ADMINs can change roles." }, { status: 403 });
    }

    const body = await req.json();
    const { targetUserId, role, isInvitation, action } = body;

    if (action === "regenerate") {
      const invitation = await prisma.invitation.findFirst({
        where: { id: targetUserId, workspaceId: user.workspaceId }
      });

      if (!invitation) {
        return NextResponse.json({ success: false, message: "Invitation not found." }, { status: 404 });
      }

      const newToken = crypto.randomUUID();
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const updated = await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          token: newToken,
          expiresAt: newExpiresAt,
          accepted: false,
        }
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const inviteUrl = `${appUrl}/invite?token=${newToken}`;

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          token: newToken,
          expiresAt: newExpiresAt.toISOString(),
          createdAt: updated.createdAt.toISOString(),
        },
        inviteUrl,
        message: "Invitation link regenerated successfully."
      });
    }

    if (!targetUserId || !role) {
      return NextResponse.json({ success: false, message: "Missing targetUserId or role." }, { status: 400 });
    }

    if (isInvitation) {
      // Verify invitation exists in this workspace
      const invitation = await prisma.invitation.findFirst({
        where: { id: targetUserId, workspaceId: user.workspaceId }
      });
      if (!invitation) {
        return NextResponse.json({ success: false, message: "Invitation not found in this workspace." }, { status: 404 });
      }

      // Modify role of a pending invitation using unique ID
      const updatedInvite = await prisma.invitation.update({
        where: { id: invitation.id },
        data: { role: role as any },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updatedInvite.id,
          name: updatedInvite.name,
          email: updatedInvite.email,
          role: updatedInvite.role,
        },
        message: "Teammate invite role updated successfully.",
      });
    }

    // Role adjustment for active user
    // Prevent changing own role (owner must remain admin)
    if (targetUserId === user.id) {
      return NextResponse.json({ success: false, message: "Access Denied: Workspace administrators cannot modify their own role." }, { status: 400 });
    }

    const targetUser = await prisma.user.findFirst({
      where: { id: targetUserId, workspaceId: user.workspaceId },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, message: "Teammate not found in workspace." }, { status: 404 });
    }

    // Prevent demoting the last Admin
    if (targetUser.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { workspaceId: user.workspaceId, role: "ADMIN" },
      });
      if (adminCount <= 1) {
        return NextResponse.json({ success: false, message: "Access Denied: Cannot demote the last ADMIN in this workspace. There must always be at least one administrator." }, { status: 400 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId, workspaceId: user.workspaceId },
      data: { role: role as any },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: "Role updated",
        target: `${updated.name} updated to ${role}`,
        workspaceId: user.workspaceId,
      },
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

    console.log("===== ADMIN AUTHORIZATION CHECK =====");
    console.log({
      id: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
      role: user.role
    });
    console.log("=====================================");

    // Only ADMIN can remove team members
    if (user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Access Denied: Only workspace ADMINs can remove members." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("targetUserId");
    const isInvitation = searchParams.get("isInvitation") === "true";

    if (!targetUserId) {
      return NextResponse.json({ success: false, message: "Missing targetUserId." }, { status: 400 });
    }

    if (isInvitation) {
      // Verify invitation exists in this workspace
      const invite = await prisma.invitation.findFirst({
        where: { id: targetUserId, workspaceId: user.workspaceId }
      });
      if (!invite) {
        return NextResponse.json({ success: false, message: "Invitation not found in this workspace." }, { status: 404 });
      }

      // Cancel/delete invitation
      await prisma.invitation.delete({
        where: { id: invite.id },
      });
      return NextResponse.json({ success: true, message: "Teammate invitation successfully cancelled." });
    }

    // Remove active user
    // Prevent deleting self
    if (targetUserId === user.id) {
      return NextResponse.json({ success: false, message: "Access Denied: Workspace administrators cannot delete themselves." }, { status: 400 });
    }

    const targetUser = await prisma.user.findFirst({
      where: { id: targetUserId, workspaceId: user.workspaceId },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, message: "Teammate not found in workspace." }, { status: 404 });
    }

    // Prevent deleting the last Admin
    if (targetUser.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { workspaceId: user.workspaceId, role: "ADMIN" },
      });
      if (adminCount <= 1) {
        return NextResponse.json({ success: false, message: "Access Denied: Cannot remove the last ADMIN in this workspace. There must always be at least one administrator." }, { status: 400 });
      }
    }

    await prisma.user.delete({
      where: { id: targetUser.id },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: "Teammate removed",
        target: targetUser.name,
        workspaceId: user.workspaceId,
      },
    });

    return NextResponse.json({ success: true, message: "Teammate successfully removed from workspace." });
  } catch (error) {
    console.error("Team DELETE error:", error);
    return NextResponse.json({ success: false, message: "Failed to remove teammate." }, { status: 500 });
  }
}
