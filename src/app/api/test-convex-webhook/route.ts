import { NextRequest, NextResponse } from "next/server";

// Test the Convex webhook with a mock checkout.session.completed event
export async function POST(req: NextRequest) {
  try {
    console.log("🧪 Testing Convex webhook with mock marketplace order...");
    
    const mockEvent = {
      id: "evt_test_" + Date.now(),
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_" + Date.now(),
          mode: "payment",
          payment_status: "paid",
          amount_total: 250000, // LKR 2500 in cents
          payment_intent: "pi_test_" + Date.now(),
          metadata: {
            type: "marketplace_order",
            clerkId: "user_2jK9X6YZ3mNpQrStUvWxH7fL2aB", // Replace with a real user ID from your database
            shippingAddress: JSON.stringify({
              name: "Test User",
              phone: "+94771234567",
              addressLine1: "123 Test Street",
              city: "Colombo",
              postalCode: "00100",
              country: "LK"
            })
          }
        }
      }
    };

    // Send to Convex webhook
    const convexWebhookUrl = `${process.env.NEXT_PUBLIC_CONVEX_URL!.replace('convex.cloud', 'convex.site')}/stripe-webhook`;
    
    console.log("📤 Sending to Convex webhook:", convexWebhookUrl);
    
    const response = await fetch(convexWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "test-signature-for-development",
      },
      body: JSON.stringify(mockEvent),
    });

    const responseText = await response.text();
    console.log("📥 Convex webhook response:", response.status, responseText);

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      response: responseText,
      mockEvent: mockEvent
    });

  } catch (error) {
    console.error("❌ Test failed:", error);
    return NextResponse.json({
      error: "Test failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Convex webhook test endpoint",
    convexWebhookUrl: `${process.env.NEXT_PUBLIC_CONVEX_URL!.replace('convex.cloud', 'convex.site')}/stripe-webhook`,
    instructions: "Send POST request to test the webhook"
  });
}
