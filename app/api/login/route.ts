import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validate payload inputs
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.issues.map((issue) => issue.message).join(" ");
      return NextResponse.json(
        { success: false, message: errorMessage || "Validation failed." },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // 2. Query user by normalized email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Use generic error message to prevent account enumeration
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 3. Verify standard hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    console.log("User successfully validated:", {
      userId: user.id,
      email: user.email,
      workspaceId: user.workspaceId,
    });

    const cookieStore = await cookies();
    cookieStore.set("session_token", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Login successful. Redirecting...",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login endpoint error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
