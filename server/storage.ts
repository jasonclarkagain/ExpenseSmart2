import {
  users,
  receipts,
  categories,
  receiptItems,
  userActivityLog,
  subscriptionPlans,
  type User,
  type UpsertUser,
  type Receipt,
  type InsertReceipt,
  type Category,
  type InsertCategory,
  type ReceiptItem,
  type InsertReceiptItem,
  type UserActivityLog,
  type InsertUserActivityLog,
  type SubscriptionPlan,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, sum, avg, gte, lte, like, isNull, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  updateUserLastLogin(userId: string): Promise<void>;
  getUserStats(userId: string): Promise<{
    totalReceipts: number;
    totalAmount: string;
    avgAmount: string;
    thisMonth: string;
    lastMonth: string;
    categories: number;
    receiptsThisWeek: number;
  }>;
  
  // Receipt operations
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  createReceiptWithItems(receipt: InsertReceipt, items: InsertReceiptItem[]): Promise<Receipt>;
  getReceipts(userId: string, options?: {
    limit?: number;
    offset?: number;
    category?: string;
    vendor?: string;
    dateFrom?: Date;
    dateTo?: Date;
    minAmount?: number;
    maxAmount?: number;
    status?: string;
    search?: string;
  }): Promise<Receipt[]>;
  getReceiptById(id: number, userId: string): Promise<Receipt | undefined>;
  getReceiptWithItems(id: number, userId: string): Promise<Receipt & { items: ReceiptItem[] } | undefined>;
  updateReceipt(id: number, userId: string, updates: Partial<InsertReceipt>): Promise<Receipt>;
  deleteReceipt(id: number, userId: string): Promise<void>;
  bulkDeleteReceipts(ids: number[], userId: string): Promise<void>;
  getReceiptStats(userId: string): Promise<{
    totalReceipts: number;
    totalAmount: string;
    thisMonth: string;
    categories: number;
  }>;
  
  // Receipt items operations
  createReceiptItem(item: InsertReceiptItem): Promise<ReceiptItem>;
  getReceiptItems(receiptId: number): Promise<ReceiptItem[]>;
  updateReceiptItem(id: number, updates: Partial<InsertReceiptItem>): Promise<ReceiptItem>;
  deleteReceiptItem(id: number): Promise<void>;
  
  // Category operations
  getCategories(activeOnly?: boolean): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category>;
  getCategoryBreakdown(userId: string, options?: {
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Array<{
    category: string;
    count: number;
    total: string;
    percentage: number;
    avgAmount: string;
  }>>;
  
  // Activity logging
  logUserActivity(log: InsertUserActivityLog): Promise<void>;
  getUserActivity(userId: string, limit?: number): Promise<UserActivityLog[]>;
  
  // Subscription plans
  getSubscriptionPlans(activeOnly?: boolean): Promise<SubscriptionPlan[]>;
  getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined>;
  
  // Analytics and reporting
  getExpenseAnalytics(userId: string, options?: {
    dateFrom?: Date;
    dateTo?: Date;
    groupBy?: "day" | "week" | "month";
  }): Promise<Array<{
    period: string;
    totalAmount: string;
    receiptCount: number;
    avgAmount: string;
  }>>;
  
  getTopVendors(userId: string, limit?: number): Promise<Array<{
    vendor: string;
    totalAmount: string;
    receiptCount: number;
    avgAmount: string;
  }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Failed to fetch user");
    }
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
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
      
      // Log user activity
      await this.logUserActivity({
        userId: user.id,
        action: "user_login",
        entityType: "user",
        entityId: user.id,
      });
      
      return user;
    } catch (error) {
      console.error("Error upserting user:", error);
      throw new Error("Failed to upsert user");
    }
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    try {
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
      
      await this.logUserActivity({
        userId,
        action: "subscription_updated",
        entityType: "subscription",
        entityId: stripeSubscriptionId,
        details: { stripeCustomerId, stripeSubscriptionId },
      });
      
      return user;
    } catch (error) {
      console.error("Error updating user stripe info:", error);
      throw new Error("Failed to update user stripe info");
    }
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    try {
      await db
        .update(users)
        .set({ 
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error updating last login:", error);
      // Don't throw error for non-critical operation
    }
  }

  async getUserStats(userId: string): Promise<{
    totalReceipts: number;
    totalAmount: string;
    avgAmount: string;
    thisMonth: string;
    lastMonth: string;
    categories: number;
    receiptsThisWeek: number;
  }> {
    try {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [totalStats] = await db
        .select({
          totalReceipts: count(receipts.id),
          totalAmount: sql<string>`COALESCE(SUM(${receipts.amount}), 0)`,
          avgAmount: sql<string>`COALESCE(AVG(${receipts.amount}), 0)`,
        })
        .from(receipts)
        .where(eq(receipts.userId, userId));

      const [thisMonthStats] = await db
        .select({
          thisMonth: sql<string>`COALESCE(SUM(${receipts.amount}), 0)`,
        })
        .from(receipts)
        .where(and(eq(receipts.userId, userId), gte(receipts.date, thisMonthStart)));

      const [lastMonthStats] = await db
        .select({
          lastMonth: sql<string>`COALESCE(SUM(${receipts.amount}), 0)`,
        })
        .from(receipts)
        .where(and(
          eq(receipts.userId, userId),
          gte(receipts.date, lastMonthStart),
          lte(receipts.date, thisMonthStart)
        ));

      const [categoryStats] = await db
        .select({
          categories: sql<number>`COUNT(DISTINCT ${receipts.category})`,
        })
        .from(receipts)
        .where(eq(receipts.userId, userId));

      const [weekStats] = await db
        .select({
          receiptsThisWeek: count(receipts.id),
        })
        .from(receipts)
        .where(and(eq(receipts.userId, userId), gte(receipts.date, thisWeekStart)));

      return {
        totalReceipts: totalStats.totalReceipts,
        totalAmount: totalStats.totalAmount,
        avgAmount: totalStats.avgAmount,
        thisMonth: thisMonthStats.thisMonth,
        lastMonth: lastMonthStats.lastMonth,
        categories: categoryStats.categories,
        receiptsThisWeek: weekStats.receiptsThisWeek,
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw new Error("Failed to fetch user stats");
    }
  }

  // Receipt operations
  async createReceipt(receipt: InsertReceipt): Promise<Receipt> {
    try {
      const [newReceipt] = await db
        .insert(receipts)
        .values({
          ...receipt,
          status: receipt.status || "processed",
        })
        .returning();
      
      await this.logUserActivity({
        userId: receipt.userId,
        action: "receipt_created",
        entityType: "receipt",
        entityId: newReceipt.id.toString(),
        details: { vendor: receipt.vendor, amount: receipt.amount },
      });
      
      return newReceipt;
    } catch (error) {
      console.error("Error creating receipt:", error);
      throw new Error("Failed to create receipt");
    }
  }

  async createReceiptWithItems(receipt: InsertReceipt, items: InsertReceiptItem[]): Promise<Receipt> {
    try {
      const result = await db.transaction(async (tx) => {
        const [newReceipt] = await tx
          .insert(receipts)
          .values({
            ...receipt,
            status: receipt.status || "processed",
          })
          .returning();

        if (items.length > 0) {
          const itemsWithReceiptId = items.map(item => ({
            ...item,
            receiptId: newReceipt.id,
          }));
          
          await tx.insert(receiptItems).values(itemsWithReceiptId);
        }

        return newReceipt;
      });

      await this.logUserActivity({
        userId: receipt.userId,
        action: "receipt_created_with_items",
        entityType: "receipt",
        entityId: result.id.toString(),
        details: { vendor: receipt.vendor, amount: receipt.amount, itemCount: items.length },
      });

      return result;
    } catch (error) {
      console.error("Error creating receipt with items:", error);
      throw new Error("Failed to create receipt with items");
    }
  }

  async getReceipts(userId: string, options: {
    limit?: number;
    offset?: number;
    category?: string;
    vendor?: string;
    dateFrom?: Date;
    dateTo?: Date;
    minAmount?: number;
    maxAmount?: number;
    status?: string;
    search?: string;
  } = {}): Promise<Receipt[]> {
    try {
      const {
        limit = 50,
        offset = 0,
        category,
        vendor,
        dateFrom,
        dateTo,
        minAmount,
        maxAmount,
        status,
        search
      } = options;

      let query = db.select().from(receipts).where(eq(receipts.userId, userId));

      // Build dynamic WHERE conditions
      const conditions = [eq(receipts.userId, userId)];

      if (category) conditions.push(eq(receipts.category, category));
      if (vendor) conditions.push(like(receipts.vendor, `%${vendor}%`));
      if (status) conditions.push(eq(receipts.status, status));
      if (dateFrom) conditions.push(gte(receipts.date, dateFrom));
      if (dateTo) conditions.push(lte(receipts.date, dateTo));
      if (minAmount) conditions.push(sql`${receipts.amount} >= ${minAmount}`);
      if (maxAmount) conditions.push(sql`${receipts.amount} <= ${maxAmount}`);
      if (search) {
        conditions.push(sql`(
          ${receipts.vendor} ILIKE '%${search}%' OR
          ${receipts.description} ILIKE '%${search}%' OR
          ${receipts.ocrText} ILIKE '%${search}%'
        )`);
      }

      return await db
        .select()
        .from(receipts)
        .where(and(...conditions))
        .orderBy(desc(receipts.createdAt))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      throw new Error("Failed to fetch receipts");
    }
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

  async getReceiptWithItems(id: number, userId: string): Promise<Receipt & { items: ReceiptItem[] } | undefined> {
    try {
      const [receipt] = await db
        .select()
        .from(receipts)
        .where(and(eq(receipts.id, id), eq(receipts.userId, userId)));

      if (!receipt) return undefined;

      const items = await db
        .select()
        .from(receiptItems)
        .where(eq(receiptItems.receiptId, id));

      return { ...receipt, items };
    } catch (error) {
      console.error("Error fetching receipt with items:", error);
      throw new Error("Failed to fetch receipt with items");
    }
  }

  async bulkDeleteReceipts(ids: number[], userId: string): Promise<void> {
    try {
      await db
        .delete(receipts)
        .where(and(inArray(receipts.id, ids), eq(receipts.userId, userId)));

      await this.logUserActivity({
        userId,
        action: "receipts_bulk_deleted",
        entityType: "receipt",
        details: { deletedIds: ids, count: ids.length },
      });
    } catch (error) {
      console.error("Error bulk deleting receipts:", error);
      throw new Error("Failed to bulk delete receipts");
    }
  }

  // Receipt items operations
  async createReceiptItem(item: InsertReceiptItem): Promise<ReceiptItem> {
    try {
      const [newItem] = await db.insert(receiptItems).values(item).returning();
      return newItem;
    } catch (error) {
      console.error("Error creating receipt item:", error);
      throw new Error("Failed to create receipt item");
    }
  }

  async getReceiptItems(receiptId: number): Promise<ReceiptItem[]> {
    try {
      return await db
        .select()
        .from(receiptItems)
        .where(eq(receiptItems.receiptId, receiptId));
    } catch (error) {
      console.error("Error fetching receipt items:", error);
      throw new Error("Failed to fetch receipt items");
    }
  }

  async updateReceiptItem(id: number, updates: Partial<InsertReceiptItem>): Promise<ReceiptItem> {
    try {
      const [updatedItem] = await db
        .update(receiptItems)
        .set(updates)
        .where(eq(receiptItems.id, id))
        .returning();
      return updatedItem;
    } catch (error) {
      console.error("Error updating receipt item:", error);
      throw new Error("Failed to update receipt item");
    }
  }

  async deleteReceiptItem(id: number): Promise<void> {
    try {
      await db.delete(receiptItems).where(eq(receiptItems.id, id));
    } catch (error) {
      console.error("Error deleting receipt item:", error);
      throw new Error("Failed to delete receipt item");
    }
  }

  // Enhanced category operations
  async getCategories(activeOnly = true): Promise<Category[]> {
    try {
      const query = db.select().from(categories);
      if (activeOnly) {
        return await query.where(eq(categories.isActive, true)).orderBy(categories.sortOrder, categories.displayName);
      }
      return await query.orderBy(categories.sortOrder, categories.displayName);
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    try {
      const [category] = await db.select().from(categories).where(eq(categories.id, id));
      return category;
    } catch (error) {
      console.error("Error fetching category:", error);
      throw new Error("Failed to fetch category");
    }
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    try {
      const [newCategory] = await db.insert(categories).values(category).returning();
      return newCategory;
    } catch (error) {
      console.error("Error creating category:", error);
      throw new Error("Failed to create category");
    }
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category> {
    try {
      const [updatedCategory] = await db
        .update(categories)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(categories.id, id))
        .returning();
      return updatedCategory;
    } catch (error) {
      console.error("Error updating category:", error);
      throw new Error("Failed to update category");
    }
  }

  async getCategoryBreakdown(userId: string, options: {
    dateFrom?: Date;
    dateTo?: Date;
  } = {}): Promise<Array<{
    category: string;
    count: number;
    total: string;
    percentage: number;
    avgAmount: string;
  }>> {
    try {
      const { dateFrom, dateTo } = options;
      const conditions = [eq(receipts.userId, userId)];
      
      if (dateFrom) conditions.push(gte(receipts.date, dateFrom));
      if (dateTo) conditions.push(lte(receipts.date, dateTo));

      const breakdown = await db
        .select({
          category: receipts.category,
          count: sql<number>`count(*)::int`,
          total: sql<string>`sum(${receipts.amount})::text`,
          avgAmount: sql<string>`avg(${receipts.amount})::text`,
        })
        .from(receipts)
        .where(and(...conditions))
        .groupBy(receipts.category);

      const totalAmount = breakdown.reduce((sum, item) => sum + parseFloat(item.total), 0);

      return breakdown.map(item => ({
        ...item,
        percentage: totalAmount > 0 ? (parseFloat(item.total) / totalAmount) * 100 : 0,
      }));
    } catch (error) {
      console.error("Error fetching category breakdown:", error);
      throw new Error("Failed to fetch category breakdown");
    }
  }

  // Activity logging
  async logUserActivity(log: InsertUserActivityLog): Promise<void> {
    try {
      await db.insert(userActivityLog).values(log);
    } catch (error) {
      console.error("Error logging user activity:", error);
      // Don't throw error for logging failures
    }
  }

  async getUserActivity(userId: string, limit = 50): Promise<UserActivityLog[]> {
    try {
      return await db
        .select()
        .from(userActivityLog)
        .where(eq(userActivityLog.userId, userId))
        .orderBy(desc(userActivityLog.createdAt))
        .limit(limit);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      throw new Error("Failed to fetch user activity");
    }
  }

  // Subscription plans
  async getSubscriptionPlans(activeOnly = true): Promise<SubscriptionPlan[]> {
    try {
      const query = db.select().from(subscriptionPlans);
      if (activeOnly) {
        return await query.where(eq(subscriptionPlans.isActive, true)).orderBy(subscriptionPlans.sortOrder);
      }
      return await query.orderBy(subscriptionPlans.sortOrder);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      throw new Error("Failed to fetch subscription plans");
    }
  }

  async getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined> {
    try {
      const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
      return plan;
    } catch (error) {
      console.error("Error fetching subscription plan:", error);
      throw new Error("Failed to fetch subscription plan");
    }
  }

  // Analytics and reporting
  async getExpenseAnalytics(userId: string, options: {
    dateFrom?: Date;
    dateTo?: Date;
    groupBy?: "day" | "week" | "month";
  } = {}): Promise<Array<{
    period: string;
    totalAmount: string;
    receiptCount: number;
    avgAmount: string;
  }>> {
    try {
      const { dateFrom, dateTo, groupBy = "month" } = options;
      const conditions = [eq(receipts.userId, userId)];
      
      if (dateFrom) conditions.push(gte(receipts.date, dateFrom));
      if (dateTo) conditions.push(lte(receipts.date, dateTo));

      const dateFormat = groupBy === "day" ? "YYYY-MM-DD" : 
                        groupBy === "week" ? "YYYY-WW" : "YYYY-MM";

      return await db
        .select({
          period: sql<string>`TO_CHAR(${receipts.date}, '${dateFormat}')`,
          totalAmount: sql<string>`SUM(${receipts.amount})::text`,
          receiptCount: count(receipts.id),
          avgAmount: sql<string>`AVG(${receipts.amount})::text`,
        })
        .from(receipts)
        .where(and(...conditions))
        .groupBy(sql`TO_CHAR(${receipts.date}, '${dateFormat}')`)
        .orderBy(sql`TO_CHAR(${receipts.date}, '${dateFormat}')`);
    } catch (error) {
      console.error("Error fetching expense analytics:", error);
      throw new Error("Failed to fetch expense analytics");
    }
  }

  async getTopVendors(userId: string, limit = 10): Promise<Array<{
    vendor: string;
    totalAmount: string;
    receiptCount: number;
    avgAmount: string;
  }>> {
    try {
      return await db
        .select({
          vendor: receipts.vendor,
          totalAmount: sql<string>`SUM(${receipts.amount})::text`,
          receiptCount: count(receipts.id),
          avgAmount: sql<string>`AVG(${receipts.amount})::text`,
        })
        .from(receipts)
        .where(eq(receipts.userId, userId))
        .groupBy(receipts.vendor)
        .orderBy(sql`SUM(${receipts.amount}) DESC`)
        .limit(limit);
    } catch (error) {
      console.error("Error fetching top vendors:", error);
      throw new Error("Failed to fetch top vendors");
    }
  }
}

export const storage = new DatabaseStorage();
