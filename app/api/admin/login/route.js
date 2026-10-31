
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const sessionSecret = process.env.ADMIN_SESSION_SECRET;

    if (!sessionSecret) {
      throw new Error("Admin session secret is missing.");
    }

    // Support two independent admin accounts
    const admins = [
      {
        email: process.env.ADMIN_EMAIL,
        encodedHash: process.env.ADMIN_PASSWORD_HASH_BASE64,
      },
      {
        email: process.env.ADMIN2_EMAIL,
        encodedHash: process.env.ADMIN2_PASSWORD_HASH_BASE64,
      },
    ].filter((admin) => admin.email && admin.encodedHash);

    const normalizedEmail = email.trim().toLowerCase();

    const admin = admins.find(
      (item) => item.email.trim().toLowerCase() === normalizedEmail
    );

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const passwordHash = Buffer.from(
      admin.encodedHash,
      "base64"
    ).toString("utf8");

    const passwordMatches = await bcrypt.compare(
      password,
      passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const secret = new TextEncoder().encode(sessionSecret);

    const token = await new SignJWT({
      role: "admin",
      email: admin.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret);

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
    });

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to process login." },
      { status: 500 }
    );
  }
}
