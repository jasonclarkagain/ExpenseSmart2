import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionPlans } from "@/components/ui/subscription-plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, ArrowLeft, Crown, Star, Sparkles, Check } from "lucide-react";
import { Link } from "wouter";

export default function Pricing() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Optional: Don't redirect - allow anyone to view pricing

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Receipt className="text-blue-600 w-8 h-8 mr-3" />
              <h1 className="text-xl font-bold text-slate-900">ExpenseAI</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              {isAuthenticated && (
                <Link href="/" className="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                  Dashboard
                </Link>
              )}
              <a href="#" className="text-blue-600 px-3 py-2 text-sm font-medium">Pricing</a>
              {isAuthenticated && (
                <a href="#" className="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Export</a>
              )}
            </nav>
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <>
                  <div className="hidden md:flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                      <Crown className="w-3 h-3 mr-1" />
                      Pro Plan
                    </Badge>
                  </div>
                  <div className="relative">
                    <Button 
                      variant="ghost"
                      className="flex items-center space-x-2 text-slate-700 hover:text-slate-900"
                      onClick={() => window.location.href = "/api/logout"}
                    >
                      <img 
                        src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"} 
                        alt="User avatar" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="hidden md:block text-sm font-medium">
                        {user?.firstName || user?.email || "User"}
                      </span>
                    </Button>
                  </div>
                </>
              )}
              {!isAuthenticated && (
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Dashboard */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Pricing Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Choose the plan that works best for you. Save more with longer commitments.
          </p>
          
          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Advanced OpenAI GPT-4o vision model for accurate receipt processing
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Comprehensive Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Detailed expense tracking with category breakdowns and trends
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Crown className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Professional Features</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  CSV exports, bulk operations, and priority support
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Subscription Plans */}
        <SubscriptionPlans />

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change my plan anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What does "lifetime" mean?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Lifetime access is valid for the operational lifetime of ExpenseAI. 
                  See our Terms of Service for complete details.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes, we offer a 30-day money-back guarantee on all paid plans. 
                  Contact support for assistance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Are there any hidden fees?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  No hidden fees. Prices shown are in USD and taxes may apply based on your location.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Need Help Choosing?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Our team is here to help you find the perfect plan for your needs.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}