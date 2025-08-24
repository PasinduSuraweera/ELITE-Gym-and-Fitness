import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Test seed function that doesn't require authentication
export const seedBlogPostsTest = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if posts already exist
    const existingPosts = await ctx.db.query("blogPosts").collect();
    if (existingPosts.length > 0) {
      return { message: "Blog posts already exist", count: existingPosts.length };
    }

    // Create a test admin user first
    const testAuthor = await ctx.db.insert("users", {
      name: "Test Admin",
      email: "admin@test.com",
      clerkId: "test-admin-123",
      role: "admin",
      createdAt: Date.now(),
    });

    const now = Date.now();
    const samplePosts = [
      {
        title: "10 Essential Exercises for Building Core Strength",
        slug: "10-essential-exercises-building-core-strength",
        excerpt: "Discover the most effective core exercises that will transform your strength and stability. Perfect for beginners and advanced fitness enthusiasts alike.",
        content: `
          <h2>Why Core Strength Matters</h2>
          <p>Your core is the foundation of all movement. A strong core improves posture, reduces back pain, and enhances athletic performance. These 10 exercises will help you build a solid foundation.</p>
          
          <h2>The Essential Exercises</h2>
          <h3>1. Plank</h3>
          <p>The classic plank is the cornerstone of core training. Start with 30 seconds and work your way up to 2 minutes.</p>
          
          <h3>2. Dead Bug</h3>
          <p>This exercise teaches core stability while moving your limbs independently.</p>
          
          <h3>3. Bird Dog</h3>
          <p>Perfect for improving coordination and core stability.</p>
          
          <h3>4. Russian Twists</h3>
          <p>Target your obliques with this rotational movement.</p>
          
          <h3>5. Mountain Climbers</h3>
          <p>Combine cardio with core strengthening in this dynamic exercise.</p>
          
          <h3>6. Bicycle Crunches</h3>
          <p>A classic exercise that targets multiple core muscle groups.</p>
          
          <h3>7. Side Plank</h3>
          <p>Build lateral core strength and stability with this challenging variation.</p>
          
          <h3>8. Hollow Body Hold</h3>
          <p>An advanced isometric exercise that builds incredible core strength.</p>
          
          <h3>9. Turkish Get-Ups</h3>
          <p>A full-body exercise that challenges your core in multiple planes of movement.</p>
          
          <h3>10. Farmer's Walks</h3>
          <p>Build functional core strength while carrying heavy weights.</p>
          
          <h2>Getting Started</h2>
          <p>Begin with 2-3 exercises and gradually add more as your strength improves. Focus on quality over quantity, and always maintain proper form.</p>
          
          <h2>Conclusion</h2>
          <p>These 10 exercises will provide a solid foundation for core strength. Remember to progress gradually and listen to your body. Strong cores lead to better performance in all aspects of fitness!</p>
        `,
        authorId: testAuthor,
        authorName: "Test Admin",
        authorImage: undefined,
        category: "workout-tips" as const,
        tags: ["core", "strength", "exercises", "fitness", "beginner"],
        status: "published" as const,
        isFeatured: true,
        views: 156,
        likes: 23,
        readTime: 8,
        featuredImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop",
        seoTitle: "10 Essential Core Exercises - Build Strength Fast",
        seoDescription: "Master these 10 essential core exercises to build strength, improve posture, and enhance athletic performance. Perfect for all fitness levels.",
        publishedAt: now - 86400000 * 7, // 7 days ago
        createdAt: now - 86400000 * 7,
        updatedAt: now - 86400000 * 7,
      },
      {
        title: "Nutrition Guide: Fueling Your Fitness Journey",
        slug: "nutrition-guide-fueling-fitness-journey",
        excerpt: "Learn the fundamentals of sports nutrition and how to fuel your workouts for maximum performance and recovery.",
        content: `
          <h2>The Foundation of Fitness Nutrition</h2>
          <p>What you eat can make or break your fitness goals. This comprehensive guide will help you understand the basics of nutrition for optimal performance.</p>
          
          <h2>Macronutrients Explained</h2>
          <h3>Protein</h3>
          <p>Essential for muscle repair and growth. Aim for 0.8-1.2g per pound of body weight.</p>
          
          <h3>Carbohydrates</h3>
          <p>Your body's primary fuel source. Choose complex carbs for sustained energy.</p>
          
          <h3>Fats</h3>
          <p>Important for hormone production and vitamin absorption. Include healthy sources like nuts and avocados.</p>
          
          <h2>Pre-Workout Nutrition</h2>
          <p>Eat a balanced meal 2-3 hours before training, or a light snack 30-60 minutes before.</p>
          
          <h2>Post-Workout Recovery</h2>
          <p>The 30-minute window after training is crucial for recovery. Focus on protein and carbs.</p>
          
          <h2>Hydration</h2>
          <p>Water is often overlooked but crucial for performance. Aim for half your body weight in ounces daily.</p>
          
          <h2>Supplements</h2>
          <p>While whole foods should be your priority, certain supplements can support your goals.</p>
          
          <h2>Meal Planning Tips</h2>
          <p>Plan and prep your meals to stay consistent with your nutrition goals.</p>
        `,
        authorId: testAuthor,
        authorName: "Test Admin",
        authorImage: undefined,
        category: "nutrition" as const,
        tags: ["nutrition", "diet", "performance", "health", "macros"],
        status: "published" as const,
        isFeatured: false,
        views: 234,
        likes: 31,
        readTime: 12,
        featuredImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop",
        seoTitle: "Complete Nutrition Guide for Fitness Success",
        seoDescription: "Master the fundamentals of sports nutrition with our comprehensive guide. Learn about macros, meal timing, and fueling strategies.",
        publishedAt: now - 86400000 * 5, // 5 days ago
        createdAt: now - 86400000 * 5,
        updatedAt: now - 86400000 * 5,
      },
      {
        title: "Sarah's 50-Pound Weight Loss Transformation",
        slug: "sarah-50-pound-weight-loss-transformation",
        excerpt: "Read about Sarah's incredible journey from struggling with weight to becoming a fitness inspiration. Her story will motivate you to start your own transformation.",
        content: `
          <h2>The Beginning</h2>
          <p>Two years ago, Sarah walked into Elite Gym feeling overwhelmed and uncertain about her fitness journey. At 200 pounds, she had tried countless diets and exercise programs without lasting success.</p>
          
          <h2>The Turning Point</h2>
          <p>"I realized I needed to change my mindset," Sarah explains. "It wasn't about quick fixes anymore – it was about building sustainable habits."</p>
          
          <h2>The Plan</h2>
          <h3>Training</h3>
          <p>Sarah started with 3 days per week of strength training and 2 days of cardio. Her trainer helped her progressively increase intensity.</p>
          
          <h3>Nutrition</h3>
          <p>Instead of restrictive diets, Sarah learned portion control and meal prep. She focused on whole foods and balanced macronutrients.</p>
          
          <h3>Mindset</h3>
          <p>Perhaps most importantly, Sarah worked on her relationship with food and exercise. She learned to view fitness as self-care, not punishment.</p>
          
          <h2>The Results</h2>
          <p>Over 18 months, Sarah lost 50 pounds and gained incredible strength. But the physical transformation was just the beginning.</p>
          
          <h2>Life Changes</h2>
          <ul>
            <li>Increased energy levels</li>
            <li>Better sleep quality</li>
            <li>Improved confidence</li>
            <li>New friendships at the gym</li>
            <li>Inspiration for her family</li>
          </ul>
          
          <h2>Sarah's Advice</h2>
          <p>"Start where you are, not where you think you should be. Every small step counts, and consistency beats perfection every time."</p>
          
          <h2>What's Next</h2>
          <p>Sarah is now training for her first powerlifting competition and has become a source of motivation for new members at Elite Gym.</p>
        `,
        authorId: testAuthor,
        authorName: "Test Admin",
        authorImage: undefined,
        category: "success-stories" as const,
        tags: ["transformation", "weight-loss", "motivation", "success", "journey"],
        status: "published" as const,
        isFeatured: true,
        views: 891,
        likes: 127,
        readTime: 6,
        featuredImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop",
        seoTitle: "Sarah's Amazing 50-Pound Weight Loss Journey",
        seoDescription: "Discover how Sarah lost 50 pounds and transformed her life at Elite Gym. Her inspiring story shows what's possible with dedication.",
        publishedAt: now - 86400000 * 3, // 3 days ago
        createdAt: now - 86400000 * 3,
        updatedAt: now - 86400000 * 3,
      },
      {
        title: "Building Your Home Gym: Equipment Essentials",
        slug: "building-home-gym-equipment-essentials",
        excerpt: "Create an effective home gym without breaking the bank. Our trainer's guide to essential equipment that delivers maximum results.",
        content: `
          <h2>Why a Home Gym?</h2>
          <p>Home gyms offer convenience, privacy, and long-term cost savings. With the right equipment, you can achieve all your fitness goals from the comfort of your home.</p>
          
          <h2>Essential Equipment (Budget: $500-800)</h2>
          
          <h3>1. Adjustable Dumbbells</h3>
          <p>The most versatile piece of equipment. Choose adjustable ones to save space and money.</p>
          
          <h3>2. Resistance Bands Set</h3>
          <p>Perfect for travel and full-body workouts. Great for rehabilitation and strength building.</p>
          
          <h3>3. Yoga/Exercise Mat</h3>
          <p>Essential for floor exercises, stretching, and yoga sessions.</p>
          
          <h3>4. Pull-up Bar</h3>
          <p>Doorway or wall-mounted options provide excellent upper body training.</p>
          
          <h3>5. Kettlebell Set</h3>
          <p>Start with 15, 25, and 35-pound options for varied workouts.</p>
          
          <h2>Intermediate Additions ($800-1500 total)</h2>
          
          <h3>Adjustable Bench</h3>
          <p>Increases exercise variety significantly. Look for incline/decline capability.</p>
          
          <h3>Barbell and Weight Plates</h3>
          <p>Essential for serious strength training and compound movements.</p>
          
          <h2>Advanced Setup ($1500+ total)</h2>
          
          <h3>Power Rack</h3>
          <p>The centerpiece of any serious home gym. Provides safety and versatility.</p>
          
          <h3>Cardio Equipment</h3>
          <p>Consider a rowing machine or bike for space-efficient cardio.</p>
          
          <h2>Space-Saving Tips</h2>
          <ul>
            <li>Choose multi-functional equipment</li>
            <li>Use wall-mounted storage</li>
            <li>Consider foldable options</li>
            <li>Maximize vertical space</li>
          </ul>
          
          <h2>Budget-Friendly Alternatives</h2>
          <p>You can start with basic equipment and gradually build your setup. Even bodyweight exercises can be highly effective!</p>
          
          <h2>Maintenance Tips</h2>
          <p>Keep your equipment clean and properly stored. Regular maintenance ensures longevity and safety.</p>
        `,
        authorId: testAuthor,
        authorName: "Test Admin",
        authorImage: undefined,
        category: "equipment-guides" as const,
        tags: ["home-gym", "equipment", "budget", "setup", "guide"],
        status: "published" as const,
        isFeatured: false,
        views: 445,
        likes: 67,
        readTime: 10,
        featuredImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop",
        seoTitle: "Complete Home Gym Setup Guide - Equipment Essentials",
        seoDescription: "Build the perfect home gym on any budget. Our comprehensive guide covers essential equipment, space-saving tips, and setup strategies.",
        publishedAt: now - 86400000 * 1, // 1 day ago
        createdAt: now - 86400000 * 1,
        updatedAt: now - 86400000 * 1,
      },
      {
        title: "The Mind-Body Connection in Fitness",
        slug: "mind-body-connection-fitness",
        excerpt: "Explore how mental wellness and physical fitness are interconnected. Discover techniques to enhance both your mental and physical performance.",
        content: `
          <h2>Understanding the Connection</h2>
          <p>Your mind and body are more connected than you might think. Mental state directly impacts physical performance, and exercise profoundly affects mental health.</p>
          
          <h2>How Exercise Affects Mental Health</h2>
          
          <h3>Endorphin Release</h3>
          <p>Exercise triggers the release of endorphins, natural mood elevators that reduce stress and promote feelings of well-being.</p>
          
          <h3>Stress Reduction</h3>
          <p>Physical activity reduces cortisol levels and provides a healthy outlet for stress and tension.</p>
          
          <h3>Improved Sleep</h3>
          <p>Regular exercise improves sleep quality, which is crucial for mental health and cognitive function.</p>
          
          <h2>Mental Techniques for Better Workouts</h2>
          
          <h3>Visualization</h3>
          <p>Mental rehearsal can improve performance. Visualize successful lifts or completing challenging workouts.</p>
          
          <h3>Mindful Movement</h3>
          <p>Focus on the present moment during exercise. Feel each muscle working and breath you take.</p>
          
          <h3>Positive Self-Talk</h3>
          <p>Replace negative thoughts with encouraging, supportive inner dialogue.</p>
          
          <h2>Meditation and Fitness</h2>
          <p>Combining meditation with your fitness routine can enhance both practices:</p>
          <ul>
            <li>Pre-workout meditation for focus</li>
            <li>Moving meditation during exercise</li>
            <li>Post-workout reflection and gratitude</li>
          </ul>
          
          <h2>Building Mental Resilience</h2>
          <p>Challenging workouts build mental toughness that transfers to other life areas.</p>
          
          <h2>Signs of Overtraining</h2>
          <p>Listen to your body and mind. Symptoms include:</p>
          <ul>
            <li>Persistent fatigue</li>
            <li>Mood changes</li>
            <li>Decreased motivation</li>
            <li>Sleep disturbances</li>
          </ul>
          
          <h2>Creating Balance</h2>
          <p>The key is finding balance between challenging yourself and respecting your body's needs for rest and recovery.</p>
        `,
        authorId: testAuthor,
        authorName: "Test Admin",
        authorImage: undefined,
        category: "wellness" as const,
        tags: ["mental-health", "mindfulness", "wellness", "meditation", "balance"],
        status: "published" as const,
        isFeatured: false,
        views: 178,
        likes: 34,
        readTime: 7,
        featuredImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop",
        seoTitle: "Mind-Body Connection: Mental Wellness & Fitness",
        seoDescription: "Discover how mental wellness and physical fitness work together. Learn techniques to enhance both your mental and physical performance.",
        publishedAt: now - 86400000 * 2, // 2 days ago
        createdAt: now - 86400000 * 2,
        updatedAt: now - 86400000 * 2,
      }
    ];

    // Insert all posts
    const insertPromises = samplePosts.map(post => ctx.db.insert("blogPosts", post));
    await Promise.all(insertPromises);

    return { 
      message: "Successfully seeded blog posts",
      count: samplePosts.length 
    };
  },
});
