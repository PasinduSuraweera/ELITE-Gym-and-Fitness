/**
 * Stripe Product and Price ID Reference
 * 
 * Use this information to set up your Stripe products and get the price IDs
 * 
 * Products you've created in Stripe:
 * - Basic Gym Membership: prod_SrnVL6NvWMhBm6
 * - Couple Gym Membership: prod_SrnXKx7Lu5TgR8
 * - Premium Gym Membership: prod_SrnWVw0wWRAnLY
 * 
 * IMPORTANT: You need to get the actual Price IDs from Stripe Dashboard
 * 
 * Steps to get Price IDs:
 * 1. Go to https://dashboard.stripe.com/test/products
 * 2. Click on each product
 * 3. Copy the Price ID (starts with "price_")
 * 4. Update the stripePriceId values in convex/memberships.ts
 * 
 * Expected pricing:
 * - Basic: Rs. 2,500/month
 * - Couple: Rs. 4,500/month
 * - Premium: Rs. 3,000/month
 * - Premium: Rs. 3,000/month
 * 
 * Make sure to:
 * - Set currency to LKR (Sri Lankan Rupee)
 * - Set billing interval to monthly
 * - Enable recurring payments
 */

// Example of how your Price IDs should look:
export const STRIPE_PRICE_IDS = {
  basic: "price_1RwXXXK3W6wHBRwhXXXXXXXX",    // Replace with actual
  couple: "price_1RwXXXK3W6wHBRwhXXXXXXXX",   // Replace with actual
  premium: "price_1RwXXXK3W6wHBRwhXXXXXXXX",  // Replace with actual
};

export const STRIPE_PRODUCT_IDS = {
  basic: "prod_SrnVL6NvWMhBm6", 
  couple: "prod_SrnXKx7Lu5TgR8",
  premium: "prod_SrnWVw0wWRAnLY",
};
