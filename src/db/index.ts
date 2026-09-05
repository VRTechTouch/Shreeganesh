import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "./schema";
import {
  INITIAL_MANDALS,
  INITIAL_USERS,
  INITIAL_MEMBERS,
  INITIAL_DONATIONS,
  INITIAL_EXPENSES,
} from "./seed-data";

// Cloudflare D1 Database binding interface
export interface D1Database {
  prepare(query: string): any;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: any[]): Promise<any[]>;
  exec(query: string): Promise<any>;
}

export interface EnvWithD1 {
  DB: D1Database;
}

export function getD1Db(d1: D1Database) {
  return drizzleD1(d1 as any, { schema });
}

// In-Memory / Edge Persistent Fallback Store for Local Development & Seamless Multi-Tenant Demo
class LocalDataStore {
  private mandals: schema.Mandal[] = [...INITIAL_MANDALS];
  private users: schema.User[] = [...INITIAL_USERS];
  private members: schema.Member[] = [...INITIAL_MEMBERS];
  private donations: schema.Donation[] = [...INITIAL_DONATIONS];
  private expenses: schema.Expense[] = [...INITIAL_EXPENSES];

  // Mandals
  getMandals(): schema.Mandal[] {
    return [...this.mandals];
  }

  getMandalById(id: string): schema.Mandal | undefined {
    return this.mandals.find((m) => m.id === id);
  }

  createMandal(mandal: schema.NewMandal): schema.Mandal {
    const created: schema.Mandal = {
      ...mandal,
      id: mandal.id || `mandal-${Date.now()}`,
      status: mandal.status || "active",
      city: mandal.city || "Pune",
      registration_no: mandal.registration_no || null,
      address: mandal.address || null,
      contact_phone: mandal.contact_phone || null,
      established_year: mandal.established_year || null,
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
      updated_at: new Date().toISOString().replace("T", " ").substring(0, 19),
    };
    this.mandals.unshift(created);
    return created;
  }

  toggleMandalStatus(id: string): schema.Mandal | null {
    const mandal = this.mandals.find((m) => m.id === id);
    if (!mandal) return null;
    mandal.status = mandal.status === "active" ? "blocked" : "active";
    mandal.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
    return mandal;
  }

  // Users
  getUsers(mandalId?: string): schema.User[] {
    if (mandalId) {
      return this.users.filter((u) => u.mandal_id === mandalId);
    }
    return [...this.users];
  }

  getUserByUsername(username: string): schema.User | undefined {
    return this.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
  }

  getUserById(id: string): schema.User | undefined {
    return this.users.find((u) => u.id === id);
  }

  createUser(user: schema.NewUser): schema.User {
    const created: schema.User = {
      ...user,
      id: user.id || `user-${Date.now()}`,
      mandal_id: user.mandal_id || null,
      email: user.email || null,
      role: user.role || "sub_user",
      permissions: user.permissions || "[]",
      status: user.status || "active",
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
      updated_at: new Date().toISOString().replace("T", " ").substring(0, 19),
    };
    this.users.unshift(created);
    return created;
  }

  toggleUserStatus(id: string): schema.User | null {
    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    user.status = user.status === "active" ? "blocked" : "active";
    return user;
  }

  // Members
  getMembers(mandalId: string): schema.Member[] {
    return this.members.filter((m) => m.mandal_id === mandalId);
  }

  createMember(member: schema.NewMember): schema.Member {
    const created: schema.Member = {
      ...member,
      id: member.id || `mem-${Date.now()}`,
      name_mr: member.name_mr || null,
      position: member.position || "committee_member",
      blood_group: member.blood_group || null,
      address: member.address || null,
      joining_year: member.joining_year || null,
      status: member.status || "active",
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
      updated_at: new Date().toISOString().replace("T", " ").substring(0, 19),
    };
    this.members.unshift(created);
    return created;
  }

  deleteMember(id: string, mandalId: string): boolean {
    const idx = this.members.findIndex((m) => m.id === id && m.mandal_id === mandalId);
    if (idx !== -1) {
      this.members.splice(idx, 1);
      return true;
    }
    return false;
  }

  // Donations (Vargani)
  getDonations(mandalId: string): schema.Donation[] {
    return this.donations.filter((d) => d.mandal_id === mandalId);
  }

  createDonation(donation: schema.NewDonation): schema.Donation {
    const count = this.donations.filter((d) => d.mandal_id === donation.mandal_id).length + 1;
    const receiptNo = donation.receipt_no || `VRG-2026-${String(count).padStart(4, "0")}`;
    const pledged = Number(donation.amount_pledged) || 0;
    const paid = Number(donation.amount_paid) || 0;
    const pending = Math.max(0, pledged - paid);

    const created: schema.Donation = {
      ...donation,
      id: donation.id || `don-${Date.now()}`,
      receipt_no: receiptNo,
      donor_name_mr: donation.donor_name_mr || null,
      contact_number: donation.contact_number || null,
      address: donation.address || null,
      amount_pledged: pledged,
      amount_paid: paid,
      balance_pending: pending,
      payment_mode: donation.payment_mode || "cash",
      notes: donation.notes || null,
      received_by_name: donation.received_by_name || null,
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
      updated_at: new Date().toISOString().replace("T", " ").substring(0, 19),
    };
    this.donations.unshift(created);
    return created;
  }

  // Expenses
  getExpenses(mandalId: string): schema.Expense[] {
    return this.expenses.filter((e) => e.mandal_id === mandalId);
  }

  createExpense(expense: schema.NewExpense): schema.Expense {
    const count = this.expenses.filter((e) => e.mandal_id === expense.mandal_id).length + 1;
    const voucherNo = expense.voucher_no || `EXP-2026-${String(count).padStart(4, "0")}`;

    const created: schema.Expense = {
      ...expense,
      id: expense.id || `exp-${Date.now()}`,
      voucher_no: voucherNo,
      category: expense.category || "miscellaneous",
      item_title_mr: expense.item_title_mr || null,
      amount: Number(expense.amount) || 0,
      payment_mode: expense.payment_mode || "cash",
      bill_receipt_url: expense.bill_receipt_url || null,
      notes: expense.notes || null,
      recorded_by_name: expense.recorded_by_name || null,
      created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
      updated_at: new Date().toISOString().replace("T", " ").substring(0, 19),
    };
    this.expenses.unshift(created);
    return created;
  }
}

// Global Singleton Store for edge runtime & local dev
const globalForStore = globalThis as unknown as { store?: LocalDataStore };
export const dbStore = globalForStore.store ?? new LocalDataStore();
if (process.env.NODE_ENV !== "production") globalForStore.store = dbStore;
