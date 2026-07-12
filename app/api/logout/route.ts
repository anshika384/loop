import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session_token");

    return NextResponse.json(
      { success: true, message: "Logged out successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to log out." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session_token");
  } catch (error) {
    console.error("Logout GET error:", error);
  }
  const redirectTo = req.nextUrl.searchParams.get("redirect") || "/login";
  return NextResponse.redirect(new URL(redirectTo, req.url));
}

