import type { Express } from "express";
import express from "express";
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

// Helper functions for Stripe billing periods
function getStripeInterval(billingPeriod: string): 'day' | 'week' | 'month' | 'year' {
  switch (billingPeriod) {
    case 'monthly':
    case 'quarterly':
    case 'semi-annual':
      return 'month';
    case 'yearly':
    case 'triennial':
    case 'quinquennial':
      return 'year';
    default:
      return 'month';
  }
}

function getIntervalCount(billingPeriod: string): number {
  switch (billingPeriod) {
    case 'monthly':
      return 1;
    case 'quarterly':
      return 3;
    case 'semi-annual':
      return 6;
    case 'yearly':
      return 1;
    case 'triennial':
      return 3;
    case 'quinquennial':
      return 5;
    default:
      return 1;
  }
}

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

  // Enhanced Stripe subscription routes for multiple plans
  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { planId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }
      
      let user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get the subscription plan
      const plan = await storage.getSubscriptionPlanById(planId);
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }

      // Handle free plan
      if (plan.name === 'free') {
        return res.json({ 
          message: "Free plan activated",
          plan: plan.name,
          status: "active"
        });
      }

      // Check if user already has an active subscription
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        if (subscription.status === 'active') {
          return res.json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
            status: subscription.status
          });
        }
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || '',
          name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email || '',
          metadata: {
            userId: userId,
            planName: plan.name
          }
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(userId, customerId, '');
      }

      // Handle one-time payments (lifetime)
      if (plan.billingPeriod === 'lifetime') {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(parseFloat(plan.price) * 100),
          currency: plan.currency.toLowerCase(),
          customer: customerId,
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            userId: userId,
            planId: planId.toString(),
            planName: plan.name,
            type: 'lifetime'
          }
        });

        return res.json({
          clientSecret: paymentIntent.client_secret,
          type: 'payment_intent',
          planName: plan.name
        });
      }

      // Create recurring subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: plan.displayName,
              description: `${plan.displayName} - ${plan.features.features.join(', ')}`
            },
            unit_amount: Math.round(parseFloat(plan.price) * 100),
            recurring: {
              interval: getStripeInterval(plan.billingPeriod),
              interval_count: getIntervalCount(plan.billingPeriod)
            }
          }
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: userId,
          planId: planId.toString(),
          planName: plan.name
        }
      });

      // Update user with subscription info
      await storage.updateUserStripeInfo(userId, customerId, subscription.id);

      // Log user activity
      await storage.logUserActivity({
        userId: userId,
        action: 'subscription_created',
        details: `Created subscription for ${plan.displayName}`,
        metadata: { planId, subscriptionId: subscription.id }
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        type: 'subscription',
        planName: plan.name
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      res.status(400).json({ error: { message: error.message } });
    }
  });

  // Legacy route for backward compatibility
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

  // Stripe webhook endpoint for handling payment events
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      console.log('Stripe webhook secret not configured');
      return res.status(400).send('Webhook secret not configured');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          const userId = paymentIntent.metadata?.userId;
          const planName = paymentIntent.metadata?.planName;
          
          if (userId && planName) {
            await storage.logUserActivity({
              userId,
              action: 'payment_completed',
              details: `Payment completed for ${planName} plan`,
              metadata: { 
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                planName 
              }
            });
            console.log(`Payment succeeded for user ${userId}, plan ${planName}`);
          }
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object;
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const subUserId = subscription.metadata?.userId;
          const subPlanName = subscription.metadata?.planName;
          
          if (subUserId && subPlanName) {
            await storage.logUserActivity({
              userId: subUserId,
              action: 'subscription_payment_succeeded',
              details: `Subscription payment succeeded for ${subPlanName} plan`,
              metadata: { 
                subscriptionId: subscription.id,
                invoiceId: invoice.id,
                amount: invoice.amount_paid,
                planName: subPlanName 
              }
            });
            console.log(`Subscription payment succeeded for user ${subUserId}, plan ${subPlanName}`);
          }
          break;

        case 'customer.subscription.deleted':
          const deletedSub = event.data.object;
          const delUserId = deletedSub.metadata?.userId;
          
          if (delUserId) {
            await storage.updateUserStripeInfo(delUserId, '', '');
            await storage.logUserActivity({
              userId: delUserId,
              action: 'subscription_cancelled',
              details: 'Subscription cancelled',
              metadata: { subscriptionId: deletedSub.id }
            });
            console.log(`Subscription cancelled for user ${delUserId}`);
          }
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Error handling webhook:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Route to get user's current subscription status
  app.get('/api/subscription/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let subscriptionStatus = {
        hasActiveSubscription: false,
        plan: 'free',
        status: 'inactive',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      };

      if (user.stripeSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          subscriptionStatus = {
            hasActiveSubscription: subscription.status === 'active',
            plan: subscription.metadata?.planName || 'unknown',
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          };
        } catch (stripeError) {
          console.error('Error retrieving subscription from Stripe:', stripeError);
        }
      }

      res.json(subscriptionStatus);
    } catch (error: any) {
      console.error('Error getting subscription status:', error);
      res.status(500).json({ message: 'Failed to get subscription status' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
