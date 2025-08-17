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

    switch (event.type) {
      case "checkout.session.completed":
        console.log("💳 Processing checkout.session.completed");
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSessionCompleted(session);
        break;

      case "payment_intent.succeeded":
        console.log("💰 Processing payment_intent.succeeded");
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        break;

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
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
      console.log("📅 Processing booking payment");
      await handleBookingSession(session);
    } else {
      console.log("⚠️ Unknown session mode:", session.mode);
    }
  } catch (error) {
    console.error("Error processing session completion:", error);
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
