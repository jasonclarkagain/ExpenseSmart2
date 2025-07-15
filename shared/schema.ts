import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  decimal,
  integer,
  boolean,
  uniqueIndex,
  foreignKey,
  check,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  profileImageUrl: text("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("inactive").notNull(),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  permissions: text("permissions").array().default(sql`'{}'`),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
  stripeCustomerIdx: index("users_stripe_customer_idx").on(table.stripeCustomerId),
  subscriptionStatusIdx: index("users_subscription_status_idx").on(table.subscriptionStatus),
  createdAtIdx: index("users_created_at_idx").on(table.createdAt),
}));

// Receipt storage table
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  vendor: varchar("vendor", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }).notNull().references(() => categories.name),
  date: timestamp("date").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  imagePath: varchar("image_path", { length: 500 }),
  imageSize: integer("image_size"),
  imageMimeType: varchar("image_mime_type", { length: 100 }),
  ocrText: text("ocr_text"),
  aiAnalysis: jsonb("ai_analysis"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  isVerified: boolean("is_verified").default(false).notNull(),
  tags: text("tags").array(),
  receiptNumber: varchar("receipt_number", { length: 100 }),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
  tipAmount: decimal("tip_amount", { precision: 10, scale: 2 }),
  paymentMethod: varchar("payment_method", { length: 50 }),
  status: varchar("status", { length: 50 }).default("processed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("receipts_user_id_idx").on(table.userId),
  categoryIdx: index("receipts_category_idx").on(table.category),
  dateIdx: index("receipts_date_idx").on(table.date),
  amountIdx: index("receipts_amount_idx").on(table.amount),
  vendorIdx: index("receipts_vendor_idx").on(table.vendor),
  statusIdx: index("receipts_status_idx").on(table.status),
  createdAtIdx: index("receipts_created_at_idx").on(table.createdAt),
  userDateIdx: index("receipts_user_date_idx").on(table.userId, table.date),
  amountCheck: check("receipts_amount_positive", sql`${table.amount} >= 0`),
  confidenceCheck: check("receipts_confidence_range", sql`${table.confidence} >= 0 AND ${table.confidence} <= 1`),
}));

// Expense categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).default("").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  color: varchar("color", { length: 50 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  nameIdx: uniqueIndex("categories_name_idx").on(table.name),
  activeIdx: index("categories_active_idx").on(table.isActive),
  sortOrderIdx: index("categories_sort_order_idx").on(table.sortOrder),
}));

// Receipt line items for detailed expense tracking
export const receiptItems = pgTable("receipt_items", {
  id: serial("id").primaryKey(),
  receiptId: integer("receipt_id").notNull().references(() => receipts.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).default("1").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }),
  sku: varchar("sku", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  receiptIdIdx: index("receipt_items_receipt_id_idx").on(table.receiptId),
  categoryIdx: index("receipt_items_category_idx").on(table.category),
  quantityCheck: check("receipt_items_quantity_positive", sql`${table.quantity} > 0`),
  unitPriceCheck: check("receipt_items_unit_price_positive", sql`${table.unitPrice} >= 0`),
  totalPriceCheck: check("receipt_items_total_price_positive", sql`${table.totalPrice} >= 0`),
}));

// User activity log for audit trails
export const userActivityLog = pgTable("user_activity_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: varchar("entity_id", { length: 255 }),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_activity_log_user_id_idx").on(table.userId),
  actionIdx: index("user_activity_log_action_idx").on(table.action),
  entityTypeIdx: index("user_activity_log_entity_type_idx").on(table.entityType),
  createdAtIdx: index("user_activity_log_created_at_idx").on(table.createdAt),
}));

// Subscription plans for better plan management
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  billingPeriod: varchar("billing_period", { length: 20 }).default("monthly").notNull(),
  receiptLimit: integer("receipt_limit"),
  features: jsonb("features"),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  nameIdx: uniqueIndex("subscription_plans_name_idx").on(table.name),
  stripePriceIdx: index("subscription_plans_stripe_price_idx").on(table.stripePriceId),
  activeIdx: index("subscription_plans_active_idx").on(table.isActive),
  sortOrderIdx: index("subscription_plans_sort_order_idx").on(table.sortOrder),
}));

// Database Relations
export const usersRelations = relations(users, ({ many }) => ({
  receipts: many(receipts),
  activityLogs: many(userActivityLog),
}));

export const receiptsRelations = relations(receipts, ({ one, many }) => ({
  user: one(users, {
    fields: [receipts.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [receipts.category],
    references: [categories.name],
  }),
  items: many(receiptItems),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  receipts: many(receipts),
}));

export const receiptItemsRelations = relations(receiptItems, ({ one }) => ({
  receipt: one(receipts, {
    fields: [receiptItems.receiptId],
    references: [receipts.id],
  }),
}));

export const userActivityLogRelations = relations(userActivityLog, ({ one }) => ({
  user: one(users, {
    fields: [userActivityLog.userId],
    references: [users.id],
  }),
}));

// Type definitions
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = typeof receipts.$inferInsert;
export const insertReceiptSchema = createInsertSchema(receipts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid currency value"),
  category: z.string().min(1, "Category is required"),
  vendor: z.string().min(1, "Vendor is required"),
  date: z.date(),
  confidence: z.number().min(0).max(1).optional(),
  tags: z.array(z.string()).optional(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ReceiptItem = typeof receiptItems.$inferSelect;
export type InsertReceiptItem = typeof receiptItems.$inferInsert;
export const insertReceiptItemSchema = createInsertSchema(receiptItems).omit({
  id: true,
  createdAt: true,
});

export type UserActivityLog = typeof userActivityLog.$inferSelect;
export type InsertUserActivityLog = typeof userActivityLog.$inferInsert;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
