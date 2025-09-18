require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getProductPrices() {
  console.log('🔍 Fetching your Stripe products and their price IDs...\n');
  
  const productIds = [
    'prod_SrnVL6NvWMhBm6', // Basic
    'prod_SrnXKx7Lu5TgR8', // Couple
    'prod_SrnWVw0wWRAnLY', // Premium
  ];

  try {
    for (const productId of productIds) {
      console.log(`📦 Product ID: ${productId}`);
      
      // Get product details
      const product = await stripe.products.retrieve(productId);
      console.log(`   Name: ${product.name}`);
      
      // Get prices for this product
      const prices = await stripe.prices.list({
        product: productId,
        active: true
      });
      
      if (prices.data.length > 0) {
        prices.data.forEach(price => {
          console.log(`   💰 Price ID: ${price.id}`);
          console.log(`   💵 Amount: ${price.unit_amount / 100} ${price.currency.toUpperCase()}`);
          console.log(`   🔄 Interval: ${price.recurring?.interval || 'one-time'}`);
        });
      } else {
        console.log('   ❌ No active prices found for this product');
      }
      
      console.log(''); // Empty line for spacing
    }
    
    console.log('\n✅ Copy the Price IDs above and update them in convex/memberships.ts');
    console.log('🔧 Replace the placeholder price IDs with the actual ones from above');
    
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    
    if (error.message.includes('Invalid API Key')) {
      console.log('\n💡 Make sure your STRIPE_SECRET_KEY is correct in .env.local');
    }
  }
}

getProductPrices();
