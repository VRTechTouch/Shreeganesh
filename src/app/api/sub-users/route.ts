import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbStore } from "@/db";
import { hasPermission } from "@/lib/permissions";
import { hashPassword } from "@/lib/crypto";

export const runtime = "edge";

export async function GET() {
  const session = await getSession();
  if (!session || !session.mandalId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const usersList = dbStore.getUsers(session.mandalId);
  // Exclude password hashes
  const safeUsers = usersList.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    role: u.role,
    permissions: u.permissions,
    status: u.status,
    created_at: u.created_at,
  }));

  return NextResponse.json({ users: safeUsers });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.mandalId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    session.role !== "mandal_admin" &&
    !hasPermission(session.role, session.permissions, "subusers.manage")
  ) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, username, password, email, permissions } = body;

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: "Name, username, and password are required" },
        { status: 400 }
      );
    }

    const existingUser = dbStore.getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUser = dbStore.createUser({
      id: `user-${Date.now()}`,
      mandal_id: session.mandalId,
      name,
      username: username.toLowerCase().trim(),
      email: email || null,
      password_hash: passwordHash,
      role: "sub_user",
      permissions: JSON.stringify(permissions || []),
      status: "active",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        permissions: newUser.permissions,
        status: newUser.status,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create user" },
      { status: 500 }
    );
  }
}
