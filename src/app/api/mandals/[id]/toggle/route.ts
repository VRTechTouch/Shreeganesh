import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbStore } from "@/db";

export const runtime = "edge";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await context.params;
  const updated = dbStore.toggleMandalStatus(id);
  if (!updated) {
    return NextResponse.json({ error: "Mandal not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, mandal: updated });
}
