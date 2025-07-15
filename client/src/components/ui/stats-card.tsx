import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "blue" | "emerald" | "amber" | "purple" | "red" | "indigo";
  isLoading?: boolean;
  trend?: {
    value: number;
    label: string;
  };
}

const colorVariants = {
  blue: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
  emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
  amber: "text-amber-600 bg-amber-50 dark:bg-amber-950/50",
  purple: "text-purple-600 bg-purple-50 dark:bg-purple-950/50",
  red: "text-red-600 bg-red-50 dark:bg-red-950/50",
  indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50",
};

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color = "blue", 
  isLoading = false,
  trend 
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", colorVariants[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={cn(
            "text-xs",
            trend.value > 0 ? "text-emerald-600" : trend.value < 0 ? "text-red-600" : "text-muted-foreground"
          )}>
            {trend.value > 0 ? "+" : ""}{trend.value.toFixed(1)}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}