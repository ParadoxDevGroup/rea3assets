import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";

// ---------------------------------------------------------------------------
// POST /api/auth/login  → verify password and create session
// POST /api/auth/logout → destroy session
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const expected = process.env.ADMIN_PASSWORD;

    if (!expected) {
      // No password configured — create a session anyway (dev mode)
      await createSession();
      return NextResponse.json({ message: "Logged in (no password configured)" });
    }

    if (password !== expected) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    await createSession();
    return NextResponse.json({ message: "Logged in" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
