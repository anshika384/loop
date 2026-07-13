import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validate input payload using schema
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.issues.map((issue) => issue.message).join(" ");
      return NextResponse.json(
        { success: false, message: errorMessage || "Validation failed." },
        { status: 400 }
      );
    }

    const { fullName, email, password, workspace } = result.data;

    // 2. Prevent duplicate registrations with the same email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email is already registered." },
        { status: 400 }
      );
    }

    // 3. Securely hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create workspace and admin user atomically in a database transaction
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Create the workspace
      const createdWorkspace = await tx.workspace.create({
        data: {
          name: workspace.trim(),
        },
      });

      // Create the user referencing the workspace, assigned as ADMIN role
      const createdUser = await tx.user.create({
        data: {
          name: fullName.trim(),
          email: email,
          passwordHash: hashedPassword,
          role: "ADMIN",
          workspaceId: createdWorkspace.id,
        },
      });

      // Log activity
      await tx.activity.create({
        data: {
          action: "User joined workspace",
          target: fullName.trim(),
          workspaceId: createdWorkspace.id,
        },
      });

      return { workspace: createdWorkspace, user: createdUser };
    });

    console.log("Account successfully created:", {
      userId: transactionResult.user.id,
      email: transactionResult.user.email,
      workspaceId: transactionResult.workspace.id,
    });

    const cookieStore = await cookies();
    cookieStore.set("session_token", transactionResult.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Redirecting to dashboard...",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration endpoint error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}