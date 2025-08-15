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

    let event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
      console.log("✅ Webhook verified successfully");
      console.log("📩 Event type:", event.type);
    } catch (err: any) {
      console.log(`❌ Webhook signature verification failed.`, err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    try {
      console.log("🔄 Processing event:", event.type);
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
          console.log("💳 Processing subscription event");
          const subscription = event.data.object;
          const customerId = subscription.customer;
          console.log("👤 Customer ID:", customerId);
          console.log("📋 Subscription ID:", subscription.id);
          
          // Get the checkout session that created this subscription
          const checkoutSessions = await stripe.checkout.sessions.list({
            customer: customerId,
            limit: 10, // Get more sessions to find the right one
          });
          console.log("🛒 Found checkout sessions:", checkoutSessions.data.length);
          
          let clerkId;
          let sessionMembershipType;
          
          // Find the session with metadata
          for (const session of checkoutSessions.data) {
            if (session.metadata?.clerkId) {
              clerkId = session.metadata.clerkId;
              sessionMembershipType = session.metadata.membershipType;
              console.log("✅ Found metadata - ClerkId:", clerkId, "Type:", sessionMembershipType);
              break;
            }
          }
          
          if (!clerkId) {
            console.log("❌ No clerkId found in checkout session metadata for customer:", customerId);
            console.log("📋 Available sessions:", checkoutSessions.data.map((s: any) => ({ id: s.id, metadata: s.metadata })));
            break;
          }

          // Update customer with metadata for future reference
          await stripe.customers.update(customerId, {
            metadata: { clerkId: clerkId }
          });

          // Get user from database
          const user = await ctx.runQuery(api.users.getUserByClerkId, { clerkId });
          if (!user) {
            console.log("User not found for clerkId:", clerkId);
            break;
          }

          // Determine membership type from price ID or product ID
          const priceId = subscription.items.data[0].price.id;
          const productId = subscription.items.data[0].price.product;
          let membershipType: "basic" | "premium" | "couple" | "beginner" = "basic";
          
          // First try to get from session metadata if available
          if (sessionMembershipType) {
            const validTypes = ["basic", "premium", "couple", "beginner"];
            if (validTypes.includes(sessionMembershipType)) {
              membershipType = sessionMembershipType as "basic" | "premium" | "couple" | "beginner";
            }
          } else {
            // Fallback to mapping product IDs to membership types
            switch (productId) {
              case "prod_SrnY1NkNy0wzY9":
                membershipType = "beginner";
                break;
              case "prod_SrnVL6NvWMhBm6":
                membershipType = "basic";
                break;
              case "prod_SrnXKx7Lu5TgR8":
                membershipType = "couple";
                break;
              case "prod_SrnZGVhLm7A6oW":
                membershipType = "premium";
                break;
              default:
                console.log("Unknown product ID:", productId);
                membershipType = "basic";
                break;
            }
          }

          console.log("🎯 Creating membership with type:", membershipType);
          console.log("👤 User ClerkId:", clerkId);
          console.log("💳 Stripe details:", { customerId, subscriptionId: subscription.id, priceId });
          console.log("📅 Subscription periods:", {
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            start_date: subscription.start_date,
            created: subscription.created
          });

          // Calculate periods dynamically if not available
          let currentPeriodStart = subscription.current_period_start;
          let currentPeriodEnd = subscription.current_period_end;
          
          if (!currentPeriodStart || !currentPeriodEnd) {
            // Use subscription start date if current period not available
            const now = Math.floor(Date.now() / 1000);
            currentPeriodStart = subscription.start_date || subscription.created || now;
            
            // Calculate end date based on plan (assuming monthly billing)
            currentPeriodEnd = currentPeriodStart + (30 * 24 * 60 * 60); // 30 days in seconds
            
            console.log("⚠️ Using calculated periods:", {
              calculatedStart: currentPeriodStart,
              calculatedEnd: currentPeriodEnd
            });
          }

          await ctx.runMutation(api.memberships.upsertMembership, {
            userId: user._id,
            clerkId: clerkId,
            membershipType: membershipType,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            currentPeriodStart: currentPeriodStart * 1000,
            currentPeriodEnd: currentPeriodEnd * 1000,
          });
          
          console.log("✅ Membership created successfully!");
          break;

        case "customer.subscription.deleted":
          const deletedSubscription = event.data.object;
          await ctx.runMutation(api.memberships.updateMembershipStatus, {
            stripeSubscriptionId: deletedSubscription.id,
            status: "cancelled",
          });
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

export default http;
