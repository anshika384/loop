import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      fullName,
      email,
      password,
      confirmPassword,
      workspace,
    } = body;

    // Validation
    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword ||
      !workspace
    ) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Temporary output until database is added
    console.log({
      fullName,
      email,
      workspace,
      hashedPassword,
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}