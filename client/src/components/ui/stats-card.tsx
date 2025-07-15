import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string;
    type: "increase" | "decrease" | "neutral";
  };
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, change, className }: StatsCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {change && (
              <p className={`text-sm mt-1 ${
                change.type === "increase" ? "text-green-600" :
                change.type === "decrease" ? "text-red-600" :
                "text-slate-600"
              }`}>
                {change.value}
              </p>
            )}
          </div>
          <Icon className="w-8 h-8 text-slate-500" />
        </div>
      </CardContent>
    </Card>
  );
}