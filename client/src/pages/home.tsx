import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Receipt, 
  DollarSign, 
  Clock, 
  Tags, 
  Search, 
  Download,
  Crown,
  ChevronDown,
  Upload,
  Edit,
  Trash2,
  Utensils,
  Car,
  Clipboard,
  Laptop,
  Phone,
  Megaphone,
  Users,
  Heart,
  Briefcase,
  MoreHorizontal
} from "lucide-react";
import { UploadZone } from "@/components/ui/upload-zone";
import { StatsCard } from "@/components/ui/stats-card";
import { ReceiptCard } from "@/components/ui/receipt-card";
import { CategoryCard } from "@/components/ui/category-card";
import { EditReceiptModal } from "@/components/ui/edit-receipt-modal";
import { EnhancedStatsDashboard } from "@/components/ui/enhanced-stats-dashboard";
import { Link } from "wouter";

const categoryIcons = {
  meals: Utensils,
  travel: Car,
  office_supplies: Clipboard,
  equipment: Laptop,
  utilities: Phone,
  marketing: Megaphone,
  entertainment: Users,
  healthcare: Heart,
  professional_services: Briefcase,
  other: MoreHorizontal,
};

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [processingStatus, setProcessingStatus] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    retry: false,
  });

  // Fetch receipts
  const { data: receipts, isLoading: receiptsLoading } = useQuery({
    queryKey: ["/api/receipts"],
    retry: false,
  });

  // Fetch category breakdown
  const { data: categoryBreakdown, isLoading: categoryLoading } = useQuery({
    queryKey: ["/api/categories/breakdown"],
    retry: false,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return await apiRequest('POST', '/api/receipts', formData);
    },
    onSuccess: () => {
      setProcessingStatus("");
      toast({
        title: "Success",
        description: "Receipt processed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories/breakdown"] });
    },
    onError: (error) => {
      setProcessingStatus("");
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/receipts/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Receipt deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories/breakdown"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (files: FileList) => {
    const file = files[0];
    if (file) {
      setProcessingStatus("Processing receipt with AI...");
      uploadMutation.mutate(file);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/export/csv', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expenses.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "CSV exported successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export CSV",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const filteredReceipts = receipts?.filter(receipt =>
    receipt.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Receipt className="text-blue-600 w-8 h-8 mr-3" />
              <h1 className="text-xl font-bold text-slate-900">ExpenseAI</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-blue-600 px-3 py-2 text-sm font-medium">Dashboard</a>
              <Link href="/pricing" className="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                Pricing
              </Link>
              <a href="#" className="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Export</a>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  <Crown className="w-3 h-3 mr-1" />
                  Pro Plan
                </Badge>
              </div>
              <div className="relative">
                <Button 
                  variant="ghost"
                  className="flex items-center space-x-2 text-slate-700 hover:text-slate-900"
                  onClick={handleLogout}
                >
                  <img 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"} 
                    alt="User avatar" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden md:block text-sm font-medium">
                    {user?.firstName || user?.email || "User"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Dashboard */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Overview</h2>
            <p className="text-slate-600">Comprehensive analytics powered by our robust database architecture</p>
          </div>
          <EnhancedStatsDashboard />
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload New Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <UploadZone 
              onFileUpload={handleFileUpload}
              isUploading={uploadMutation.isPending}
            />
          </CardContent>
        </Card>

        {/* Processing Status */}
        {processingStatus && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-sm font-medium text-blue-900">{processingStatus}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Receipt Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Receipts</CardTitle>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search receipts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={handleExportCSV}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {receiptsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredReceipts.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No receipts yet</h3>
                <p className="text-slate-600">Upload your first receipt to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReceipts.map((receipt) => (
                  <ReceiptCard
                    key={receipt.id}
                    receipt={receipt}
                    onEdit={() => setEditingReceipt(receipt)}
                    onDelete={() => deleteMutation.mutate(receipt.id)}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="bg-slate-50">
                    <CardContent className="p-4">
                      <Skeleton className="h-8 w-full mb-2" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-2 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : categoryBreakdown?.length === 0 ? (
              <div className="text-center py-8">
                <Tags className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No categories yet. Upload receipts to see breakdown.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categoryBreakdown?.map((category) => {
                  const IconComponent = categoryIcons[category.category] || MoreHorizontal;
                  return (
                    <CategoryCard
                      key={category.category}
                      category={category.category}
                      count={category.count}
                      total={parseFloat(category.total)}
                      percentage={category.percentage}
                      icon={IconComponent}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-slate-200">
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
      </main>

      {/* Edit Receipt Modal */}
      {editingReceipt && (
        <EditReceiptModal
          receipt={editingReceipt}
          onClose={() => setEditingReceipt(null)}
          onSave={() => {
            setEditingReceipt(null);
            queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
            queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
            queryClient.invalidateQueries({ queryKey: ["/api/categories/breakdown"] });
          }}
        />
      )}
    </div>
  );
}
