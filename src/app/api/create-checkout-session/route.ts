import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const { priceId, clerkId, membershipType } = await request.json();

    console.log("Creating checkout session:", { priceId, clerkId, membershipType });

    if (!priceId || !clerkId || !membershipType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Create checkout session for subscription mode
    // We'll create or retrieve customer first, then use it in the session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/membership`,
      metadata: {
        clerkId: clerkId,
        membershipType: membershipType,
      },
    });

    console.log("Checkout session created:", session.id);

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url 
    });

  } catch (error) {
    console.error("Error in checkout API route:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
