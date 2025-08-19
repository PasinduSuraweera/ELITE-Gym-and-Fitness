"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Plus, Minus, X, ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const CartPage = () => {
  const { user } = useUser();
  const [updatingQuantity, setUpdatingQuantity] = useState<string | null>(null);
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const cartItems = useQuery(
    api.cart.getUserCart,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const cartSummary = useQuery(
    api.cart.getCartSummary,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const updateQuantity = useMutation(api.cart.updateCartQuantity);
  const removeFromCart = useMutation(api.cart.removeFromCart);
  const clearCart = useMutation(api.cart.clearCart);

  const handleQuantityUpdate = async (cartItemId: string, newQuantity: number) => {
    if (!user?.id || newQuantity < 1) return;
    
    setUpdatingQuantity(cartItemId);
    try {
      await updateQuantity({
        cartItemId: cartItemId as any,
        quantity: newQuantity,
        clerkId: user.id,
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Error updating quantity. Please try again.");
    } finally {
      setUpdatingQuantity(null);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    if (!user?.id) return;
    
    setRemovingItem(cartItemId);
    try {
      await removeFromCart({
        cartItemId: cartItemId as any,
        clerkId: user.id,
      });
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Error removing item. Please try again.");
    } finally {
      setRemovingItem(null);
    }
  };

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) return;
    
    setIsCheckingOut(true);
    // Navigate to checkout page
    window.location.href = "/marketplace/checkout";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(price);
  };

  const calculateShipping = (subtotal: number) => {
    if (subtotal >= 10000) return 0; // Free shipping over LKR 10,000
    return 500; // Standard shipping
  };

  const calculateTax = (subtotal: number) => {
    return Math.round(subtotal * 0.18); // 18% VAT
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Sign In Required</h1>
            <p className="text-gray-400 mb-6">Please sign in to view your shopping cart</p>
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link href="/sign-in">Sign In</Link>
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
            <Link href="/marketplace">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Shopping <span className="text-red-500">Cart</span>
            </h1>
            <p className="text-gray-400">
              {cartSummary ? `${cartSummary.totalItems} items in your cart` : "Loading cart..."}
            </p>
          </div>
        </div>

        {cartItems && cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item._id} className="bg-gray-900/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product?.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">
                          {item.product?.name}
                        </h3>
                        <p className="text-sm text-gray-400 capitalize">
                          {item.product?.category}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatPrice(item.priceAtTime)} each
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityUpdate(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingQuantity === item._id}
                          className="h-8 w-8 p-0 border-gray-600 hover:bg-gray-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="text-white font-medium w-8 text-center">
                          {updatingQuantity === item._id ? "..." : item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityUpdate(item._id, item.quantity + 1)}
                          disabled={updatingQuantity === item._id || (item.product && item.quantity >= item.product.stock)}
                          className="h-8 w-8 p-0 border-gray-600 hover:bg-gray-700"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">
                          {formatPrice(item.priceAtTime * item.quantity)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(item._id)}
                        disabled={removingItem === item._id}
                        className="h-8 w-8 p-0 border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                      >
                        {removingItem === item._id ? "..." : <X className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-900/50 border-gray-700 sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartSummary && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Subtotal ({cartSummary.totalItems} items)</span>
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

                      {calculateShipping(cartSummary.totalPrice) > 0 && cartSummary.totalPrice < 10000 && (
                        <div className="text-sm text-orange-400 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                          Add {formatPrice(10000 - cartSummary.totalPrice)} more for free shipping!
                        </div>
                      )}
                      
                      <Button
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3"
                      >
                        {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    asChild
                    className="w-full border-gray-600 text-white hover:bg-gray-700"
                  >
                    <Link href="/marketplace">Continue Shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Empty Cart */
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-6">
              Discover our amazing fitness products and start building your perfect workout setup
            </p>
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link href="/marketplace">Start Shopping</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
