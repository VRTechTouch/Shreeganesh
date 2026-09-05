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

  if (!hasPermission(session.role, session.permissions, "finance.view")) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const expensesList = dbStore.getExpenses(session.mandalId);
  return NextResponse.json({ expenses: expensesList });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !session.mandalId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(session.role, session.permissions, "finance.create")) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      category,
      item_title,
      item_title_mr,
      amount,
      expense_date,
      paid_to,
      payment_mode,
      notes,
    } = body;

    if (!item_title || amount === undefined || !paid_to) {
      return NextResponse.json(
        { error: "Item title, amount, and paid_to are required" },
        { status: 400 }
      );
    }

    const newExpense = dbStore.createExpense({
      id: `exp-${Date.now()}`,
      mandal_id: session.mandalId,
      voucher_no: "", // Auto-generated
      category: category || "miscellaneous",
      item_title,
      item_title_mr: item_title_mr || null,
      amount: Number(amount) || 0,
      expense_date: expense_date || new Date().toISOString().split("T")[0],
      paid_to,
      payment_mode: payment_mode || "cash",
      notes: notes || null,
      recorded_by_name: session.name,
    });

    return NextResponse.json({ success: true, expense: newExpense });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record expense" },
      { status: 500 }
    );
  }
}
