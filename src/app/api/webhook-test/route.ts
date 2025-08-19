import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    console.log("🧪 Testing webhook functionality...");
    
    // Test Convex connection
    console.log("🔗 Testing Convex connection...");
    console.log("📋 Convex URL:", process.env.NEXT_PUBLIC_CONVEX_URL);
    
    // Test if we can query users
    try {
      const users = await convex.query(api.users.getAllUsers, {});
      console.log("✅ Convex connection successful. User count:", users?.length || 0);
    } catch (convexError) {
      console.error("❌ Convex connection failed:", convexError);
      return NextResponse.json({ 
        error: "Convex connection failed", 
        details: convexError instanceof Error ? convexError.message : String(convexError) 
      }, { status: 500 });
    }

    // Test creating a mock order (for testing)
    const testOrderData = {
      clerkId: "test_user_123",
      shippingAddress: {
        name: "Test User",
        phone: "+94771234567",
        addressLine1: "123 Test Street",
        city: "Colombo",
        postalCode: "00100",
        country: "LK"
      },
      stripeSessionId: "cs_test_" + Date.now()
    };

    console.log("🧪 Testing order creation with mock data...");
    
    try {
      // This will likely fail because the test user doesn't exist, but it will tell us if the function is callable
      await convex.mutation(api.orders.createOrderFromCart, testOrderData);
      console.log("✅ Order creation function is accessible");
    } catch (orderError) {
      console.log("📋 Order creation error (expected):", orderError instanceof Error ? orderError.message : String(orderError));
      
      // If the error is about user not found, that's expected and good
      if (orderError instanceof Error && orderError.message.includes("User not found")) {
        console.log("✅ Order creation function is working (user validation passed)");
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Webhook test completed",
      convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Webhook test failed:", error);
    return NextResponse.json({ 
      error: "Test failed", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: "Webhook test endpoint is running",
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
    hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    timestamp: new Date().toISOString()
  });
}
