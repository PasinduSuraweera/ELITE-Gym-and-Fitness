"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CreditCard, MapPin, Package, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const CheckoutPage = () => {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.fullName || "",
    email: user?.emailAddresses?.[0]?.emailAddress || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "Sri Lanka",
  });

  const cartItems = useQuery(
    api.cart.getUserCart,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const cartSummary = useQuery(
    api.cart.getCartSummary,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const handleInputChange = (field: string, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const calculateShipping = (subtotal: number) => {
    if (subtotal >= 10000) return 0; // Free shipping over LKR 10,000
    
    const colomboAreas = ["colombo", "dehiwala", "mount lavinia", "nugegoda", "maharagama", "kotte"];
    if (colomboAreas.some(area => shippingAddress.city.toLowerCase().includes(area))) {
      return 500;
    }
    
    const majorCities = ["kandy", "galle", "jaffna", "negombo", "kurunegala", "ratnapura"];
    if (majorCities.some(cityName => shippingAddress.city.toLowerCase().includes(cityName))) {
      return 750;
    }
    
    return 1000; // Remote areas
  };

  const calculateTax = (subtotal: number) => {
    return Math.round(subtotal * 0.18); // 18% VAT
  };

  const handleCheckout = async () => {
    if (!user?.id || !cartItems || cartItems.length === 0) return;

    // Validate shipping address
    const requiredFields = ['name', 'phone', 'addressLine1', 'city', 'postalCode'];
    const missingFields = requiredFields.filter(field => 
      !shippingAddress[field as keyof typeof shippingAddress]?.trim()
    );

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/create-marketplace-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerkId: user.id,
          cartItems,
          shippingAddress,
          returnUrl: `${window.location.origin}/marketplace/checkout/success`,
          cancelUrl: `${window.location.origin}/marketplace/cart`,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to process checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(price);
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
          <div className="text-center">
            <CreditCard className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Sign In Required</h1>
            <p className="text-gray-400 mb-6">Please sign in to proceed with checkout</p>
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Your cart is empty</h1>
            <p className="text-gray-400 mb-6">Add some items to your cart to proceed with checkout</p>
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link href="/marketplace">Continue Shopping</Link>
            </Button>
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
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="outline" asChild className="mr-4 border-gray-700 text-white hover:bg-gray-800">
            <Link href="/marketplace/cart">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              <span className="text-red-500">Secure</span> Checkout
            </h1>
            <p className="text-gray-400">Complete your order safely and securely</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-500" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <Input
                      value={shippingAddress.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <Input
                      value={shippingAddress.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="your@email.com"
                      type="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    value={shippingAddress.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="+94 77 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address Line 1 *
                  </label>
                  <Input
                    value={shippingAddress.addressLine1}
                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address Line 2
                  </label>
                  <Input
                    value={shippingAddress.addressLine2}
                    onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City *
                    </label>
                    <Input
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Colombo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Postal Code *
                    </label>
                    <Input
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="00100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country
                  </label>
                  <Input
                    value={shippingAddress.country}
                    className="bg-gray-800 border-gray-600 text-white"
                    disabled
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Items */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Package className="h-5 w-5 mr-2 text-red-500" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center space-x-3 py-2">
                    <div className="w-12 h-12 bg-gray-800 rounded overflow-hidden flex-shrink-0">
                      {item.product?.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{item.product?.name}</p>
                      <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-white text-sm font-medium">
                      {formatPrice(item.priceAtTime * item.quantity)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="pt-6 space-y-4">
                {cartSummary && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">{formatPrice(cartSummary.totalPrice)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Shipping</span>
                      <span className="text-white">
                        {calculateShipping(cartSummary.totalPrice) === 0 ? 
                          "Free" : 
                          formatPrice(calculateShipping(cartSummary.totalPrice))
                        }
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tax (VAT 18%)</span>
                      <span className="text-white">{formatPrice(calculateTax(cartSummary.totalPrice))}</span>
                    </div>
                    
                    <hr className="border-gray-700" />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-white">
                        {formatPrice(
                          cartSummary.totalPrice + 
                          calculateShipping(cartSummary.totalPrice) + 
                          calculateTax(cartSummary.totalPrice)
                        )}
                      </span>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-4">
                      <div className="flex items-center text-green-400 text-sm">
                        <Shield className="h-4 w-4 mr-2" />
                        Secure payment powered by Stripe
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 text-lg"
                    >
                      {isProcessing ? (
                        "Processing..."
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" />
                          Complete Order - {formatPrice(
                            cartSummary.totalPrice + 
                            calculateShipping(cartSummary.totalPrice) + 
                            calculateTax(cartSummary.totalPrice)
                          )}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
