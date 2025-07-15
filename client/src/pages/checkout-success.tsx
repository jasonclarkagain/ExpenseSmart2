import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Download, Receipt } from "lucide-react";

export default function CheckoutSuccess() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [planName, setPlanName] = useState<string>('');

  useEffect(() => {
    // Extract plan name from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan');
    if (plan) {
      setPlanName(plan);
    }
  }, [location]);

  const getPlanDisplayInfo = (planName: string) => {
    const planMap: Record<string, any> = {
      'free': { display: 'Free Plan', color: 'bg-slate-100 text-slate-800' },
      'monthly': { display: 'Pro Monthly', color: 'bg-blue-100 text-blue-800' },
      'quarterly': { display: 'Pro 3-Month', color: 'bg-green-100 text-green-800' },
      'semi-annual': { display: 'Pro 6-Month', color: 'bg-purple-100 text-purple-800' },
      'yearly': { display: 'Pro Annual', color: 'bg-orange-100 text-orange-800' },
      'triennial': { display: 'Pro 3-Year', color: 'bg-red-100 text-red-800' },
      'quinquennial': { display: 'Pro 5-Year', color: 'bg-indigo-100 text-indigo-800' },
      'lifetime': { display: 'Pro Lifetime', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' }
    };
    return planMap[planName] || { display: 'Pro Plan', color: 'bg-blue-100 text-blue-800' };
  };

  const planInfo = getPlanDisplayInfo(planName);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
          <p className="text-slate-600">Thank you for your purchase. Your subscription is now active.</p>
        </div>

        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <span>Welcome to</span>
              <Badge className={planInfo.color}>
                {planInfo.display}
              </Badge>
            </CardTitle>
            <CardDescription>
              Your ExpenseAI account has been upgraded successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-blue-800">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                    Start uploading unlimited receipts
                  </li>
                  <li className="flex items-center text-blue-800">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                    Access advanced AI categorization
                  </li>
                  <li className="flex items-center text-blue-800">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                    Export your data to CSV anytime
                  </li>
                  <li className="flex items-center text-blue-800">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                    View detailed expense analytics
                  </li>
                </ul>
              </div>

              {isAuthenticated && user?.email && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    <Receipt className="w-4 h-4 inline mr-2" />
                    Receipt & Confirmation
                  </h4>
                  <p className="text-sm text-slate-600">
                    A confirmation email has been sent to <strong>{user.email}</strong> with your receipt and subscription details.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Link href="/">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/pricing">
                    View All Plans
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                If you have any questions about your subscription or need assistance, we're here to help.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
                <Button variant="outline" size="sm">
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>
            Your subscription will automatically renew unless cancelled. 
            {planName === 'lifetime' && ' Lifetime access includes usage for the lifetime of the service.'}
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-12 py-6 border-t border-slate-200">
          <div className="text-center text-sm text-slate-600">
            <p>
              Made with ❤️ by{' '}
              <a 
                href="https://jason-clark.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Jason Clark
              </a>
              {' '}© 2025
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}