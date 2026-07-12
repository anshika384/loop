import { Resend } from "resend";
import nodemailer from "nodemailer";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  console.log("--------------------------------------------------");
  console.log("✉️  Loading Email Service Settings (Dynamic)...");
  console.log(`- RESEND_API_KEY: ${resendApiKey ? "Configured (Present)" : "MISSING"}`);
  console.log(`- EMAIL_FROM: ${emailFrom || "onboarding@resend.dev (Fallback)"}`);
  console.log("--------------------------------------------------");

  // 1. If Resend client is configured, call resend.emails.send()
  if (resendApiKey) {
    const resend = new Resend(resendApiKey);
    console.log(`[Email Service] Calling resend.emails.send() to send email to: ${to}...`);
    try {
      const response = await resend.emails.send({
        from: emailFrom || "onboarding@resend.dev",
        to,
        subject,
        html,
      });

      console.log("[Email Service] Resend API Response:", response);

      if (response.error) {
        throw new Error(`Resend API Error: ${response.error.message} (${response.error.name})`);
      }

      console.log(`[Email Service] Reset link email sent successfully via Resend to: ${to}`);
      return;
    } catch (resendError: any) {
      console.error(`[Email Service] Resend API call failed for ${to}:`, resendError);
      throw resendError;
    }
  }

  // 2. If SMTP is configured, send email via Nodemailer SMTP
  if (process.env.SMTP_HOST) {
    console.log(`[Email Service] Using Nodemailer SMTP to send email to: ${to}...`);
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: emailFrom || '"LOOP" <no-reply@loop-feedback.com>',
        to,
        subject,
        html,
      });

      console.log(`[Email Service] Reset link email sent successfully via SMTP to: ${to}`);
      return;
    } catch (smtpError) {
      console.error(`[Email Service] SMTP send failed for ${to}:`, smtpError);
      throw smtpError;
    }
  }

  const errMessage = "[Email Service] Neither RESEND_API_KEY nor SMTP_HOST is configured. Email skipped.";
  console.error(errMessage);
  throw new Error(errMessage);
}

export async function sendResetPasswordEmail(email: string, token: string, appUrl?: string) {
  const finalAppUrl = appUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${finalAppUrl}/reset-password?token=${token}`;
  const year = new Date().getFullYear();

  // Print to server console for local testing and debugging visibility
  console.log("\n==================================================");
  console.log("🔑 PASSWORD RESET LINK GENERATED:");
  console.log(`Recipient: ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log("==================================================\n");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your LOOP Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f8fafc;
      color: #334155;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 570px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    }
    .header {
      padding: 30px 40px;
      text-align: center;
      border-bottom: 1px solid #f1f5f9;
      background-color: #ffffff;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.05em;
      color: #1e293b;
      margin: 0;
      text-decoration: none;
    }
    .content {
      padding: 40px;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .btn-container {
      text-align: center;
      margin-bottom: 28px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 15px;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
    }
    .link-fallback {
      font-size: 12px;
      color: #64748b;
      word-break: break-all;
      background-color: #f1f5f9;
      padding: 12px;
      border-radius: 8px;
      margin-top: 10px;
    }
    .footer {
      padding: 30px 40px;
      background-color: #f8fafc;
      border-top: 1px solid #f1f5f9;
      text-align: center;
      font-size: 13px;
      color: #64748b;
    }
    .divider {
      margin: 24px 0;
      border: 0;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="${appUrl}" class="logo" target="_blank" style="text-decoration: none;">
          <span style="color: #2563eb;">L</span><span style="color: #7c3aed;">O</span>OP
        </a>
      </div>
      <div class="content">
        <h1>Password Reset Request</h1>
        <p>Hello,</p>
        <p>We received a request to reset your password for your LOOP account. Click the button below to choose a new password. This reset link is only valid for <strong>1 hour</strong>.</p>
        
        <div class="btn-container">
          <a href="${resetUrl}" class="btn" target="_blank" style="color: #ffffff;">Reset Password</a>
        </div>
        
        <p>If the button above does not work, copy and paste this URL into your browser:</p>
        <div class="link-fallback">
          <a href="${resetUrl}" target="_blank" style="color: #2563eb; text-decoration: none;">${resetUrl}</a>
        </div>
        
        <hr class="divider">
        
        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
          If you did not request a password reset, you can safely ignore this email. Your password will remain secure and unchanged.
        </p>
      </div>
      <div class="footer">
        <p style="margin: 0;">&copy; ${year} LOOP. All rights reserved.</p>
        <p style="margin: 8px 0 0 0;">AI Customer Feedback Intelligence Platform</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await sendEmail({
    to: email,
    subject: "Reset your LOOP Password",
    html,
  });
}
