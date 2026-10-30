
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const secret = process.env.ADMIN_SESSION_SECRET;

    if (!secret) {
      throw new Error("Session secret is missing.");
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    if (payload.role !== "admin") {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      email: payload.email,
    });
  } catch (error) {
    console.error("Session verification failed:", error);

    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}
