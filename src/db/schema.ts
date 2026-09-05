import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

// 1. Mandals (Tenants)
export const mandals = sqliteTable("mandals", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  name_mr: text("name_mr").notNull(),
  slug: text("slug").notNull().unique(),
  registration_no: text("registration_no"),
  city: text("city").notNull().default("Pune"),
  address: text("address"),
  contact_phone: text("contact_phone"),
  established_year: integer("established_year"),
  status: text("status", { enum: ["active", "blocked"] }).notNull().default("active"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 2. Users (Role-Based Access)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  mandal_id: text("mandal_id").references(() => mandals.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email"),
  password_hash: text("password_hash").notNull(),
  role: text("role", { enum: ["super_admin", "mandal_admin", "sub_user"] }).notNull().default("sub_user"),
  // JSON array string of granted permissions, e.g. ["finance.view", "finance.create", "members.manage"]
  permissions: text("permissions").notNull().default("[]"),
  status: text("status", { enum: ["active", "blocked"] }).notNull().default("active"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 3. Committee Members
export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  mandal_id: text("mandal_id").notNull().references(() => mandals.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  name_mr: text("name_mr"),
  position: text("position", {
    enum: [
      "president",
      "vice_president",
      "secretary",
      "joint_secretary",
      "treasurer",
      "committee_member",
      "volunteer",
    ],
  }).notNull().default("committee_member"),
  contact_number: text("contact_number").notNull(),
  blood_group: text("blood_group"),
  address: text("address"),
  joining_year: integer("joining_year"),
  status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 4. Donations (Vargani / वर्गणी Ledger)
export const donations = sqliteTable("donations", {
  id: text("id").primaryKey(),
  mandal_id: text("mandal_id").notNull().references(() => mandals.id, { onDelete: "cascade" }),
  receipt_no: text("receipt_no").notNull(),
  donor_name: text("donor_name").notNull(),
  donor_name_mr: text("donor_name_mr"),
  contact_number: text("contact_number"),
  address: text("address"),
  amount_pledged: real("amount_pledged").notNull().default(0),
  amount_paid: real("amount_paid").notNull().default(0),
  balance_pending: real("balance_pending").notNull().default(0),
  payment_mode: text("payment_mode", {
    enum: ["cash", "upi", "cheque", "bank_transfer"],
  }).notNull().default("cash"),
  payment_date: text("payment_date").notNull(),
  notes: text("notes"),
  received_by_name: text("received_by_name"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 5. Expenses (खर्च)
export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  mandal_id: text("mandal_id").notNull().references(() => mandals.id, { onDelete: "cascade" }),
  voucher_no: text("voucher_no").notNull(),
  category: text("category", {
    enum: [
      "mandap_stage",
      "decoration_lighting",
      "sound_dhol",
      "prasad_bhojan",
      "puja_samagri",
      "police_security",
      "cultural_events",
      "miscellaneous",
    ],
  }).notNull().default("miscellaneous"),
  item_title: text("item_title").notNull(),
  item_title_mr: text("item_title_mr"),
  amount: real("amount").notNull().default(0),
  expense_date: text("expense_date").notNull(),
  paid_to: text("paid_to").notNull(),
  payment_mode: text("payment_mode", {
    enum: ["cash", "upi", "cheque", "bank_transfer"],
  }).notNull().default("cash"),
  bill_receipt_url: text("bill_receipt_url"),
  notes: text("notes"),
  recorded_by_name: text("recorded_by_name"),
  created_at: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const mandalsRelations = relations(mandals, ({ many }) => ({
  users: many(users),
  members: many(members),
  donations: many(donations),
  expenses: many(expenses),
}));

export const usersRelations = relations(users, ({ one }) => ({
  mandal: one(mandals, {
    fields: [users.mandal_id],
    references: [mandals.id],
  }),
}));

export const membersRelations = relations(members, ({ one }) => ({
  mandal: one(mandals, {
    fields: [members.mandal_id],
    references: [mandals.id],
  }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  mandal: one(mandals, {
    fields: [donations.mandal_id],
    references: [mandals.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  mandal: one(mandals, {
    fields: [expenses.mandal_id],
    references: [mandals.id],
  }),
}));

// TypeScript Inferred Types
export type Mandal = typeof mandals.$inferSelect;
export type NewMandal = typeof mandals.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;

export type Donation = typeof donations.$inferSelect;
export type NewDonation = typeof donations.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
