import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Calendar, DollarSign, Store } from "lucide-react";

interface ReceiptCardProps {
  receipt: {
    id: number;
    vendor: string;
    amount: string;
    date: string;
    category: string;
    description?: string;
    confidence?: number;
  };
  onEdit: (receipt: any) => void;
  onDelete: (id: number) => void;
}

export function ReceiptCard({ receipt, onEdit, onDelete }: ReceiptCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "text-slate-500";
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Store className="w-4 h-4 text-slate-500" />
              <h3 className="font-semibold text-slate-900 truncate">{receipt.vendor}</h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span className="font-medium">${receipt.amount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(receipt.date)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(receipt)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(receipt.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {receipt.category}
          </Badge>
          {receipt.confidence && (
            <span className={`text-xs font-medium ${getConfidenceColor(receipt.confidence)}`}>
              {Math.round(receipt.confidence * 100)}% confidence
            </span>
          )}
        </div>

        {receipt.description && (
          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
            {receipt.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}