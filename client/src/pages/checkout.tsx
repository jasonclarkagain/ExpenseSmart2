import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, CheckCircle } from "lucide-react";
import { Link } from "wouter";

// Load Stripe outside of component render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  planDetails: any;
  clientSecret: string;
  paymentType: 'subscription' | 'payment_intent';
}

const CheckoutForm = ({ planDetails, clientSecret, paymentType }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?plan=${planDetails.name}`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-slate-50 rounded-lg">
        <PaymentElement 
          options={{
            layout: "tabs"
          }}
        />
      </div>
      
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setLocation('/pricing')}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pricing
        </Button>
        
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Processing...
            </div>
          ) : (
            <div className="flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              {paymentType === 'subscription' ? 'Subscribe Now' : 'Complete Payment'}
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};

export default function Checkout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute('/checkout/:planId');
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [paymentType, setPaymentType] = useState<'subscription' | 'payment_intent'>('subscription');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with your purchase.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }

    if (isAuthenticated && params?.planId) {
      initializePayment();
    }
  }, [isAuthenticated, isLoading, params?.planId]);

  const initializePayment = async () => {
    try {
      setLoading(true);
      
      // Get plan details
      const plansResponse = await apiRequest("GET", "/api/subscription-plans");
      const plans = await plansResponse.json();
      const plan = plans.find((p: any) => p.id === parseInt(params!.planId));
      
      if (!plan) {
        toast({
          title: "Plan Not Found",
          description: "The selected subscription plan could not be found.",
          variant: "destructive",
        });
        setLocation('/pricing');
        return;
      }
      
      setPlanDetails(plan);

      // Create subscription/payment intent
      const response = await apiRequest("POST", "/api/create-subscription", {
        planId: parseInt(params!.planId)
      });
      
      const data = await response.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setPaymentType(data.type || 'subscription');
      } else if (data.status === "active") {
        toast({
          title: "Already Subscribed",
          description: `You already have an active ${plan.displayName} subscription.`,
        });
        setLocation('/');
        return;
      }
    } catch (error: any) {
      console.error("Error initializing payment:", error);
      toast({
        title: "Setup Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setLocation('/pricing');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600">Setting up your payment...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret || !planDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Payment Setup Failed</CardTitle>
            <CardDescription>
              Unable to initialize payment for this plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation('/pricing')}
              className="w-full"
            >
              Return to Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(price));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Purchase</h1>
          <p className="text-slate-600">Secure payment powered by Stripe</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{planDetails.displayName}</span>
                {planDetails.name === 'lifetime' && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Best Value
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {paymentType === 'subscription' ? 'Recurring subscription' : 'One-time payment'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-slate-900">
                    {formatPrice(planDetails.price)}
                  </div>
                  <div className="text-sm text-slate-600">
                    {planDetails.billingPeriod === 'lifetime' ? 'One-time payment' : `per ${planDetails.billingPeriod.replace('ly', '')}`}
                  </div>
                </div>

                {planDetails.originalPrice && parseFloat(planDetails.originalPrice) > parseFloat(planDetails.price) && (
                  <div className="text-center py-2 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-800">
                      <span className="line-through text-slate-500">
                        {formatPrice(planDetails.originalPrice)}
                      </span>
                      <span className="ml-2 font-semibold">
                        Save {formatPrice((parseFloat(planDetails.originalPrice) - parseFloat(planDetails.price)).toString())}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900">Included Features:</h4>
                  <ul className="space-y-1">
                    {planDetails.features.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>
                Your payment information is secure and encrypted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements 
                stripe={stripePromise} 
                options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#2563eb',
                    }
                  }
                }}
              >
                <CheckoutForm 
                  planDetails={planDetails}
                  clientSecret={clientSecret}
                  paymentType={paymentType}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-slate-600">
          <p>
            By completing this purchase, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
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