import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "emerald" | "amber" | "purple";
  isLoading?: boolean;
}

const colorClasses = {
  blue: "text-blue-600",
  emerald: "text-emerald-600",
  amber: "text-amber-600",
  purple: "text-purple-600",
};

export function StatsCard({ title, value, icon: Icon, color, isLoading = false }: StatsCardProps) {
  return (
    <Card className="stats-card">
      <CardContent className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={cn("w-8 h-8", colorClasses[color])} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
