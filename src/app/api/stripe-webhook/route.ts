import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  console.log("🔔 Webhook received - starting processing...");
  
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    console.log("📋 Webhook details:");
    console.log("- Body length:", body.length);
    console.log("- Has signature:", !!signature);
    console.log("- Signature preview:", signature?.substring(0, 20) + "...");

    if (!signature) {
      console.error("❌ No signature provided");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      // For development/testing, check if this is a test webhook
      if (signature === "test-signature-for-development") {
        // This is a test webhook - parse the body as JSON
        event = JSON.parse(body);
        console.log("🧪 Processing test webhook event");
      } else {
        // Real Stripe webhook - verify signature
        console.log("🔐 Processing real Stripe webhook - verifying signature...");
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
        console.log("✅ Signature verified successfully");
        console.log("📨 Event type:", event.type);
        console.log("📨 Event ID:", event.id);
      }
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err);
      console.error("- Error details:", err instanceof Error ? err.message : String(err));
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("🔄 Processing webhook event type:", event.type);
    console.log("📋 Event data preview:", JSON.stringify(event.data, null, 2).substring(0, 500) + "...");

    switch (event.type) {
      case "checkout.session.completed":
        console.log("💳 Processing checkout.session.completed");
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("📋 Session metadata:", JSON.stringify(session.metadata, null, 2));
        console.log("📋 Session mode:", session.mode);
        console.log("📋 Session ID:", session.id);
        await handleSessionCompleted(session);
        break;

      case "payment_intent.succeeded":
        console.log("💰 Processing payment_intent.succeeded");
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
        console.log(`📋 Subscription/Invoice event: ${event.type} - handled elsewhere`);
        break;

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
        console.log("📋 Available event types in your webhook should include:");
        console.log("   - checkout.session.completed (for marketplace orders)");
        console.log("   - customer.subscription.* (for memberships)");
        console.log("   - invoice.payment_* (for recurring payments)");
    }

    console.log("✅ Webhook processed successfully");
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log("🔄 Processing session completion:", session.id);
    console.log("📝 Session metadata:", session.metadata);
    
    if (!session.metadata) {
      console.error("❌ No metadata in session");
      return;
    }

    // Check if this is a membership (subscription) or booking (one-time payment)
    if (session.mode === "subscription") {
      console.log("🏋️ Processing membership subscription");
      await handleMembershipSession(session);
    } else if (session.mode === "payment") {
      console.log("📅 Processing payment session");
      
      // Check if this is a marketplace order or booking
      if (session.metadata?.type === "marketplace_order") {
        console.log("🛒 Processing marketplace order");
        await handleMarketplaceSession(session);
      } else {
        console.log("📅 Processing booking payment");
        await handleBookingSession(session);
      }
    } else {
      console.log("⚠️ Unknown session mode:", session.mode);
    }
  } catch (error) {
    console.error("Error processing session completion:", error);
  }
}

async function handleMarketplaceSession(session: Stripe.Checkout.Session) {
  try {
    console.log("🔄 Starting marketplace order processing...");
    console.log("📋 Session metadata:", JSON.stringify(session.metadata, null, 2));
    console.log("📋 Session payment status:", session.payment_status);
    console.log("📋 Session amount total:", session.amount_total);
    
    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      console.error("❌ Payment not completed. Status:", session.payment_status);
      return;
    }

    const {
      clerkId,
      shippingAddress,
    } = session.metadata!;

    if (!clerkId) {
      console.error("❌ No clerkId in marketplace session metadata");
      console.error("📋 Available metadata keys:", Object.keys(session.metadata || {}));
      return;
    }

    if (!shippingAddress) {
      console.error("❌ No shipping address in marketplace session metadata");
      console.error("📋 Available metadata keys:", Object.keys(session.metadata || {}));
      return;
    }

    let parsedShippingAddress;
    try {
      parsedShippingAddress = JSON.parse(shippingAddress);
      console.log("✅ Shipping address parsed:", parsedShippingAddress);
    } catch (error) {
      console.error("❌ Error parsing shipping address:", error);
      console.error("❌ Raw shipping address:", shippingAddress);
      return;
    }

    console.log("🔄 Creating order for user:", clerkId);
    console.log("🔄 Convex URL:", process.env.NEXT_PUBLIC_CONVEX_URL);
    
    try {
      // Create order from cart
      const orderResult = await convex.mutation(api.orders.createOrderFromCart, {
        clerkId,
        shippingAddress: parsedShippingAddress,
        stripeSessionId: session.id,
      });

      console.log("✅ Order created successfully:", orderResult);
      console.log("✅ Order number:", orderResult.orderNumber);
      console.log("✅ Order ID:", orderResult.orderId);

      // Update payment status
      const paymentUpdate = await convex.mutation(api.orders.updatePaymentStatus, {
        stripeSessionId: session.id,
        paymentStatus: "paid",
        stripePaymentIntentId: session.payment_intent as string,
      });

      console.log("✅ Payment status updated successfully:", paymentUpdate);
      console.log("✅ Final order number:", orderResult.orderNumber);
      
    } catch (convexError) {
      console.error("❌ Error with Convex operations:", convexError);
      console.error("❌ Convex error details:", convexError instanceof Error ? convexError.message : String(convexError));
      throw convexError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error("❌ Error creating marketplace order:", error);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace");
  }
}

async function handleMembershipSession(session: Stripe.Checkout.Session) {
  try {
    const { clerkId } = session.metadata!;
    
    if (!clerkId) {
      console.error("❌ No clerkId in membership session metadata");
      return;
    }

    console.log("🔄 Creating membership for user:", clerkId);
    
    const membershipId = await convex.mutation(api.memberships.createMembershipFromSession, {
      sessionId: session.id,
      clerkId: clerkId,
    });

    console.log("✅ Membership created successfully:", membershipId);
  } catch (error) {
    console.error("❌ Error creating membership:", error);
  }
}

async function handleBookingSession(session: Stripe.Checkout.Session) {
  try {
    console.log("🔄 Starting booking session processing...");
    console.log("📋 Session metadata:", JSON.stringify(session.metadata, null, 2));
    
    const {
      userId,
      trainerId,
      sessionType,
      sessionDate,
      startTime,
      duration,
      notes,
    } = session.metadata!;

    // Validate required fields
    if (!userId || !trainerId || !sessionType || !sessionDate || !startTime || !duration) {
      console.error("❌ Missing required metadata fields:", {
        userId: !!userId,
        trainerId: !!trainerId,
        sessionType: !!sessionType,
        sessionDate: !!sessionDate,
        startTime: !!startTime,
        duration: !!duration
      });
      return;
    }

    console.log("👤 Looking up user with Clerk ID:", userId);
    
    // Get user from Clerk ID
    const user = await convex.query(api.users.getUserByClerkId, {
      clerkId: userId,
    });

    if (!user) {
      console.error("❌ User not found with Clerk ID:", userId);
      
      // Log all users to debug
      try {
        const allUsers = await convex.query(api.users.getAllUsers, {});
        console.log("📋 Available users count:", allUsers?.length || 0);
        if (allUsers && allUsers.length > 0) {
          console.log("👥 Sample user Clerk IDs:", allUsers.slice(0, 3).map(u => u.clerkId));
        }
      } catch (userError) {
        console.error("❌ Error fetching users for debug:", userError);
      }
      return;
    }

    console.log("✅ User found:", user._id, "Name:", user.name);

    // Validate trainer ID format and existence
    console.log("🏃‍♂️ Validating trainer ID:", trainerId);
    
    // Convex IDs can start with various characters, so let's just check if it's a valid format
    if (!trainerId || trainerId.length < 10) {
      console.error("❌ Invalid trainer ID format:", trainerId);
      return;
    }

    // Get the total amount from Stripe session
    const totalAmount = session.amount_total ? session.amount_total / 100 : 0; // Convert from paisa to LKR

    console.log("💰 Total amount:", totalAmount, "LKR");
    console.log("🏃‍♂️ Creating paid booking with data:");
    console.log({
      userId: user._id,
      trainerId,
      userClerkId: userId,
      sessionType,
      sessionDate,
      startTime,
      duration: parseInt(duration),
      totalAmount,
      paymentSessionId: session.id,
      notes: notes || undefined,
    });

    // Create the booking with paid status
    const bookingId = await convex.mutation(api.bookings.createPaidBooking, {
      userId: user._id,
      trainerId: trainerId as any,
      userClerkId: userId,
      sessionType: sessionType as any,
      sessionDate,
      startTime,
      duration: parseInt(duration),
      totalAmount,
      paymentSessionId: session.id,
      notes: notes || undefined,
    });

    console.log("✅ Paid booking created successfully:", bookingId, "for session:", session.id);
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace");
  }
}
