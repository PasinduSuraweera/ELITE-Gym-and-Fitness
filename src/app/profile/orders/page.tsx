"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { UserLayout } from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Truck, Calendar, CreditCard, MapPin, Phone, Mail, Download } from "lucide-react";
import { useState, useEffect } from "react";

const OrdersPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
      return;
    }
  }, [isLoaded, user, router]);

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

  // Download individual order receipt
  const downloadOrderReceipt = (order: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'hsl(222.2, 84%, 4.9%)');
    gradient.addColorStop(1, 'hsl(217.2, 32.6%, 17.5%)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = 'hsl(210, 40%, 98%)';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ELITE GYM & FITNESS', canvas.width / 2, 50);
    
    ctx.font = '20px Arial';
    ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)';
    ctx.fillText('ORDER RECEIPT', canvas.width / 2, 80);

    // Order Info
    ctx.textAlign = 'left';
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = 'hsl(210, 40%, 98%)';
    ctx.fillText(`Order #${order.orderNumber}`, 40, 130);
    
    ctx.font = '14px Arial';
    ctx.fillStyle = 'hsl(215, 20.2%, 65.1%)';
    ctx.fillText(`Order Date: ${formatDate(order.createdAt)}`, 40, 155);
    ctx.fillText(`Status: ${order.status.toUpperCase()}`, 40, 175);
    ctx.fillText(`Payment: ${order.paymentStatus.toUpperCase()}`, 40, 195);

    // Items
    let yPos = 240;
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)';
    ctx.fillText('ORDER ITEMS', 40, yPos);
    yPos += 30;

    order.items.forEach((item: any, index: number) => {
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = 'hsl(210, 40%, 98%)';
      ctx.fillText(`${index + 1}. ${item.productName}`, 40, yPos);
      
      ctx.font = '12px Arial';
      ctx.fillStyle = 'hsl(215, 20.2%, 65.1%)';
      ctx.textAlign = 'right';
      ctx.fillText(`Qty: ${item.quantity}`, canvas.width - 40, yPos);
      ctx.fillText(`${formatCurrency(item.totalPrice)}`, canvas.width - 40, yPos + 15);
      
      ctx.textAlign = 'left';
      yPos += 40;
    });

    // Totals
    yPos += 20;
    ctx.font = '12px Arial';
    ctx.fillStyle = 'hsl(215, 20.2%, 65.1%)';
    ctx.textAlign = 'right';
    ctx.fillText(`Subtotal: ${formatCurrency(order.subtotal)}`, canvas.width - 40, yPos);
    ctx.fillText(`Shipping: ${formatCurrency(order.shippingCost)}`, canvas.width - 40, yPos + 20);
    ctx.fillText(`Tax: ${formatCurrency(order.tax)}`, canvas.width - 40, yPos + 40);
    
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)';
    ctx.fillText(`Total: ${formatCurrency(order.totalAmount)}`, canvas.width - 40, yPos + 70);

    // Shipping Address
    yPos += 120;
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)';
    ctx.fillText('SHIPPING ADDRESS', 40, yPos);
    yPos += 25;
    
    ctx.font = '12px Arial';
    ctx.fillStyle = 'hsl(210, 40%, 98%)';
    ctx.fillText(order.shippingAddress.name, 40, yPos);
    ctx.fillText(order.shippingAddress.addressLine1, 40, yPos + 15);
    if (order.shippingAddress.addressLine2) {
      ctx.fillText(order.shippingAddress.addressLine2, 40, yPos + 30);
      yPos += 15;
    }
    ctx.fillText(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`, 40, yPos + 30);
    ctx.fillText(order.shippingAddress.country, 40, yPos + 45);
    ctx.fillText(`Phone: ${order.shippingAddress.phone}`, 40, yPos + 65);

    // Footer
    ctx.font = '10px Arial';
    ctx.fillStyle = 'hsl(215, 20.2%, 65.1%)';
    ctx.textAlign = 'center';
    ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, canvas.width / 2, 950);

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-receipt-${order.orderNumber}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  // Download all orders summary
  const downloadAllOrdersSummary = () => {
    if (!userOrders || userOrders.length === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = Math.max(1000, 300 + userOrders.length * 100);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'hsl(222.2, 84%, 4.9%)');
    gradient.addColorStop(1, 'hsl(217.2, 32.6%, 17.5%)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = 'hsl(210, 40%, 98%)';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ELITE GYM & FITNESS', canvas.width / 2, 50);
    
    ctx.font = '20px Arial';
    ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)';
    ctx.fillText('ORDER HISTORY SUMMARY', canvas.width / 2, 80);

    // Summary Stats
    ctx.textAlign = 'left';
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'hsl(210, 40%, 98%)';
    ctx.fillText(`Total Orders: ${userOrders.length}`, 40, 130);
    
    const totalSpent = userOrders.reduce((total, order) => total + order.totalAmount, 0);
    ctx.fillText(`Total Spent: ${formatCurrency(totalSpent)}`, 40, 155);
    
    const deliveredCount = userOrders.filter(order => order.status === 'delivered').length;
    ctx.fillText(`Delivered Orders: ${deliveredCount}`, 40, 180);

    // Orders List
    let yPos = 230;
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)';
    ctx.fillText('ORDER HISTORY', 40, yPos);
    yPos += 30;

    userOrders
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach((order, index) => {
        if (yPos > canvas.height - 100) return; // Prevent overflow
        
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = 'hsl(210, 40%, 98%)';
        ctx.fillText(`${index + 1}. Order #${order.orderNumber}`, 40, yPos);
        
        ctx.font = '10px Arial';
        ctx.fillStyle = 'hsl(215, 20.2%, 65.1%)';
        ctx.fillText(formatDate(order.createdAt), 40, yPos + 15);
        ctx.fillText(`Status: ${order.status}`, 40, yPos + 30);
        
        ctx.textAlign = 'right';
        ctx.fillText(`${formatCurrency(order.totalAmount)}`, canvas.width - 40, yPos);
        ctx.fillText(`${order.items.length} items`, canvas.width - 40, yPos + 15);
        
        ctx.textAlign = 'left';
        yPos += 60;
      });

    // Footer
    ctx.font = '10px Arial';
    ctx.fillStyle = 'hsl(215, 20.2%, 65.1%)';
    ctx.textAlign = 'center';
    ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, canvas.width / 2, canvas.height - 30);

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-summary-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  // Show loading state during hydration or auth check
  if (!mounted || !isLoaded) {
    return (
      <UserLayout 
        title="Order History" 
        subtitle="Track your marketplace purchases and deliveries"
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-card rounded-lg"></div>
          </div>
        </div>
      </UserLayout>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
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
              <Card className="bg-card/50 border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Package className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-foreground font-semibold">{userOrders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-foreground font-semibold">
                        {formatCurrency(userOrders.reduce((total, order) => total + order.totalAmount, 0))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Truck className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Delivered</p>
                      <p className="text-foreground font-semibold">
                        {userOrders.filter(order => order.status === 'delivered').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Download All Orders Button */}
            <div className="flex justify-end">
              <Button 
                onClick={downloadAllOrdersSummary}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Order History
              </Button>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {userOrders
                .sort((a, b) => b.createdAt - a.createdAt) // Sort by newest first
                .map((order) => (
                <Card key={order._id} className="bg-card/50 border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-foreground flex items-center gap-2">
                          <Package className="h-5 w-5 text-blue-500" />
                          Order #{order.orderNumber}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
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
                        <h4 className="text-sm font-semibold text-muted-foreground mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-card/30 rounded-lg">
                              <div>
                                <p className="text-foreground font-medium">{item.productName}</p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                              <p className="text-foreground font-semibold">
                                {formatCurrency(item.totalPrice)}
                              </p>
                            </div>
                          ))}
                        </div>
                        
                        {/* Order Total */}
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Subtotal:</span>
                              <span className="text-foreground">{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Shipping:</span>
                              <span className="text-foreground">{formatCurrency(order.shippingCost)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Tax:</span>
                              <span className="text-foreground">{formatCurrency(order.tax)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                              <span className="text-foreground">Total:</span>
                              <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Shipping & Tracking */}
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-3">Shipping Information</h4>
                        <div className="space-y-3">
                          {/* Shipping Address */}
                          <div className="p-3 bg-card/30 rounded-lg">
                            <div className="flex items-start gap-2 mb-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-foreground font-medium">{order.shippingAddress.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {order.shippingAddress.addressLine1}
                                  {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                                </p>
                                <p className="text-sm text-muted-foreground">{order.shippingAddress.country}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                            <div className="p-3 bg-card/30 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-orange-500" />
                                <div>
                                  <p className="text-foreground font-medium">Tracking Number</p>
                                  <p className="text-sm text-muted-foreground">{order.trackingNumber}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Estimated Delivery */}
                          {order.estimatedDelivery && (
                            <div className="p-3 bg-card/30 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-green-500" />
                                <div>
                                  <p className="text-foreground font-medium">Estimated Delivery</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(order.estimatedDelivery)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Download Receipt Button */}
                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="flex justify-end">
                        <Button
                          onClick={() => downloadOrderReceipt(order)}
                          variant="outline"
                          size="sm"
                          className="border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Receipt
                        </Button>
                      </div>
                    </div>

                    {/* Order Notes */}
                    {order.notes && (
                      <div className="mt-6 pt-4 border-t border-border">
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Order Notes</h4>
                        <p className="text-sm text-foreground bg-card/30 p-3 rounded-lg">
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
          <Card className="bg-card/50 border-border">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet. Browse our marketplace to find great fitness products!
              </p>
              <div className="flex gap-4 justify-center">
                <a 
                  href="/marketplace"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors"
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
