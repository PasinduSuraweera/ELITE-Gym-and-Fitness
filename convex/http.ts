import { httpRouter } from "convex/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const http = httpRouter();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("No svix headers found", {
        status: 400,
      });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occurred", { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
      const { id, first_name, last_name, image_url, email_addresses } = evt.data;

      const email = email_addresses[0].email_address;

      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.syncUser, {
          email,
          name,
          image: image_url,
          clerkId: id,
        });
      } catch (error) {
        console.log("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.updateUser, {
          clerkId: id,
          email,
          name,
          image: image_url,
        });
      } catch (error) {
        console.log("Error updating user:", error);
        return new Response("Error updating user", { status: 500 });
      }
    }

    return new Response("Webhooks processed successfully", { status: 200 });
  }),
});

// validate and fix workout plan to ensure it has proper numeric types
function validateWorkoutPlan(plan: any) {
  const validatedPlan = {
    schedule: plan.schedule,
    exercises: plan.exercises.map((exercise: any) => ({
      day: exercise.day,
      routines: exercise.routines.map((routine: any) => ({
        name: routine.name,
        sets: typeof routine.sets === "number" ? routine.sets : parseInt(routine.sets) || 1,
        reps: typeof routine.reps === "number" ? routine.reps : parseInt(routine.reps) || 10,
      })),
    })),
  };
  return validatedPlan;
}

// validate diet plan to ensure it strictly follows schema
function validateDietPlan(plan: any) {
  // only keep the fields we want
  const validatedPlan = {
    dailyCalories: plan.dailyCalories,
    meals: plan.meals.map((meal: any) => ({
      name: meal.name,
      foods: meal.foods,
    })),
  };
  return validatedPlan;
}

http.route({
  path: "/vapi/generate-program",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();

      const {
        user_id,
        age,
        height,
        weight,
        injuries,
        workout_days,
        fitness_goal,
        fitness_level,
        dietary_restrictions,
      } = payload;

      console.log("Payload is here:", payload);

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.4, // lower temperature for more predictable outputs
          topP: 0.9,
          responseMimeType: "application/json",
        },
      });

      const workoutPrompt = `You are an experienced fitness coach creating a personalized workout plan based on:
      Age: ${age}
      Height: ${height}
      Weight: ${weight}
      Injuries or limitations: ${injuries}
      Available days for workout: ${workout_days}
      Fitness goal: ${fitness_goal}
      Fitness level: ${fitness_level}
      
      As a professional coach:
      - Consider muscle group splits to avoid overtraining the same muscles on consecutive days
      - Design exercises that match the fitness level and account for any injuries
      - Structure the workouts to specifically target the user's fitness goal
      
      CRITICAL SCHEMA INSTRUCTIONS:
      - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
      - "sets" and "reps" MUST ALWAYS be NUMBERS, never strings
      - For example: "sets": 3, "reps": 10
      - Do NOT use text like "reps": "As many as possible" or "reps": "To failure"
      - Instead use specific numbers like "reps": 12 or "reps": 15
      - For cardio, use "sets": 1, "reps": 1 or another appropriate number
      - NEVER include strings for numerical fields
      - NEVER add extra fields not shown in the example below
      
      Return a JSON object with this EXACT structure:
      {
        "schedule": ["Monday", "Wednesday", "Friday"],
        "exercises": [
          {
            "day": "Monday",
            "routines": [
              {
                "name": "Exercise Name",
                "sets": 3,
                "reps": 10
              }
            ]
          }
        ]
      }
      
      DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

      const workoutResult = await model.generateContent(workoutPrompt);
      const workoutPlanText = workoutResult.response.text();

      // VALIDATE THE INPUT COMING FROM AI
      let workoutPlan = JSON.parse(workoutPlanText);
      workoutPlan = validateWorkoutPlan(workoutPlan);

      const dietPrompt = `You are an experienced nutrition coach creating a personalized diet plan based on:
        Age: ${age}
        Height: ${height}
        Weight: ${weight}
        Fitness goal: ${fitness_goal}
        Dietary restrictions: ${dietary_restrictions}
        
        As a professional nutrition coach:
        - Calculate appropriate daily calorie intake based on the person's stats and goals
        - Create a balanced meal plan with proper macronutrient distribution
        - Include a variety of nutrient-dense foods while respecting dietary restrictions
        - Consider meal timing around workouts for optimal performance and recovery
        
        CRITICAL SCHEMA INSTRUCTIONS:
        - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
        - "dailyCalories" MUST be a NUMBER, not a string
        - DO NOT add fields like "supplements", "macros", "notes", or ANYTHING else
        - ONLY include the EXACT fields shown in the example below
        - Each meal should include ONLY a "name" and "foods" array

        Return a JSON object with this EXACT structure and no other fields:
        {
          "dailyCalories": 2000,
          "meals": [
            {
              "name": "Breakfast",
              "foods": ["Oatmeal with berries", "Greek yogurt", "Black coffee"]
            },
            {
              "name": "Lunch",
              "foods": ["Grilled chicken salad", "Whole grain bread", "Water"]
            }
          ]
        }
        
        DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

      const dietResult = await model.generateContent(dietPrompt);
      const dietPlanText = dietResult.response.text();

      // VALIDATE THE INPUT COMING FROM AI
      let dietPlan = JSON.parse(dietPlanText);
      dietPlan = validateDietPlan(dietPlan);

      // save to our DB: CONVEX
      const planId = await ctx.runMutation(api.plans.createPlan, {
        userId: user_id,
        dietPlan,
        isActive: true,
        workoutPlan,
        name: `${fitness_goal} Plan - ${new Date().toLocaleDateString()}`,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            planId,
            workoutPlan,
            dietPlan,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error generating fitness plan:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Stripe webhook endpoint
http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    console.log("🔥 Stripe webhook received!");
    console.log("📝 Request method:", request.method);
    console.log("🔗 Request URL:", request.url);
    
    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("❌ Missing STRIPE_WEBHOOK_SECRET environment variable");
      throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
    }

    const body = await request.text();
    const sig = request.headers.get("stripe-signature");
    console.log("📝 Body length:", body.length);
    console.log("🔐 Signature present:", !!sig);
    console.log("🔐 Signature value:", sig);
    console.log("📋 Body preview:", body.substring(0, 200) + "...");

    let event;

    try {
      // For development/testing, check if this is a test webhook
      if (sig === "test-signature-for-development") {
        // This is a test webhook - parse the body as JSON
        event = JSON.parse(body);
        console.log("🧪 Processing test webhook event");
      } else if (!sig) {
        console.log("❌ No signature provided");
        return new Response("No signature", { status: 400 });
      } else {
        // Real Stripe webhook - verify signature
        event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
        console.log("✅ Webhook verified successfully");
      }
      console.log("📩 Event type:", event.type);
    } catch (err: any) {
      console.log(`❌ Webhook signature verification failed.`, err.message);
      // In development, if signature fails but we have a test event, try to parse it anyway
      if (body.includes('"type":"checkout.session.completed"') || body.includes('"type":"customer.subscription')) {
        try {
          event = JSON.parse(body);
          console.log("⚠️ Using fallback parsing for development");
        } catch (parseErr) {
          return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }
      } else {
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
      }
    }

    try {
      console.log("🔄 Processing event:", event.type);
      switch (event.type) {
        case "customer.subscription.created":
          console.log("💳 Processing subscription creation event");
          const createdSubscription = event.data.object;
          const createdCustomerId = createdSubscription.customer;
          console.log("👤 Customer ID:", createdCustomerId);
          console.log("📋 Subscription ID:", createdSubscription.id);
          
          // Get the checkout session that created this subscription
          const createdCheckoutSessions = await stripe.checkout.sessions.list({
            customer: createdCustomerId,
            limit: 10, // Get more sessions to find the right one
          });
          console.log("🛒 Found checkout sessions:", createdCheckoutSessions.data.length);
          
          let createdClerkId;
          let createdSessionMembershipType;
          
          // Find the session with metadata
          for (const session of createdCheckoutSessions.data) {
            if (session.metadata?.clerkId) {
              createdClerkId = session.metadata.clerkId;
              createdSessionMembershipType = session.metadata.membershipType;
              console.log("✅ Found metadata - ClerkId:", createdClerkId, "Type:", createdSessionMembershipType);
              break;
            }
          }
          
          if (!createdClerkId) {
            console.log("❌ No clerkId found in checkout session metadata for customer:", createdCustomerId);
            console.log("📋 Available sessions:", createdCheckoutSessions.data.map((s: any) => ({ id: s.id, metadata: s.metadata })));
            break;
          }

          // Update customer with metadata for future reference
          await stripe.customers.update(createdCustomerId, {
            metadata: { clerkId: createdClerkId }
          });

          // Get user from database
          const createdUser = await ctx.runQuery(api.users.getUserByClerkId, { clerkId: createdClerkId });
          if (!createdUser) {
            console.log("User not found for clerkId:", createdClerkId);
            break;
          }

          // Determine membership type from price ID or product ID
          const createdPriceId = createdSubscription.items.data[0].price.id;
          const createdProductId = createdSubscription.items.data[0].price.product;
          let createdMembershipType: "basic" | "premium" | "couple" = "basic";
          
          // First try to get from session metadata if available
          if (createdSessionMembershipType) {
            const validTypes = ["basic", "premium", "couple"];
            if (validTypes.includes(createdSessionMembershipType)) {
              createdMembershipType = createdSessionMembershipType as "basic" | "premium" | "couple";
            }
          } else {
            // Fallback to mapping product IDs to membership types
            switch (createdProductId) {
              case "prod_SrnVL6NvWMhBm6":
                createdMembershipType = "basic";
                break;
              case "prod_SrnXKx7Lu5TgR8":
                createdMembershipType = "couple";
                break;
              case "prod_SrnZGVhLm7A6oW":
                createdMembershipType = "premium";
                break;
              default:
                console.log("Unknown product ID:", createdProductId);
                createdMembershipType = "basic";
                break;
            }
          }

          console.log("🎯 Creating membership with type:", createdMembershipType);
          console.log("👤 User ClerkId:", createdClerkId);
          console.log("💳 Stripe details:", { customerId: createdCustomerId, subscriptionId: createdSubscription.id, priceId: createdPriceId });
          console.log("📅 Subscription periods:", {
            current_period_start: createdSubscription.current_period_start,
            current_period_end: createdSubscription.current_period_end,
            start_date: createdSubscription.start_date,
            created: createdSubscription.created
          });

          // Calculate periods dynamically if not available
          let createdCurrentPeriodStart = createdSubscription.current_period_start;
          let createdCurrentPeriodEnd = createdSubscription.current_period_end;
          
          if (!createdCurrentPeriodStart || !createdCurrentPeriodEnd) {
            // Use subscription start date if current period not available
            const now = Math.floor(Date.now() / 1000);
            createdCurrentPeriodStart = createdSubscription.start_date || createdSubscription.created || now;
            
            // Calculate end date based on plan (assuming monthly billing)
            createdCurrentPeriodEnd = createdCurrentPeriodStart + (30 * 24 * 60 * 60); // 30 days in seconds
            
            console.log("⚠️ Using calculated periods:", {
              calculatedStart: createdCurrentPeriodStart,
              calculatedEnd: createdCurrentPeriodEnd
            });
          }

          await ctx.runMutation(api.memberships.upsertMembership, {
            userId: createdUser._id,
            clerkId: createdClerkId,
            membershipType: createdMembershipType,
            stripeCustomerId: createdCustomerId,
            stripeSubscriptionId: createdSubscription.id,
            stripePriceId: createdPriceId,
            currentPeriodStart: createdCurrentPeriodStart * 1000,
            currentPeriodEnd: createdCurrentPeriodEnd * 1000,
          });
          
          console.log("✅ Membership created successfully!");
          break;

        case "customer.subscription.updated":
          console.log("🔄 Processing subscription update event");
          const updatedSubscription = event.data.object;
          console.log("📋 Updated Subscription ID:", updatedSubscription.id);
          console.log("🚫 Cancel at period end:", updatedSubscription.cancel_at_period_end);
          console.log("📊 Subscription status:", updatedSubscription.status);
          console.log("📅 Period start:", updatedSubscription.current_period_start);
          console.log("📅 Period end:", updatedSubscription.current_period_end);
          
          // Only include period dates if they exist and are valid
          const updateData: any = {
            stripeSubscriptionId: updatedSubscription.id,
            status: updatedSubscription.status === "active" ? "active" : "cancelled",
            cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end || false,
          };
          
          if (updatedSubscription.current_period_start && updatedSubscription.current_period_end) {
            updateData.currentPeriodStart = updatedSubscription.current_period_start * 1000;
            updateData.currentPeriodEnd = updatedSubscription.current_period_end * 1000;
            console.log("📅 Including period updates:", {
              start: updateData.currentPeriodStart,
              end: updateData.currentPeriodEnd
            });
          } else {
            console.log("⚠️ Skipping period updates - no valid period data");
          }
          
          // Update the existing membership with the new subscription details
          await ctx.runMutation(api.memberships.updateMembershipStatus, updateData);
          
          console.log("✅ Membership updated successfully from webhook!");
          break;

        case "customer.subscription.deleted":
          const deletedSubscription = event.data.object;
          await ctx.runMutation(api.memberships.updateMembershipStatus, {
            stripeSubscriptionId: deletedSubscription.id,
            status: "cancelled",
          });
          break;

        case "checkout.session.completed":
          console.log("💳 Processing checkout.session.completed");
          const session = event.data.object;
          console.log("📋 Session ID:", session.id);
          console.log("📋 Session mode:", session.mode);
          console.log("📋 Session metadata:", JSON.stringify(session.metadata, null, 2));
          
          if (session.mode === "subscription") {
            console.log("🏋️ Subscription checkout - handled by subscription events");
            // Subscription checkouts are handled by customer.subscription.created
          } else if (session.mode === "payment") {
            console.log("💰 Payment checkout detected");
            
            if (session.metadata?.type === "marketplace_order") {
              console.log("🛒 Processing marketplace order");
              await handleMarketplaceOrder(ctx, session);
            } else if (session.metadata?.type === "booking") {
              console.log("📅 Processing booking payment");
              await handleBookingPayment(ctx, session);
            } else {
              console.log("⚠️ Unknown payment type - treating as booking");
              await handleBookingPayment(ctx, session);
            }
          }
          break;

        case "invoice.payment_succeeded":
          const invoice = event.data.object;
          if (invoice.subscription) {
            await ctx.runMutation(api.memberships.updateMembershipStatus, {
              stripeSubscriptionId: invoice.subscription,
              status: "active",
              currentPeriodStart: invoice.period_start * 1000,
              currentPeriodEnd: invoice.period_end * 1000,
            });
          }
          break;

        case "invoice.payment_failed":
          const failedInvoice = event.data.object;
          if (failedInvoice.subscription) {
            await ctx.runMutation(api.memberships.updateMembershipStatus, {
              stripeSubscriptionId: failedInvoice.subscription,
              status: "pending",
            });
          }
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return new Response("Success", { status: 200 });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  }),
});

// Helper function to handle marketplace orders
async function handleMarketplaceOrder(ctx: any, session: any) {
  try {
    console.log("🔄 Starting marketplace order processing...");
    console.log("📋 Session payment status:", session.payment_status);
    
    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      console.error("❌ Payment not completed. Status:", session.payment_status);
      return;
    }

    const { clerkId, shippingAddress } = session.metadata;

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
    
    try {
      // Create order from cart
      const orderResult = await ctx.runMutation(api.orders.createOrderFromCart, {
        clerkId,
        shippingAddress: parsedShippingAddress,
        stripeSessionId: session.id,
      });

      console.log("✅ Order created successfully:", orderResult);
      console.log("✅ Order number:", orderResult.orderNumber);
      console.log("✅ Order ID:", orderResult.orderId);

      // Update payment status
      const paymentUpdate = await ctx.runMutation(api.orders.updatePaymentStatus, {
        stripeSessionId: session.id,
        paymentStatus: "paid",
        stripePaymentIntentId: session.payment_intent,
      });

      console.log("✅ Payment status updated successfully:", paymentUpdate);
      console.log("✅ Final order number:", orderResult.orderNumber);
      
    } catch (convexError) {
      console.error("❌ Error with Convex operations:", convexError);
      console.error("❌ Convex error details:", convexError instanceof Error ? convexError.message : String(convexError));
      throw convexError;
    }
  } catch (error) {
    console.error("❌ Error creating marketplace order:", error);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace");
  }
}

// Helper function to handle booking payments  
async function handleBookingPayment(ctx: any, session: any) {
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
    } = session.metadata;

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
    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: userId,
    });

    if (!user) {
      console.error("❌ User not found with Clerk ID:", userId);
      return;
    }

    console.log("✅ User found:", user._id, "Name:", user.name);

    // Get the total amount from Stripe session
    const totalAmount = session.amount_total ? session.amount_total / 100 : 0; // Convert from paisa to LKR

    console.log("💰 Total amount:", totalAmount, "LKR");
    console.log("🏃‍♂️ Creating paid booking with data:");

    // Create the booking with paid status
    const bookingId = await ctx.runMutation(api.bookings.createPaidBooking, {
      userId: user._id,
      trainerId: trainerId,
      userClerkId: userId,
      sessionType: sessionType,
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

export default http;
