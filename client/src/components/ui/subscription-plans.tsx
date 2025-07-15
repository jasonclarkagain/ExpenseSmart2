import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Skeleton } from "./skeleton";
import { Check, Star, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionPlan {
  id: number;
  name: string;
  displayName: string;
  price: string;
  currency: string;
  billingPeriod: string;
  features: {
    features: string[];
    receipts_per_month: number;
    original_monthly_price?: string;
    discount_percentage?: number;
    savings_per_period?: string;
    equivalent_years?: number;
    note?: string;
  };
  stripePriceId: string | null;
  isActive: boolean;
  sortOrder: number;
}

export function SubscriptionPlans() {
  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const formatPrice = (price: string, period: string) => {
    const amount = parseFloat(price);
    if (amount === 0) return "Free";
    
    const periodMap = {
      monthly: "/month",
      quarterly: "/3 months", 
      "semi-annual": "/6 months",
      yearly: "/year",
      triennial: "/3 years",
      quinquennial: "/5 years",
      lifetime: " once"
    };
    
    return `$${amount.toFixed(2)}${periodMap[period as keyof typeof periodMap] || ""}`;
  };

  const calculateMonthlyEquivalent = (price: string, period: string) => {
    const amount = parseFloat(price);
    const periodMonths = {
      monthly: 1,
      quarterly: 3,
      "semi-annual": 6,
      yearly: 12,
      triennial: 36,
      quinquennial: 60,
      lifetime: 240 // 20 years equivalent
    };
    
    const months = periodMonths[period as keyof typeof periodMonths] || 1;
    return (amount / months).toFixed(2);
  };

  const getPlanIcon = (planName: string) => {
    if (planName.includes('lifetime')) return <Crown className="h-5 w-5" />;
    if (planName.includes('5year') || planName.includes('3year')) return <Sparkles className="h-5 w-5" />;
    if (planName.includes('yearly')) return <Star className="h-5 w-5" />;
    return null;
  };

  const getPlanVariant = (planName: string) => {
    if (planName.includes('lifetime')) return 'premium';
    if (planName.includes('yearly') || planName.includes('5year') || planName.includes('3year')) return 'popular';
    return 'default';
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Choose Your Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Save more with longer commitments. All plans include the same premium features.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans?.map((plan) => {
          const variant = getPlanVariant(plan.name);
          const monthlyEquivalent = calculateMonthlyEquivalent(plan.price, plan.billingPeriod);
          
          return (
            <Card 
              key={plan.id} 
              className={cn(
                "relative overflow-hidden transition-all duration-200 hover:shadow-lg",
                variant === 'premium' && "ring-2 ring-yellow-400 shadow-xl",
                variant === 'popular' && "ring-2 ring-blue-500 shadow-lg"
              )}
            >
              {/* Popular/Premium Badge */}
              {variant === 'popular' && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
                  <Star className="h-3 w-3 inline mr-1" />
                  POPULAR
                </div>
              )}
              {variant === 'premium' && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg">
                  <Crown className="h-3 w-3 inline mr-1" />
                  BEST VALUE
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getPlanIcon(plan.name)}
                  <CardTitle className="text-lg">{plan.displayName}</CardTitle>
                </div>
                
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {formatPrice(plan.price, plan.billingPeriod)}
                  </div>
                  
                  {plan.features.discount_percentage && (
                    <div className="space-y-1">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        {plan.features.discount_percentage}% OFF
                      </Badge>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ${monthlyEquivalent}/month equivalent
                      </div>
                      {plan.features.savings_per_period && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Save ${plan.features.savings_per_period}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.features.note && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic border-t pt-2">
                    * {plan.features.note}
                  </div>
                )}

                <Button 
                  className={cn(
                    "w-full",
                    variant === 'premium' && "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
                    variant === 'popular' && "bg-blue-600 hover:bg-blue-700",
                    plan.name === 'free' && "bg-gray-600 hover:bg-gray-700"
                  )}
                  disabled={plan.name === 'free'}
                >
                  {plan.name === 'free' ? 'Current Plan' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Terms and Conditions */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1 border-t pt-4">
        <p>All plans include a 30-day money-back guarantee.</p>
        <p>Prices in USD. Taxes may apply based on your location.</p>
        <p className="italic">
          * Lifetime access is valid for the operational lifetime of the application. 
          See Terms of Service for complete details.
        </p>
      </div>
    </div>
  );
}