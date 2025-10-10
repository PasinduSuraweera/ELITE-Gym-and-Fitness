import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get the base URL from the request headers
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    const { 
      clerkId, 
      cartItems, 
      shippingAddress,
      returnUrl = `${baseUrl}/marketplace/checkout/success`,
      cancelUrl = `${baseUrl}/marketplace/cart`
    } = body;

    console.log("🛒 Creating marketplace checkout session for:", clerkId);
    console.log("📦 Cart items:", cartItems?.length || 0);

    if (!clerkId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Calculate totals
    let subtotal = 0;
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of cartItems) {
      const itemTotal = item.quantity * item.priceAtTime;
      subtotal += itemTotal;

      // Convert LKR to cents for Stripe (multiply by 100)
      const priceInCents = Math.round(item.priceAtTime * 100);

      lineItems.push({
        price_data: {
          currency: "lkr",
          product_data: {
            name: item.product.name,
            description: item.product.description,
            images: item.product.imageUrl ? [item.product.imageUrl] : [],
            metadata: {
              productId: item.productId,
              category: item.product.category,
            },
          },
          unit_amount: priceInCents,
        },
        quantity: item.quantity,
      });
    }

    // Calculate shipping
    const shippingCost = calculateShipping(subtotal, shippingAddress.city);
    const tax = calculateTax(subtotal);

    // Add shipping as line item if > 0
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "lkr",
          product_data: {
            name: "Shipping & Handling",
            description: `Delivery to ${shippingAddress.city}`,
          },
          unit_amount: Math.round(shippingCost * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    // Add tax as line item
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: "lkr",
          product_data: {
            name: "VAT (18%)",
            description: "Value Added Tax",
          },
          unit_amount: Math.round(tax * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      customer_email: shippingAddress.email || undefined,
      metadata: {
        type: "marketplace_order",
        clerkId,
        subtotal: subtotal.toString(),
        shippingCost: shippingCost.toString(),
        tax: tax.toString(),
        totalAmount: (subtotal + shippingCost + tax).toString(),
        shippingAddress: JSON.stringify(shippingAddress),
      },
      shipping_address_collection: {
        allowed_countries: ["LK"], // Sri Lanka only
      },
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      payment_intent_data: {
        metadata: {
          type: "marketplace_order",
          clerkId,
        },
      },
    });

    console.log("✅ Stripe session created:", session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      totalAmount: subtotal + shippingCost + tax,
    });

  } catch (error: any) {
    console.error("❌ Error creating marketplace checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper functions (same as in orders.ts)
function calculateShipping(subtotal: number, city: string): number {
  // Free shipping for orders over LKR 10,000
  if (subtotal >= 10000) {
    return 0;
  }

  // Colombo area - LKR 500
  const colomboAreas = ["colombo", "dehiwala", "mount lavinia", "nugegoda", "maharagama", "kotte"];
  if (colomboAreas.some(area => city.toLowerCase().includes(area))) {
    return 500;
  }

  // Other major cities - LKR 750
  const majorCities = ["kandy", "galle", "jaffna", "negombo", "kurunegala", "ratnapura"];
  if (majorCities.some(cityName => city.toLowerCase().includes(cityName))) {
    return 750;
  }

  // Remote areas - LKR 1000
  return 1000;
}

function calculateTax(subtotal: number): number {
  // Simplified tax calculation - 18% VAT
  return Math.round(subtotal * 0.18);
}
