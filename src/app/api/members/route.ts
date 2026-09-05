import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbStore } from "@/db";
import { hasPermission } from "@/lib/permissions";

export const runtime = "edge";

export async function GET() {
  const session = await getSession();
  if (!session || !session.mandalId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membersList = dbStore.getMembers(session.mandalId);
  return NextResponse.json({ members: membersList });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.mandalId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(session.role, session.permissions, "members.manage")) {
    return NextResponse.json(
      { error: "You do not have permission to manage members" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      name,
      name_mr,
      position,
      contact_number,
      blood_group,
      address,
      joining_year,
    } = body;

    if (!name || !contact_number) {
      return NextResponse.json(
        { error: "Name and contact number are required" },
        { status: 400 }
      );
    }

    const newMember = dbStore.createMember({
      id: `mem-${Date.now()}`,
      mandal_id: session.mandalId,
      name,
      name_mr: name_mr || null,
      position: position || "committee_member",
      contact_number,
      blood_group: blood_group || null,
      address: address || null,
      joining_year: joining_year ? Number(joining_year) : null,
      status: "active",
    });

    return NextResponse.json({ success: true, member: newMember });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add member" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.mandalId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(session.role, session.permissions, "members.manage")) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Member ID required" }, { status: 400 });
  }

  const deleted = dbStore.deleteMember(id, session.mandalId);
  return NextResponse.json({ success: deleted });
}
