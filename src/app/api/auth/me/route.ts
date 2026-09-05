import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbStore } from "@/db";

export const runtime = "edge";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  let mandal = null;
  if (session.mandalId) {
    mandal = dbStore.getMandalById(session.mandalId) || null;
  }

  return NextResponse.json({
    user: session,
    mandal,
  });
}
