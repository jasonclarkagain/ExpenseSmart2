import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, Zap, FileText, Shield, DollarSign, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Receipt className="text-blue-600 w-8 h-8 mr-3" />
              <h1 className="text-xl font-bold text-slate-900">ExpenseAI</h1>
            </div>
            <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Smart Receipt Analysis
            <span className="text-blue-600"> for Business</span>
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Transform your expense management with AI-powered receipt analysis. 
            Upload photos, get instant categorization, and export to CSV for your accounting software.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Everything you need to manage expenses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Zap className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>AI-Powered Analysis</CardTitle>
                <CardDescription>
                  Advanced OCR and machine learning extract vendor, amount, date, and category automatically
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <FileText className="w-10 h-10 text-green-600 mb-2" />
                <CardTitle>Smart Categorization</CardTitle>
                <CardDescription>
                  Automatically categorize expenses into meals, travel, office supplies, and more
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <DollarSign className="w-10 h-10 text-amber-600 mb-2" />
                <CardTitle>CSV Export</CardTitle>
                <CardDescription>
                  Export your categorized expenses to CSV for seamless accounting software integration
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Receipt className="w-10 h-10 text-purple-600 mb-2" />
                <CardTitle>Mobile-First</CardTitle>
                <CardDescription>
                  Capture receipts on-the-go with our responsive mobile interface
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 text-red-600 mb-2" />
                <CardTitle>Secure Storage</CardTitle>
                <CardDescription>
                  Your receipt data is encrypted and stored securely with enterprise-grade security
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="w-10 h-10 text-indigo-600 mb-2" />
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Share expense reports and collaborate with your team or accountant
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Simple, Transparent Pricing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-3xl font-bold text-slate-900 mt-4">
                  $0<span className="text-lg font-normal text-slate-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    10 receipts per month
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Basic categorization
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    CSV export
                  </li>
                </ul>
                <Button 
                  className="w-full mt-6" 
                  variant="outline"
                  onClick={handleLogin}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-blue-600">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  Pro 
                  <span className="ml-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                    Popular
                  </span>
                </CardTitle>
                <CardDescription>For serious expense management</CardDescription>
                <div className="text-3xl font-bold text-slate-900 mt-4">
                  $7.99<span className="text-lg font-normal text-slate-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Unlimited receipts
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Advanced AI categorization
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Bulk CSV export
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Analytics dashboard
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 mr-2">✓</span>
                    Priority support
                  </li>
                </ul>
                <Button 
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
                  onClick={handleLogin}
                >
                  Start Pro Trial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Receipt className="text-blue-400 w-6 h-6 mr-2" />
              <span className="text-lg font-semibold">ExpenseAI</span>
            </div>
            <div className="text-slate-400">
              © 2024 ExpenseAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
