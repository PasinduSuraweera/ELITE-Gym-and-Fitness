import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed sample blog posts
export const seedBlogPosts = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Check if posts already exist
    const existingPosts = await ctx.db.query("blogPosts").collect();
    if (existingPosts.length > 0) {
      return { message: "Blog posts already exist", count: existingPosts.length };
    }

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
          
          <h2>How to Progress</h2>
          <p>Start with 2-3 sets of each exercise, 2-3 times per week. Focus on form over speed or repetitions.</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "workout-tips" as const,
        tags: ["core", "strength", "exercises", "fitness", "beginner"],
        status: "published" as const,
        authorId: currentUser._id,
        authorName: currentUser.name,
        authorImage: currentUser.image,
        readTime: 8,
        views: 127,
        likes: 23,
        isFeatured: true,
        publishedAt: now - (7 * 24 * 60 * 60 * 1000), // 7 days ago
        seoTitle: "10 Essential Core Exercises for Maximum Strength | Elite Gym",
        seoDescription: "Master these 10 core exercises to build strength, improve posture, and enhance performance. Complete guide with progressions for all fitness levels.",
        createdAt: now - (7 * 24 * 60 * 60 * 1000),
        updatedAt: now - (7 * 24 * 60 * 60 * 1000),
      },
      {
        title: "The Complete Guide to Pre and Post Workout Nutrition",
        slug: "complete-guide-pre-post-workout-nutrition",
        excerpt: "Maximize your workout results with proper nutrition timing. Learn what to eat before and after training for optimal performance and recovery.",
        content: `
          <h2>Fuel Your Performance</h2>
          <p>What you eat before and after your workout can significantly impact your performance, recovery, and results. Let's break down the science of workout nutrition.</p>
          
          <h2>Pre-Workout Nutrition</h2>
          <h3>Timing</h3>
          <p>Eat your pre-workout meal 1-3 hours before training, depending on the size of the meal.</p>
          
          <h3>What to Eat</h3>
          <ul>
            <li><strong>Carbohydrates:</strong> Your body's preferred fuel source</li>
            <li><strong>Moderate Protein:</strong> Supports muscle protein synthesis</li>
            <li><strong>Low Fat:</strong> Avoid foods that slow digestion</li>
          </ul>
          
          <h3>Pre-Workout Meal Ideas</h3>
          <ul>
            <li>Banana with almond butter</li>
            <li>Greek yogurt with berries</li>
            <li>Oatmeal with protein powder</li>
          </ul>
          
          <h2>Post-Workout Nutrition</h2>
          <h3>The Anabolic Window</h3>
          <p>While not as critical as once believed, eating within 2 hours post-workout optimizes recovery.</p>
          
          <h3>Recovery Essentials</h3>
          <ul>
            <li><strong>Protein:</strong> 20-40g to stimulate muscle protein synthesis</li>
            <li><strong>Carbohydrates:</strong> Replenish glycogen stores</li>
            <li><strong>Hydration:</strong> Replace fluids lost through sweat</li>
          </ul>
        `,
        featuredImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "nutrition" as const,
        tags: ["nutrition", "pre-workout", "post-workout", "recovery", "performance"],
        status: "published" as const,
        authorId: currentUser._id,
        authorName: currentUser.name,
        authorImage: currentUser.image,
        readTime: 12,
        views: 89,
        likes: 15,
        isFeatured: true,
        publishedAt: now - (5 * 24 * 60 * 60 * 1000), // 5 days ago
        seoTitle: "Pre & Post Workout Nutrition Guide | Elite Gym & Fitness",
        seoDescription: "Complete guide to workout nutrition. Learn optimal pre and post-workout meals for maximum performance and recovery.",
        createdAt: now - (5 * 24 * 60 * 60 * 1000),
        updatedAt: now - (5 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Sarah's Incredible 50-Pound Weight Loss Journey",
        slug: "sarah-incredible-50-pound-weight-loss-journey",
        excerpt: "Follow Sarah's inspiring transformation from struggling with confidence to becoming a fitness enthusiast. Her story will motivate you to start your own journey.",
        content: `
          <h2>The Beginning</h2>
          <p>Sarah joined Elite Gym & Fitness at 32, weighing 200 pounds and struggling with confidence. Like many, she had tried various diets and workout plans without lasting success.</p>
          
          <h2>The Turning Point</h2>
          <p>"I realized I needed more than just a gym membership. I needed guidance, support, and a sustainable approach," Sarah recalls.</p>
          
          <h2>Her Strategy</h2>
          <h3>Training</h3>
          <ul>
            <li>3 strength training sessions per week</li>
            <li>2 cardio sessions focusing on activities she enjoyed</li>
            <li>Weekly personal training sessions for accountability</li>
          </ul>
          
          <h3>Nutrition</h3>
          <ul>
            <li>Worked with our nutrition coach to create a sustainable meal plan</li>
            <li>Focused on whole foods and proper portions</li>
            <li>Allowed flexibility for social events and treats</li>
          </ul>
          
          <h2>The Results</h2>
          <p>Over 14 months, Sarah lost 50 pounds, gained significant strength, and most importantly, developed a love for fitness that continues today.</p>
          
          <h2>Sarah's Advice</h2>
          <blockquote>
            <p>"Start small, be consistent, and don't be afraid to ask for help. The Elite Gym community became my second family, and their support was invaluable."</p>
          </blockquote>
          
          <p>Today, Sarah maintains her weight loss and has even started participating in local 5K races. Her transformation goes far beyond the physical – she's gained confidence, energy, and a new lease on life.</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "success-stories" as const,
        tags: ["weight-loss", "transformation", "motivation", "success-story", "community"],
        status: "published" as const,
        authorId: currentUser._id,
        authorName: currentUser.name,
        authorImage: currentUser.image,
        readTime: 6,
        views: 203,
        likes: 45,
        isFeatured: true,
        publishedAt: now - (3 * 24 * 60 * 60 * 1000), // 3 days ago
        seoTitle: "Sarah's 50-Pound Weight Loss Success Story | Elite Gym",
        seoDescription: "Read Sarah's inspiring 50-pound weight loss transformation. Discover the strategies and support that led to her incredible success.",
        createdAt: now - (3 * 24 * 60 * 60 * 1000),
        updatedAt: now - (3 * 24 * 60 * 60 * 1000),
      },
      {
        title: "5 Common Gym Mistakes That Are Sabotaging Your Progress",
        slug: "5-common-gym-mistakes-sabotaging-progress",
        excerpt: "Avoid these frequent training errors that could be holding you back from reaching your fitness goals. Learn the correct approach from our expert trainers.",
        content: `
          <h2>Introduction</h2>
          <p>Even with the best intentions, many gym-goers unknowingly make mistakes that hinder their progress. Our trainers see these errors daily. Here are the top 5 mistakes and how to fix them.</p>
          
          <h2>Mistake #1: Skipping Warm-Up</h2>
          <p><strong>The Problem:</strong> Jumping straight into intense exercise without preparing your body.</p>
          <p><strong>The Fix:</strong> Spend 5-10 minutes with dynamic movements like leg swings, arm circles, and light cardio.</p>
          
          <h2>Mistake #2: Poor Form</h2>
          <p><strong>The Problem:</strong> Prioritizing weight over proper technique.</p>
          <p><strong>The Fix:</strong> Master bodyweight movements first, then gradually add resistance while maintaining perfect form.</p>
          
          <h2>Mistake #3: Not Progressive Overload</h2>
          <p><strong>The Problem:</strong> Using the same weights and reps week after week.</p>
          <p><strong>The Fix:</strong> Gradually increase weight, reps, or sets every 1-2 weeks to continue challenging your muscles.</p>
          
          <h2>Mistake #4: Ignoring Recovery</h2>
          <p><strong>The Problem:</strong> Training the same muscles every day without adequate rest.</p>
          <p><strong>The Fix:</strong> Allow 48 hours between training the same muscle groups. Focus on sleep and stress management.</p>
          
          <h2>Mistake #5: Inconsistent Training</h2>
          <p><strong>The Problem:</strong> Working out sporadically without a structured plan.</p>
          <p><strong>The Fix:</strong> Create a realistic schedule you can stick to. Consistency beats intensity every time.</p>
          
          <h2>Take Action</h2>
          <p>Identify which mistakes you might be making and focus on fixing one at a time. Consider working with a personal trainer to ensure you're on the right track.</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "trainer-insights" as const,
        tags: ["mistakes", "training", "form", "progress", "tips"],
        status: "published" as const,
        authorId: currentUser._id,
        authorName: currentUser.name,
        authorImage: currentUser.image,
        readTime: 7,
        views: 156,
        likes: 32,
        isFeatured: false,
        publishedAt: now - (2 * 24 * 60 * 60 * 1000), // 2 days ago
        seoTitle: "5 Common Gym Mistakes Sabotaging Your Progress | Elite Gym",
        seoDescription: "Avoid these 5 common gym mistakes that prevent progress. Expert trainer tips to fix your form, training, and recovery for better results.",
        createdAt: now - (2 * 24 * 60 * 60 * 1000),
        updatedAt: now - (2 * 24 * 60 * 60 * 1000),
      },
      {
        title: "The Ultimate Guide to Home Gym Equipment on a Budget",
        slug: "ultimate-guide-home-gym-equipment-budget",
        excerpt: "Build an effective home gym without breaking the bank. Our equipment guide covers the essentials for a complete workout setup under $500.",
        content: `
          <h2>Building Your Home Gym</h2>
          <p>You don't need a massive budget to create an effective home gym. With smart choices, you can build a complete setup for under $500 that rivals expensive gym equipment.</p>
          
          <h2>Essential Equipment (Under $500 Total)</h2>
          
          <h3>1. Adjustable Dumbbells ($150-200)</h3>
          <p>The most versatile piece of equipment. Look for sets that adjust from 5-50 pounds per dumbbell.</p>
          <p><strong>Why Essential:</strong> Full-body workouts, progressive overload, space-efficient.</p>
          
          <h3>2. Resistance Bands Set ($30-50)</h3>
          <p>Multiple resistance levels for strength training and rehabilitation.</p>
          <p><strong>Why Essential:</strong> Portable, joint-friendly, variable resistance.</p>
          
          <h3>3. Exercise Mat ($20-40)</h3>
          <p>Quality mat for floor exercises, stretching, and yoga.</p>
          <p><strong>Why Essential:</strong> Comfort and safety for ground-based movements.</p>
          
          <h3>4. Pull-up Bar ($30-60)</h3>
          <p>Doorway-mounted bar for upper body pulling exercises.</p>
          <p><strong>Why Essential:</strong> Upper body strength, core engagement, functional movement.</p>
          
          <h3>5. Kettlebell (20-35 lbs) ($40-70)</h3>
          <p>Single kettlebell for dynamic, full-body movements.</p>
          <p><strong>Why Essential:</strong> Cardio + strength, functional patterns, efficient workouts.</p>
          
          <h3>6. Stability Ball ($15-25)</h3>
          <p>Great for core work and adding instability to exercises.</p>
          <p><strong>Why Essential:</strong> Core training, balance, rehabilitation.</p>
          
          <h2>Bonus Equipment (If Budget Allows)</h2>
          <ul>
            <li>Foam roller for recovery ($25-40)</li>
            <li>Jump rope for cardio ($10-20)</li>
            <li>Suspension trainer ($100-150)</li>
          </ul>
          
          <h2>Sample Workouts</h2>
          <p>With this equipment, you can perform:</p>
          <ul>
            <li>Full-body strength training</li>
            <li>HIIT cardio sessions</li>
            <li>Flexibility and mobility work</li>
            <li>Rehabilitation exercises</li>
          </ul>
          
          <h2>Shopping Tips</h2>
          <ul>
            <li>Buy used equipment when possible</li>
            <li>Check for sales during January and summer months</li>
            <li>Read reviews before purchasing</li>
            <li>Start with basics and add equipment over time</li>
          </ul>
        `,
        featuredImage: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        category: "equipment-guides" as const,
        tags: ["home-gym", "equipment", "budget", "dumbbells", "kettlebell"],
        status: "published" as const,
        authorId: currentUser._id,
        authorName: currentUser.name,
        authorImage: currentUser.image,
        readTime: 10,
        views: 78,
        likes: 19,
        isFeatured: false,
        publishedAt: now - (1 * 24 * 60 * 60 * 1000), // 1 day ago
        seoTitle: "Home Gym Equipment Guide Under $500 | Elite Gym & Fitness",
        seoDescription: "Build the perfect home gym on a budget. Complete equipment guide with recommendations under $500 for effective full-body workouts.",
        createdAt: now - (1 * 24 * 60 * 60 * 1000),
        updatedAt: now - (1 * 24 * 60 * 60 * 1000),
      },
    ];

    // Insert all sample posts
    const postIds = [];
    for (const post of samplePosts) {
      const postId = await ctx.db.insert("blogPosts", post);
      postIds.push(postId);
    }

    return { 
      message: "Sample blog posts created successfully", 
      count: postIds.length,
      postIds 
    };
  },
});
