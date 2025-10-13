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
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
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

  const validateSriLankanPhone = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's exactly 10 digits and starts with 0, or 9 digits without 0 (mobile)
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      // Valid formats: 070xxxxxxx, 071xxxxxxx, 072xxxxxxx, 074xxxxxxx, 075xxxxxxx, 076xxxxxxx, 077xxxxxxx, 078xxxxxxx
      const mobileRegex = /^0(70|71|72|74|75|76|77|78)\d{7}$/;
      // Valid landline formats: 011xxxxxxx (Colombo), 081xxxxxxx (Kandy), etc.
      const landlineRegex = /^0(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|91)\d{7}$/;
      
      return mobileRegex.test(cleaned) || landlineRegex.test(cleaned);
    }
    
    return false;
  };

  const validateEmail = (email: string) => {
    // Trim whitespace
    email = email.trim();
    
    // Basic format check - must contain @ and at least one dot after @
    if (!email.includes('@')) return false;
    
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    
    const [localPart, domain] = parts;
    
    // Local part checks
    if (localPart.length === 0 || localPart.length > 64) return false;
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    if (localPart.includes('..')) return false;
    
    // Domain must contain at least one dot (for TLD)
    if (!domain.includes('.')) return false;
    
    // Domain checks
    if (domain.length === 0 || domain.length > 255) return false;
    if (domain.startsWith('.') || domain.endsWith('.')) return false;
    if (domain.startsWith('-') || domain.endsWith('-')) return false;
    
    // Check for valid TLD (at least 2 characters after the last dot)
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) return false;
    
    // Comprehensive email validation regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phone') {
      // Clear previous error when user starts typing
      setPhoneError("");
      
      // Format phone number as user types (add spaces for readability)
      let formattedValue = value.replace(/\D/g, ''); // Remove non-digits
      if (formattedValue.length > 0) {
        if (formattedValue.length <= 3) {
          formattedValue = formattedValue;
        } else if (formattedValue.length <= 6) {
          formattedValue = `${formattedValue.slice(0, 3)} ${formattedValue.slice(3)}`;
        } else if (formattedValue.length <= 10) {
          formattedValue = `${formattedValue.slice(0, 3)} ${formattedValue.slice(3, 6)} ${formattedValue.slice(6)}`;
        } else {
          formattedValue = `${formattedValue.slice(0, 3)} ${formattedValue.slice(3, 6)} ${formattedValue.slice(6, 10)}`;
        }
      }
      
      // Validate phone number
      if (formattedValue.replace(/\s/g, '').length >= 10) {
        if (!validateSriLankanPhone(formattedValue)) {
          setPhoneError("Please enter a valid Sri Lankan phone number (10 digits starting with 0)");
        }
      }
      
      setShippingAddress(prev => ({ ...prev, [field]: formattedValue }));
    } else if (field === 'email') {
      // Clear previous error when user starts typing
      setEmailError("");
      
      // Validate email format as user types
      if (value.length > 0) {
        if (!value.includes('@')) {
          setEmailError("Email must contain @");
        } else if (value.includes('@') && !value.includes('.')) {
          setEmailError("Email must include a domain (e.g., gmail.com)");
        } else if (value.includes('@') && value.includes('.')) {
          if (!validateEmail(value)) {
            setEmailError("Please enter a valid email address (e.g., name@gmail.com)");
          }
        }
      }
      
      setShippingAddress(prev => ({ ...prev, [field]: value }));
    } else {
      setShippingAddress(prev => ({ ...prev, [field]: value }));
    }
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
    const requiredFields = ['name', 'email', 'phone', 'addressLine1', 'city', 'postalCode'];
    const missingFields = requiredFields.filter(field => 
      !shippingAddress[field as keyof typeof shippingAddress]?.trim()
    );

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate email format
    if (!validateEmail(shippingAddress.email)) {
      setEmailError("Please enter a valid email address (e.g., name@gmail.com)");
      return;
    }

    // Validate phone number format
    if (!validateSriLankanPhone(shippingAddress.phone)) {
      setPhoneError("Please enter a valid Sri Lankan phone number (10 digits starting with 0)");
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
      <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
          <div className="text-center">
            <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">Please sign in to proceed with checkout</p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
          <div className="text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some items to your cart to proceed with checkout</p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/marketplace">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1)_0%,transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="outline" asChild className="mr-4 border-border text-foreground hover:bg-accent">
            <Link href="/marketplace/cart">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              <span className="text-primary">Secure</span> Checkout
            </h1>
            <p className="text-muted-foreground">Complete your order safely and securely</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <div className="space-y-6">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <Input
                      value={shippingAddress.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-background border-border text-foreground"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <Input
                      value={shippingAddress.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`bg-background border-border text-foreground ${emailError ? "border-red-500" : ""}`}
                      placeholder="your@email.com"
                      type="email"
                      required
                    />
                    {emailError && (
                      <p className="text-red-500 text-xs mt-1">{emailError}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number *
                  </label>
                  <Input
                    value={shippingAddress.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`bg-background border-border text-foreground ${phoneError ? "border-red-500" : ""}`}
                    placeholder="077 123 4567"
                  />
                  {phoneError && (
                    <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Address Line 1 *
                  </label>
                  <Input
                    value={shippingAddress.addressLine1}
                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Address Line 2
                  </label>
                  <Input
                    value={shippingAddress.addressLine2}
                    onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                    className="bg-background border-border text-foreground"
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      City *
                    </label>
                    <Input
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="bg-background border-border text-foreground"
                      placeholder="Colombo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Postal Code *
                    </label>
                    <Input
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className="bg-background border-border text-foreground"
                      placeholder="00100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Country
                  </label>
                  <Input
                    value={shippingAddress.country}
                    className="bg-background border-border text-foreground"
                    disabled
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Items */}
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Package className="h-5 w-5 mr-2 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center space-x-3 py-2">
                    <div className="w-12 h-12 bg-accent rounded overflow-hidden flex-shrink-0">
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
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground text-sm font-medium">{item.product?.name}</p>
                      <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-foreground text-sm font-medium">
                      {formatPrice(item.priceAtTime * item.quantity)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card className="bg-card/50 border-border">
              <CardContent className="pt-6 space-y-4">
                {cartSummary && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatPrice(cartSummary.totalPrice)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-foreground">
                        {calculateShipping(cartSummary.totalPrice) === 0 ? 
                          "Free" : 
                          formatPrice(calculateShipping(cartSummary.totalPrice))
                        }
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (VAT 18%)</span>
                      <span className="text-foreground">{formatPrice(calculateTax(cartSummary.totalPrice))}</span>
                    </div>
                    
                    <hr className="border-border" />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">
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
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 text-lg"
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
