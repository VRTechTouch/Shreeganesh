import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/db";
import { verifyPassword } from "@/lib/crypto";
import { createSessionToken } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const user = dbStore.getUserByUsername(username);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    if (user.status === "blocked") {
      return NextResponse.json(
        { error: "This user account has been deactivated / blocked." },
        { status: 403 }
      );
    }

    // If mandal admin or sub-user, check if the parent mandal is blocked
    if (user.mandal_id) {
      const mandal = dbStore.getMandalById(user.mandal_id);
      if (mandal && mandal.status === "blocked") {
        return NextResponse.json(
          {
            error:
              "This Mandal committee account has been blocked by the Super Admin.",
          },
          { status: 403 }
        );
      }
    }

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    let parsedPermissions: string[] = [];
    try {
      parsedPermissions = JSON.parse(user.permissions);
    } catch {
      parsedPermissions = [];
    }

    const sessionPayload = {
      userId: user.id,
      mandalId: user.mandal_id,
      name: user.name,
      username: user.username,
      role: user.role,
      permissions: parsedPermissions,
    };

    const token = await createSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      redirect: user.role === "super_admin" ? "/super-admin" : "/dashboard",
    });

    response.cookies.set("mandal_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
