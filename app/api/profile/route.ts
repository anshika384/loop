import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

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

    const body = await req.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, message: "Name and email are required." }, { status: 400 });
    }

    // Check email format
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
      return NextResponse.json({ success: false, message: "Email must be a valid Gmail address (example@gmail.com)." }, { status: 400 });
    }

    // Check duplicate email (if changed)
    if (email !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email },
      });
      if (existing) {
        return NextResponse.json({ success: false, message: "Email is already taken by another user." }, { status: 400 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        name: updated.name,
        email: updated.email,
      },
      message: "Profile details updated successfully.",
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ success: false, message: "Failed to update profile." }, { status: 500 });
  }
}
