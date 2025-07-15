import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Edit, Trash2, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface Receipt {
  id: number;
  vendor: string;
  amount: string;
  date: string;
  category: string;
  description?: string;
  confidence?: number;
}

interface ReceiptCardProps {
  receipt: Receipt;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const categoryColors = {
  meals: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  travel: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  office_supplies: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  equipment: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  utilities: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  marketing: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  entertainment: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  healthcare: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  professional_services: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export function ReceiptCard({ receipt, onEdit, onDelete, isDeleting = false }: ReceiptCardProps) {
  const categoryColor = categoryColors[receipt.category as keyof typeof categoryColors] || categoryColors.other;
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return isNaN(num) ? amount : `$${num.toFixed(2)}`;
  };

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {receipt.vendor}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">
                  {formatDate(receipt.date)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={onEdit}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600"></div>
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span className="text-lg font-bold text-emerald-600">
              {formatCurrency(receipt.amount)}
            </span>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary" 
              className={cn("text-xs", categoryColor)}
            >
              {receipt.category.replace('_', ' ')}
            </Badge>
            
            {receipt.confidence && (
              <div className="text-xs text-gray-500">
                {Math.round(receipt.confidence * 100)}% confidence
              </div>
            )}
          </div>

          {/* Description */}
          {receipt.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {receipt.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}