import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validation";

// GET /api/reset-password?token=...
// Used to validate the token on page load
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Reset token is required." },
        { status: 400 }
      );
    }

    // 1. Hash the token from the URL to check against the database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2. Look up the user with this token that hasn't expired yet
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired password reset link." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Token is valid." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Reset password validation error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// POST /api/reset-password
// Performs the actual password reset
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password, confirmPassword } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Reset token is required." },
        { status: 400 }
      );
    }

    // 1. Validate inputs (Zod schema checks matching passwords and minimum 8 characters)
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const errorMessage = result.error.issues.map((issue) => issue.message).join(" ");
      return NextResponse.json(
        { success: false, message: errorMessage || "Validation failed." },
        { status: 400 }
      );
    }

    // 2. Hash token to locate the correct user
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 3. Find the user with a valid, non-expired token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "The reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    // 4. Hash the new password using bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. Update user password and invalidate the token (one-time use check)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    console.log(`Password successfully reset for user ID: ${user.id}`);

    return NextResponse.json(
      { success: true, message: "Password updated successfully. Please login." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Reset password execution error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
