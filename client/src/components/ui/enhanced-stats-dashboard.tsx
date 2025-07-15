import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { StatsCard } from "./stats-card";
import { CategoryCard } from "./category-card";
import { Badge } from "./badge";
import { Skeleton } from "./skeleton";
import { 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Users,
  Activity,
  Clock
} from "lucide-react";

interface EnhancedStats {
  totalReceipts: number;
  totalAmount: string;
  avgAmount: string;
  thisMonth: string;
  lastMonth: string;
  categories: number;
  receiptsThisWeek: number;
}

interface CategoryBreakdown {
  category: string;
  count: number;
  total: string;
  percentage: number;
  avgAmount: string;
}

interface TopVendor {
  vendor: string;
  totalAmount: string;
  receiptCount: number;
  avgAmount: string;
}

export function EnhancedStatsDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<EnhancedStats>({
    queryKey: ["/api/analytics/enhanced-stats"],
  });

  const { data: categoryBreakdown, isLoading: categoryLoading } = useQuery<CategoryBreakdown[]>({
    queryKey: ["/api/categories/breakdown"],
  });

  const { data: topVendors, isLoading: vendorsLoading } = useQuery<TopVendor[]>({
    queryKey: ["/api/analytics/vendors"],
  });

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-20 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const monthlyChange = stats ? 
    ((parseFloat(stats.thisMonth) - parseFloat(stats.lastMonth)) / Math.max(parseFloat(stats.lastMonth), 1)) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Receipts"
          value={stats?.totalReceipts || 0}
          icon={Receipt}
          color="blue"
          isLoading={statsLoading}
        />
        <StatsCard
          title="Total Amount"
          value={`$${stats?.totalAmount || "0"}`}
          icon={DollarSign}
          color="emerald"
          isLoading={statsLoading}
        />
        <StatsCard
          title="This Month"
          value={`$${stats?.thisMonth || "0"}`}
          icon={Calendar}
          color="amber"
          isLoading={statsLoading}
        />
        <StatsCard
          title="Categories Used"
          value={stats?.categories || 0}
          icon={BarChart3}
          color="purple"
          isLoading={statsLoading}
        />
      </div>

      {/* Enhanced Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Receipt</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.avgAmount || "0"}</div>
            <p className="text-xs text-muted-foreground">
              Per receipt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.receiptsThisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">
              Receipts added
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Change</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyChange > 0 ? "+" : ""}{monthlyChange.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              From last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown?.slice(0, 6).map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium capitalize">
                        {category.category.replace('_', ' ')}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${category.total}</div>
                      <div className="text-xs text-muted-foreground">
                        {category.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Vendors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vendorsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {topVendors?.slice(0, 6).map((vendor) => (
                  <div key={vendor.vendor} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium truncate max-w-[120px]">
                        {vendor.vendor}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {vendor.receiptCount}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${vendor.totalAmount}</div>
                      <div className="text-xs text-muted-foreground">
                        Avg: ${vendor.avgAmount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}