import {
  users,
  receipts,
  categories,
  type User,
  type UpsertUser,
  type Receipt,
  type InsertReceipt,
  type Category,
  type InsertCategory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  
  // Receipt operations
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  getReceipts(userId: string, limit?: number, offset?: number): Promise<Receipt[]>;
  getReceiptById(id: number, userId: string): Promise<Receipt | undefined>;
  updateReceipt(id: number, userId: string, updates: Partial<InsertReceipt>): Promise<Receipt>;
  deleteReceipt(id: number, userId: string): Promise<void>;
  getReceiptStats(userId: string): Promise<{
    totalReceipts: number;
    totalAmount: string;
    thisMonth: string;
    categories: number;
  }>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBreakdown(userId: string): Promise<Array<{
    category: string;
    count: number;
    total: string;
    percentage: number;
  }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStatus: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Receipt operations
  async createReceipt(receipt: InsertReceipt): Promise<Receipt> {
    const [newReceipt] = await db
      .insert(receipts)
      .values(receipt)
      .returning();
    return newReceipt;
  }

  async getReceipts(userId: string, limit = 50, offset = 0): Promise<Receipt[]> {
    return await db
      .select()
      .from(receipts)
      .where(eq(receipts.userId, userId))
      .orderBy(desc(receipts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getReceiptById(id: number, userId: string): Promise<Receipt | undefined> {
    const [receipt] = await db
      .select()
      .from(receipts)
      .where(and(eq(receipts.id, id), eq(receipts.userId, userId)));
    return receipt;
  }

  async updateReceipt(id: number, userId: string, updates: Partial<InsertReceipt>): Promise<Receipt> {
    const [updatedReceipt] = await db
      .update(receipts)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(receipts.id, id), eq(receipts.userId, userId)))
      .returning();
    return updatedReceipt;
  }

  async deleteReceipt(id: number, userId: string): Promise<void> {
    await db
      .delete(receipts)
      .where(and(eq(receipts.id, id), eq(receipts.userId, userId)));
  }

  async getReceiptStats(userId: string): Promise<{
    totalReceipts: number;
    totalAmount: string;
    thisMonth: string;
    categories: number;
  }> {
    const [stats] = await db
      .select({
        totalReceipts: sql<number>`count(*)::int`,
        totalAmount: sql<string>`sum(${receipts.amount})::text`,
      })
      .from(receipts)
      .where(eq(receipts.userId, userId));

    const [thisMonth] = await db
      .select({
        thisMonth: sql<string>`coalesce(sum(${receipts.amount}), 0)::text`,
      })
      .from(receipts)
      .where(
        and(
          eq(receipts.userId, userId),
          sql`extract(month from ${receipts.date}) = extract(month from now())`,
          sql`extract(year from ${receipts.date}) = extract(year from now())`
        )
      );

    const [categoryCount] = await db
      .select({
        categories: sql<number>`count(distinct ${receipts.category})::int`,
      })
      .from(receipts)
      .where(eq(receipts.userId, userId));

    return {
      totalReceipts: stats.totalReceipts || 0,
      totalAmount: stats.totalAmount || "0",
      thisMonth: thisMonth.thisMonth || "0",
      categories: categoryCount.categories || 0,
    };
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryBreakdown(userId: string): Promise<Array<{
    category: string;
    count: number;
    total: string;
    percentage: number;
  }>> {
    const breakdown = await db
      .select({
        category: receipts.category,
        count: sql<number>`count(*)::int`,
        total: sql<string>`sum(${receipts.amount})::text`,
      })
      .from(receipts)
      .where(eq(receipts.userId, userId))
      .groupBy(receipts.category);

    // Calculate percentages
    const totalAmount = breakdown.reduce((sum, item) => sum + parseFloat(item.total), 0);
    
    return breakdown.map(item => ({
      ...item,
      percentage: totalAmount > 0 ? Math.round((parseFloat(item.total) / totalAmount) * 100) : 0,
    }));
  }
}

export const storage = new DatabaseStorage();
