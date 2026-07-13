import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";
import { sendResetPasswordEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validate the payload using forgotPasswordSchema
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.issues.map((issue) => issue.message).join(" ");
      return NextResponse.json(
        { success: false, message: errorMessage || "Validation failed." },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // 2. Query user by normalized email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 3. For security, do not expose whether the email is registered
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json(
        {
          success: true,
          message: "If an account exists, a password reset link will be sent.",
        },
        { status: 200 }
      );
    }

    // 4. Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");

    // 5. Hash the token before storing to database (SHA-256)
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 6. Set token expiry time (1 hour from now)
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

    // 7. Save hashed token and expiry to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpires: expiryDate,
      },
    });

    console.log(`Password reset token generated and saved for user: ${email}`);

    // 8. Resolve appUrl dynamically from the request headers (to match whatever port/domain is used)
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    let appUrl = origin;
    if (!appUrl && referer) {
      try {
        const refUrl = new URL(referer);
        appUrl = refUrl.origin;
      } catch (e) {
        // ignore
      }
    }
    if (!appUrl) {
      appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    }

    const provider = process.env.EMAIL_PROVIDER || "development";
    let emailSent = false;
    let emailError: string | null = null;
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    if (provider === "resend") {
      try {
        await sendResetPasswordEmail(email, token, appUrl);
        console.log(`Reset password email sent successfully to: ${email} with base URL: ${appUrl}`);
        emailSent = true;
      } catch (mailError: any) {
        console.error(`Failed to send password reset email to ${email}:`, mailError);
        emailError = mailError.message || "Resend API failure";
      }
    } else {
      emailError = "Development Mode: Email delivery is disabled.";
      console.log("\n==================================================");
      console.log("🔑 PASSWORD RESET LINK GENERATED (DEV MODE):");
      console.log(`Recipient: ${email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log("==================================================\n");
    }

    return NextResponse.json(
      {
        success: true,
        emailSent,
        resetUrl,
        mode: provider,
        emailError,
        message: emailSent
          ? "Password reset email sent successfully."
          : "Password reset link generated in development/fallback mode.",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot password endpoint error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
