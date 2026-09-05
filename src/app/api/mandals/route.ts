import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbStore } from "@/db";
import { hashPassword } from "@/lib/crypto";

export const runtime = "edge";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const mandalsList = dbStore.getMandals();
  const allUsers = dbStore.getUsers();

  // Attach Mandal Admin info to each mandal
  const withAdminInfo = mandalsList.map((m) => {
    const admin = allUsers.find(
      (u) => u.mandal_id === m.id && u.role === "mandal_admin"
    );
    return {
      ...m,
      admin_username: admin?.username || "N/A",
      admin_name: admin?.name || "N/A",
    };
  });

  return NextResponse.json({ mandals: withAdminInfo });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      name,
      name_mr,
      city,
      registration_no,
      address,
      contact_phone,
      established_year,
      admin_name,
      admin_username,
      admin_password,
    } = body;

    if (!name || !name_mr || !admin_username || !admin_password) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    const existingUser = dbStore.getUserByUsername(admin_username);
    if (existingUser) {
      return NextResponse.json(
        { error: "Admin username already taken" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const mandalId = `mandal-${Date.now()}`;
    const newMandal = dbStore.createMandal({
      id: mandalId,
      name,
      name_mr,
      slug,
      city: city || "Pune",
      registration_no: registrationNoOrNull(registration_no),
      address: address || null,
      contact_phone: contact_phone || null,
      established_year: established_year ? Number(established_year) : null,
      status: "active",
    });

    // Create the initial Mandal Admin user
    const passwordHash = await hashPassword(admin_password);
    dbStore.createUser({
      id: `user-${Date.now()}`,
      mandal_id: mandalId,
      name: admin_name || `${name} Admin`,
      username: admin_username.toLowerCase().trim(),
      password_hash: passwordHash,
      role: "mandal_admin",
      permissions: JSON.stringify([
        "mandal.manage",
        "members.manage",
        "finance.manage",
        "reports.export",
      ]),
      status: "active",
    });

    return NextResponse.json({ success: true, mandal: newMandal });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create mandal" },
      { status: 500 }
    );
  }
}

function registrationNoOrNull(val: string | undefined): string | null {
  return val && val.trim().length > 0 ? val.trim() : null;
}
