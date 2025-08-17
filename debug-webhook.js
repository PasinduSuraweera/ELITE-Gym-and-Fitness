// Debug script to test webhook handling
const { ConvexHttpClient } = require("convex/browser");

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// Simulate the webhook payload that would come from Stripe for a booking
const simulateBookingWebhook = async () => {
  console.log("🔍 Testing booking webhook simulation...");
  
  const mockSession = {
    id: "cs_test_123456789",
    mode: "payment",
    payment_status: "paid",
    amount_total: 500000, // LKR 5000 in paisa
    metadata: {
      userId: "user_123", // This should be a real Clerk ID
      trainerId: "jh123456789", // This should be a real trainer ID from Convex
      sessionType: "personal_training",
      sessionDate: "2025-08-20",
      startTime: "14:00",
      duration: "60",
      notes: "Test booking from webhook simulation"
    }
  };

  try {
    // Test the handleBookingSession logic
    const {
      userId,
      trainerId,
      sessionType,
      sessionDate,
      startTime,
      duration,
      notes,
    } = mockSession.metadata;

    console.log("👤 Looking up user with Clerk ID:", userId);
    
    // Try to get user from Clerk ID
    const user = await convex.query("users:getUserByClerkId", {
      clerkId: userId,
    });

    if (!user) {
      console.error("❌ User not found:", userId);
      console.log("💡 This is likely the issue - the user lookup is failing");
      return;
    }

    console.log("✅ User found:", user._id);

    // Get the total amount from Stripe session
    const totalAmount = mockSession.amount_total ? mockSession.amount_total / 100 : 0;

    console.log("💰 Total amount:", totalAmount);
    console.log("🏃‍♂️ Creating paid booking...");

    // Try to create the booking
    const bookingId = await convex.mutation("bookings:createPaidBooking", {
      userId: user._id,
      trainerId: trainerId,
      userClerkId: userId,
      sessionType: sessionType,
      sessionDate,
      startTime,
      duration: parseInt(duration),
      totalAmount,
      paymentSessionId: mockSession.id,
      notes: notes || undefined,
    });

    console.log("✅ Paid booking created successfully:", bookingId, "for session:", mockSession.id);
  } catch (error) {
    console.error("❌ Error in simulation:", error);
  }
};

// Test if we can query users
const testUserQuery = async () => {
  try {
    console.log("🔍 Testing user query...");
    // Try to get all users to see what's available
    const users = await convex.query("users:getAllUsers");
    console.log("📋 Found users:", users?.length || 0);
    if (users && users.length > 0) {
      console.log("👤 Sample user:", users[0]);
    }
  } catch (error) {
    console.error("❌ Error querying users:", error);
  }
};

// Run tests
const runTests = async () => {
  await testUserQuery();
  // await simulateBookingWebhook();
};

runTests();
