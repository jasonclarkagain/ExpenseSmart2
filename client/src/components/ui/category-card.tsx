import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: string;
  count: number;
  total: number;
  percentage: number;
  icon: LucideIcon;
}

const categoryColors = {
  meals: "text-blue-600 bg-blue-600",
  travel: "text-purple-600 bg-purple-600",
  office_supplies: "text-green-600 bg-green-600",
  equipment: "text-amber-600 bg-amber-600",
  utilities: "text-indigo-600 bg-indigo-600",
  marketing: "text-pink-600 bg-pink-600",
  entertainment: "text-yellow-600 bg-yellow-600",
  healthcare: "text-red-600 bg-red-600",
  professional_services: "text-teal-600 bg-teal-600",
  other: "text-gray-600 bg-gray-600",
};

export function CategoryCard({ category, count, total, percentage, icon: Icon }: CategoryCardProps) {
  const colorClasses = categoryColors[category] || categoryColors.other;
  const [textColor, bgColor] = colorClasses.split(" ");

  const getCategoryDisplayName = (category: string) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Icon className={cn("w-5 h-5 mr-2", textColor)} />
            <span className="font-medium text-slate-900">
              {getCategoryDisplayName(category)}
            </span>
          </div>
          <span className="text-sm text-slate-600">{count}</span>
        </div>
        <div className="text-lg font-semibold text-slate-900 mb-2">
          ${total.toFixed(2)}
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className={cn("h-2 rounded-full", bgColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
