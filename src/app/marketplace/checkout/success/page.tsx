"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import Link from "next/link";

const CheckoutSuccessPage = () => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      // In a real app, you'd fetch order details using the session ID
      // For now, we'll show a success message
      setLoading(false);
    }
  }, [sessionId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Processing your order...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Order <span className="text-green-500">Confirmed!</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Thank you for your purchase. Your order has been successfully placed and will be processed shortly.
            </p>
          </div>

          {/* Order Confirmation Card */}
          <Card className="bg-gray-900/50 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Package className="h-5 w-5 mr-2 text-red-500" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Order ID</p>
                  <p className="text-white font-mono">{sessionId?.slice(-8) || "PROCESSING"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Payment Status</p>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <p className="text-green-500 font-medium">Paid</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <p className="text-gray-400 text-sm mb-2">What happens next?</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Order confirmation email sent to {user?.emailAddresses?.[0]?.emailAddress}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    Processing and preparation (1-2 business days)
                  </div>
                  <div className="flex items-center text-gray-300">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    Shipping and delivery (3-7 business days)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card className="bg-gray-900/50 border-gray-700 mb-8">
            <CardContent className="pt-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="text-blue-400 font-medium mb-2">📦 Delivery Information</h3>
                <p className="text-gray-300 text-sm">
                  Your order will be delivered to the address you provided during checkout. 
                  You'll receive tracking information via email once your order ships.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link href="/profile">
                <Package className="h-4 w-4 mr-2" />
                View Order History
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="border-gray-600 text-white hover:bg-gray-700">
              <Link href="/marketplace">
                Continue Shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="border-gray-600 text-white hover:bg-gray-700">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Contact Support */}
          <div className="text-center mt-8 pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm mb-2">
              Need help with your order?
            </p>
            <Button variant="link" asChild className="text-red-500 hover:text-red-400">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
