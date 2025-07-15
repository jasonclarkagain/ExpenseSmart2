import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Receipt {
  id: number;
  vendor: string;
  amount: string;
  date: string;
  category: string;
  description?: string;
  imageUrl?: string;
}

interface ReceiptCardProps {
  receipt: Receipt;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function ReceiptCard({ receipt, onEdit, onDelete, isDeleting = false }: ReceiptCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: string) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getCategoryDisplayName = (category: string) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="expense-card">
      <div className="aspect-w-16 aspect-h-12 bg-slate-100">
        {receipt.imageUrl ? (
          <img 
            src={receipt.imageUrl} 
            alt="Receipt" 
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-slate-100 flex items-center justify-center">
            <span className="text-slate-400">No image</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-slate-900">{receipt.vendor}</h3>
            <p className="text-sm text-slate-600">{formatDate(receipt.date)}</p>
          </div>
          <span className="text-lg font-semibold text-slate-900">
            {formatAmount(receipt.amount)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <Badge className={cn("category-badge", `category-${receipt.category}`)}>
            {getCategoryDisplayName(receipt.category)}
          </Badge>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-slate-400 hover:text-blue-600"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting}
              className="text-slate-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {receipt.description && (
          <p className="text-sm text-slate-600 mt-2 truncate">
            {receipt.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
