import { Resend } from "resend";

export async function sendInvitationEmail({
  to,
  name,
  workspaceName,
  inviterName,
  role,
  token,
}: {
  to: string;
  name: string;
  workspaceName: string;
  inviterName: string;
  role: string;
  token: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite?token=${token}`;
  const provider = process.env.EMAIL_PROVIDER || "development";

  // 1. Log function entry and input parameters
  console.log("\n==================================================");
  console.log("✉️  [sendInvitationEmail] Function Entered");
  console.log(`- Recipient Email: ${to}`);
  console.log(`- Workspace Name: ${workspaceName}`);
  console.log(`- Inviter Name: ${inviterName}`);
  console.log(`- Assigned Role: ${role}`);
  console.log(`- Generated Invitation Token: ${token}`);
  console.log(`- Generated Invitation URL: ${inviteUrl}`);
  console.log(`- EMAIL_PROVIDER Configured: ${provider}`);
  console.log(`- RESEND_API_KEY Loaded: ${apiKey ? "Configured (Present)" : "MISSING"}`);
  console.log(`- EMAIL_FROM Loaded: ${fromEmail}`);
  console.log("==================================================\n");

  // 2. Short-circuit if EMAIL_PROVIDER is set to development
  if (provider !== "resend") {
    console.log("[sendInvitationEmail] Development Mode is enabled. Bypassing email dispatch.");
    return { success: true, mode: "development", inviteUrl };
  }

  // 3. Resend Mode - Validate configurations
  if (!apiKey) {
    const errorMsg = "RESEND_API_KEY is not configured in .env file.";
    console.error(`[sendInvitationEmail ERROR] ${errorMsg}`);
    return { success: false, mode: "resend", error: errorMsg, inviteUrl };
  }

  // 4. Initialize Resend client dynamically at request time
  let resend: Resend;
  try {
    resend = new Resend(apiKey);
    console.log("[sendInvitationEmail] Resend client initialized successfully.");
  } catch (initErr: any) {
    console.error("[sendInvitationEmail ERROR] Resend initialization failed:", initErr);
    return { success: false, mode: "resend", error: `Failed to initialize Resend client: ${initErr.message}`, inviteUrl };
  }

  // 5. Construct HTML email body
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; padding: 40px 20px; color: #1E293B;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden;">
        
        <!-- Header -->
        <div style="background-color: #0F172A; padding: 32px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">LOOP</h1>
          <p style="color: #38BDF8; margin: 4px 0 0 0; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">AI Customer Feedback Intelligence</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 40px; text-align: left;">
          <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0 0 16px 0;">You've been invited!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
            Hi <strong>${name}</strong>,
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
            <strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace on LOOP as a <strong>${role}</strong>.
          </p>

          <!-- Call to Action -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteUrl}" target="_blank" style="background-color: #2563EB; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 32px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2); transition: all 0.2s;">
              Accept Invitation
            </a>
          </div>

          <p style="font-size: 12px; line-height: 1.5; color: #64748B; margin: 24px 0 0 0; padding-top: 16px; border-top: 1px solid #F1F5F9;">
            This invitation was sent to ${to} and will expire in <strong>7 days</strong>. If you did not expect this invitation, you can safely ignore this email.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #F8FAFC; padding: 20px 40px; text-align: center; border-top: 1px solid #E2E8F0;">
          <p style="font-size: 11px; color: #94A3B8; margin: 0;">
            &copy; 2026 LOOP Inc. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  `;

  // 6. Call Resend API with detailed logs
  console.log(`[sendInvitationEmail] Before calling resend.emails.send() to: ${to}`);
  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `Join ${workspaceName} on LOOP`,
      html,
    });

    console.log("[sendInvitationEmail] Response returned by resend.emails.send():", JSON.stringify(response, null, 2));

    const { data, error } = response;
    
    // Log additional properties requested by user
    console.log("----------------------- Resend Logs -----------------------");
    console.log("- data:", data);
    console.log("- error:", error);
    if (data) {
      console.log("- message id:", data.id);
      console.log("- delivery status: SENT (Pending gateway dispatch)");
    }
    console.log("-----------------------------------------------------------");

    if (error) {
      console.error("[sendInvitationEmail ERROR] Resend failed to send:", error);
      return { success: false, mode: "resend", error: error.message || "Unknown Resend error", inviteUrl };
    }

    return { success: true, mode: "resend", inviteUrl, data };
  } catch (err: any) {
    console.error("[sendInvitationEmail ERROR] Exception thrown in Resend send:", err);
    return { success: false, mode: "resend", error: err.message || "Connection failure / SMTP error", inviteUrl };
  }
}
