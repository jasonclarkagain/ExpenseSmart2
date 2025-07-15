import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { processReceiptImage, getUserReceiptsCSV } from "./services/receipt";
import { insertReceiptSchema } from "@shared/schema";
import multer from "multer";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Receipt routes
  app.post('/api/receipts', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const imageFile = req.file;
      
      if (!imageFile) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Convert image to base64
      const base64Image = imageFile.buffer.toString('base64');
      
      // Process the receipt
      const result = await processReceiptImage(userId, base64Image);
      
      res.json(result);
    } catch (error) {
      console.error("Receipt upload error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/receipts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const receipts = await storage.getReceipts(userId, limit, offset);
      res.json(receipts);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      res.status(500).json({ message: "Failed to fetch receipts" });
    }
  });

  app.get('/api/receipts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const receiptId = parseInt(req.params.id);
      
      const receipt = await storage.getReceiptById(receiptId, userId);
      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      
      res.json(receipt);
    } catch (error) {
      console.error("Error fetching receipt:", error);
      res.status(500).json({ message: "Failed to fetch receipt" });
    }
  });

  app.put('/api/receipts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const receiptId = parseInt(req.params.id);
      
      // Validate the update data
      const updateData = insertReceiptSchema.partial().parse(req.body);
      
      const updatedReceipt = await storage.updateReceipt(receiptId, userId, updateData);
      res.json(updatedReceipt);
    } catch (error) {
      console.error("Error updating receipt:", error);
      res.status(500).json({ message: "Failed to update receipt" });
    }
  });

  app.delete('/api/receipts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const receiptId = parseInt(req.params.id);
      
      await storage.deleteReceipt(receiptId, userId);
      res.json({ message: "Receipt deleted successfully" });
    } catch (error) {
      console.error("Error deleting receipt:", error);
      res.status(500).json({ message: "Failed to delete receipt" });
    }
  });

  // Stats routes
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getReceiptStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/categories/breakdown', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const breakdown = await storage.getCategoryBreakdown(userId);
      res.json(breakdown);
    } catch (error) {
      console.error("Error fetching category breakdown:", error);
      res.status(500).json({ message: "Failed to fetch category breakdown" });
    }
  });

  // Categories routes
  app.get('/api/categories', async (req, res) => {
    try {
      const activeOnly = req.query.active !== 'false';
      const categories = await storage.getCategories(activeOnly);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Enhanced analytics routes
  app.get('/api/analytics/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { dateFrom, dateTo, groupBy } = req.query;
      
      const options: any = {};
      if (dateFrom) options.dateFrom = new Date(dateFrom as string);
      if (dateTo) options.dateTo = new Date(dateTo as string);
      if (groupBy) options.groupBy = groupBy as string;
      
      const analytics = await storage.getExpenseAnalytics(userId, options);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching expense analytics:", error);
      res.status(500).json({ message: "Failed to fetch expense analytics" });
    }
  });

  app.get('/api/analytics/vendors', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const topVendors = await storage.getTopVendors(userId, limit);
      res.json(topVendors);
    } catch (error) {
      console.error("Error fetching top vendors:", error);
      res.status(500).json({ message: "Failed to fetch top vendors" });
    }
  });

  app.get('/api/analytics/enhanced-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enhancedStats = await storage.getUserStats(userId);
      res.json(enhancedStats);
    } catch (error) {
      console.error("Error fetching enhanced stats:", error);
      res.status(500).json({ message: "Failed to fetch enhanced stats" });
    }
  });

  // Receipt items routes
  app.get('/api/receipts/:id/items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const receiptId = parseInt(req.params.id);
      
      const receipt = await storage.getReceiptWithItems(receiptId, userId);
      if (!receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      
      res.json(receipt);
    } catch (error) {
      console.error("Error fetching receipt with items:", error);
      res.status(500).json({ message: "Failed to fetch receipt with items" });
    }
  });

  // User activity route
  app.get('/api/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const activity = await storage.getUserActivity(userId, limit);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });

  // Subscription plans route
  app.get('/api/subscription-plans', async (req, res) => {
    try {
      const activeOnly = req.query.active !== 'false';
      const plans = await storage.getSubscriptionPlans(activeOnly);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  // Bulk operations
  app.delete('/api/receipts/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid receipt IDs provided" });
      }
      
      await storage.bulkDeleteReceipts(ids, userId);
      res.json({ message: `Successfully deleted ${ids.length} receipts` });
    } catch (error) {
      console.error("Error bulk deleting receipts:", error);
      res.status(500).json({ message: "Failed to bulk delete receipts" });
    }
  });

  // Enhanced receipts search route
  app.get('/api/receipts/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      } = req.query;

      const options: any = {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      if (category) options.category = category as string;
      if (vendor) options.vendor = vendor as string;
      if (dateFrom) options.dateFrom = new Date(dateFrom as string);
      if (dateTo) options.dateTo = new Date(dateTo as string);
      if (minAmount) options.minAmount = parseFloat(minAmount as string);
      if (maxAmount) options.maxAmount = parseFloat(maxAmount as string);
      if (status) options.status = status as string;
      if (search) options.search = search as string;

      const receipts = await storage.getReceipts(userId, options);
      res.json(receipts);
    } catch (error) {
      console.error("Error searching receipts:", error);
      res.status(500).json({ message: "Failed to search receipts" });
    }
  });

  // CSV export route
  app.get('/api/export/csv', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const csvData = await getUserReceiptsCSV(userId);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="expenses.csv"');
      res.send(csvData);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  // Stripe subscription route
  app.post('/api/get-or-create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user already has an active subscription
      if (user.stripeSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          
          if (subscription.status === 'active') {
            return res.json({
              subscriptionId: subscription.id,
              status: subscription.status,
              clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
            });
          }
        } catch (stripeError) {
          console.error("Error retrieving subscription:", stripeError);
          // Continue to create new subscription if existing one is invalid
        }
      }

      if (!user.email) {
        return res.status(400).json({ message: 'No user email on file' });
      }

      // Create or get Stripe customer
      let customer;
      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: process.env.STRIPE_PRICE_ID || 'price_1234567890', // This should be set by user
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with Stripe info
      await storage.updateUserStripeInfo(userId, customer.id, subscription.id);

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error("Subscription creation error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
