"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, Calendar, CreditCard, MapPin, Phone, Mail } from "lucide-react";
import { useState, useEffect } from "react";

const OrdersPage = () => {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  // Get user orders
  const userOrders = useQuery(
    api.orders.getUserOrders,
    user?.id ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format date
  const formatDate = (timestamp: number) => {
    if (!mounted) return '';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString()}`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'processing': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'shipped': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'refunded': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <UserLayout 
        title="Order History" 
        subtitle="Track your marketplace purchases and deliveries"
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout 
      title="Order History" 
      subtitle="Track your marketplace purchases and deliveries"
    >
      <div className="space-y-6">
        {userOrders && userOrders.length > 0 ? (
          <>
            {/* Orders Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-400">Total Orders</p>
                      <p className="text-white font-semibold">{userOrders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-400">Total Spent</p>
                      <p className="text-white font-semibold">
                        {formatCurrency(userOrders.reduce((total, order) => total + order.totalAmount, 0))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Truck className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-400">Delivered</p>
                      <p className="text-white font-semibold">
                        {userOrders.filter(order => order.status === 'delivered').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {userOrders
                .sort((a, b) => b.createdAt - a.createdAt) // Sort by newest first
                .map((order) => (
                <Card key={order._id} className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Package className="h-5 w-5 text-blue-500" />
                          Order #{order.orderNumber}
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Placed on {formatDate(order.createdAt)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-black/50 rounded-lg">
                              <div>
                                <p className="text-white font-medium">{item.productName}</p>
                                <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                              </div>
                              <p className="text-white font-semibold">
                                {formatCurrency(item.totalPrice)}
                              </p>
                            </div>
                          ))}
                        </div>
                        
                        {/* Order Total */}
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Subtotal:</span>
                              <span className="text-white">{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Shipping:</span>
                              <span className="text-white">{formatCurrency(order.shippingCost)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Tax:</span>
                              <span className="text-white">{formatCurrency(order.tax)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-600">
                              <span className="text-white">Total:</span>
                              <span className="text-red-500">{formatCurrency(order.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shipping & Tracking */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">Shipping Information</h4>
                        <div className="space-y-3">
                          {/* Shipping Address */}
                          <div className="p-3 bg-black/50 rounded-lg">
                            <div className="flex items-start gap-2 mb-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-white font-medium">{order.shippingAddress.name}</p>
                                <p className="text-sm text-gray-400">
                                  {order.shippingAddress.addressLine1}
                                  {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                                </p>
                                <p className="text-sm text-gray-400">{order.shippingAddress.country}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{order.shippingAddress.phone}</span>
                              </div>
                              {order.shippingAddress.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{order.shippingAddress.email}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tracking Info */}
                          {order.trackingNumber && (
                            <div className="p-3 bg-black/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-orange-500" />
                                <div>
                                  <p className="text-white font-medium">Tracking Number</p>
                                  <p className="text-sm text-gray-400">{order.trackingNumber}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Estimated Delivery */}
                          {order.estimatedDelivery && (
                            <div className="p-3 bg-black/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-green-500" />
                                <div>
                                  <p className="text-white font-medium">Estimated Delivery</p>
                                  <p className="text-sm text-gray-400">
                                    {formatDate(order.estimatedDelivery)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Notes */}
                    {order.notes && (
                      <div className="mt-6 pt-4 border-t border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Order Notes</h4>
                        <p className="text-sm text-gray-300 bg-black/50 p-3 rounded-lg">
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          /* No Orders State */
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
              <p className="text-gray-400 mb-6">
                You haven't placed any orders yet. Browse our marketplace to find great fitness products!
              </p>
              <div className="flex gap-4 justify-center">
                <a 
                  href="/marketplace"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Browse Marketplace
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
};

export default OrdersPage;
