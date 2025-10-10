import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      trainerId, 
      trainerName, 
      sessionType, 
      sessionDate, 
      startTime, 
      duration, 
      amount, 
      notes,
      successUrl,
      cancelUrl 
    } = await req.json();

    // Get the base URL from the request headers
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "lkr",
            product_data: {
              name: `${sessionType.replace('_', ' ').toUpperCase()} Session with ${trainerName}`,
              description: `${sessionDate} at ${startTime} (${duration} minutes)${notes ? `\nNotes: ${notes}` : ''}`,
              images: ["https://your-domain.com/logo.png"],
            },
            unit_amount: Math.round(amount * 100), // Convert to cents (paisa for LKR)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl || `${baseUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/book-session/${trainerId}`,
      metadata: {
        userId,
        trainerId,
        sessionType,
        sessionDate,
        startTime,
        duration: duration.toString(),
        notes: notes || "",
      },
      customer_email: undefined, // Will be filled by Clerk user email
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
