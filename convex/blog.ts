import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Helper function to estimate read time
function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Create a new blog post (admin/trainer only)
export const createBlogPost = mutation({
  args: {
    title: v.string(),
    excerpt: v.string(),
    content: v.string(),
    featuredImage: v.optional(v.string()),
    category: v.union(
      v.literal("workout-tips"),
      v.literal("nutrition"),
      v.literal("success-stories"),
      v.literal("trainer-insights"),
      v.literal("equipment-guides"),
      v.literal("wellness"),
      v.literal("news")
    ),
    tags: v.array(v.string()),
    status: v.union(v.literal("draft"), v.literal("published")),
    isFeatured: v.boolean(),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "trainer")) {
      throw new Error("Unauthorized: Admin or Trainer access required");
    }

    const slug = generateSlug(args.title);
    
    // Check if slug already exists
    const existingPost = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    
    const finalSlug = existingPost ? `${slug}-${Date.now()}` : slug;
    const readTime = estimateReadTime(args.content);
    const now = Date.now();

    const postId = await ctx.db.insert("blogPosts", {
      ...args,
      slug: finalSlug,
      authorId: currentUser._id,
      authorName: currentUser.name,
      authorImage: currentUser.image,
      readTime,
      views: 0,
      likes: 0,
      publishedAt: args.status === "published" ? now : undefined,
      createdAt: now,
      updatedAt: now,
    });

    return postId;
  },
});

// Update blog post
export const updateBlogPost = mutation({
  args: {
    postId: v.id("blogPosts"),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    featuredImage: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("workout-tips"),
      v.literal("nutrition"),
      v.literal("success-stories"),
      v.literal("trainer-insights"),
      v.literal("equipment-guides"),
      v.literal("wellness"),
      v.literal("news")
    )),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    isFeatured: v.optional(v.boolean()),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "trainer")) {
      throw new Error("Unauthorized: Admin or Trainer access required");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    
    // Only allow authors to edit their own posts (unless admin)
    if (currentUser.role !== "admin" && post.authorId !== currentUser._id) {
      throw new Error("Unauthorized: You can only edit your own posts");
    }

    const updateData: any = {
      ...args,
      updatedAt: Date.now(),
    };

    // Update slug if title changed
    if (args.title && args.title !== post.title) {
      updateData.slug = generateSlug(args.title);
    }

    // Update read time if content changed
    if (args.content && args.content !== post.content) {
      updateData.readTime = estimateReadTime(args.content);
    }

    // Set published date if status changed to published
    if (args.status === "published" && post.status !== "published") {
      updateData.publishedAt = Date.now();
    }

    delete updateData.postId;
    await ctx.db.patch(args.postId, updateData);
    
    return { success: true };
  },
});

// Delete blog post
export const deleteBlogPost = mutation({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.delete(args.postId);
    return { success: true };
  },
});

// Get all blog posts with filters
export const getBlogPosts = query({
  args: {
    category: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))),
    featured: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    authorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let posts;

    if (args.status) {
      // Use index when status is provided
      posts = await ctx.db
        .query("blogPosts")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      // Get all posts when no status filter
      posts = await ctx.db
        .query("blogPosts")
        .order("desc")
        .collect();
    }

    // Apply filters
    if (args.category) {
      posts = posts.filter(post => post.category === args.category);
    }

    if (args.featured !== undefined) {
      posts = posts.filter(post => post.isFeatured === args.featured);
    }

    if (args.authorId) {
      posts = posts.filter(post => post.authorId === args.authorId);
    }

    // Sort by published date for published posts, creation date for others
    posts.sort((a, b) => {
      const aDate = a.publishedAt || a.createdAt;
      const bDate = b.publishedAt || b.createdAt;
      return bDate - aDate;
    });

    if (args.limit) {
      posts = posts.slice(0, args.limit);
    }

    return posts;
  },
});

// Get single blog post by slug
export const getBlogPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return post;
  },
});

// Get single blog post by ID
export const getBlogPostById = query({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.postId);
  },
});

// Increment post views with basic spam protection
export const incrementPostViews = mutation({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return;

    // Get the current time and check if we should throttle
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000; // 1 minute throttle
    
    // For now, we'll just increment - you could add more sophisticated tracking
    // like storing view logs with IP addresses or user IDs for better deduplication
    
    await ctx.db.patch(args.postId, {
      views: post.views + 1,
      updatedAt: now,
    });

    return { success: true, newViewCount: post.views + 1 };
  },
});

// Toggle like on blog post
export const toggleBlogPostLike = mutation({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const existingLike = await ctx.db
      .query("blogLikes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.postId, {
        likes: Math.max(0, post.likes - 1),
        updatedAt: Date.now(),
      });
      return { liked: false };
    } else {
      // Like
      await ctx.db.insert("blogLikes", {
        postId: args.postId,
        userId: user._id,
        userClerkId: identity.subject,
        type: "post",
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.postId, {
        likes: post.likes + 1,
        updatedAt: Date.now(),
      });
      return { liked: true };
    }
  },
});

// Get user's liked posts
export const getUserLikedPosts = query({
  args: { userClerkId: v.string() },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("blogLikes")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", args.userClerkId))
      .filter((q) => q.eq(q.field("type"), "post"))
      .collect();

    return likes.map(like => like.postId).filter(Boolean);
  },
});

// Search blog posts
export const searchBlogPosts = query({
  args: { 
    searchTerm: v.string(),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const searchTerm = args.searchTerm.toLowerCase();

    // Filter by search term
    posts = posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    // Filter by category if provided
    if (args.category) {
      posts = posts.filter(post => post.category === args.category);
    }

    // Sort by relevance (title matches first, then excerpt, then content)
    posts.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(searchTerm) ? 3 : 0;
      const aExcerpt = a.excerpt.toLowerCase().includes(searchTerm) ? 2 : 0;
      const aContent = a.content.toLowerCase().includes(searchTerm) ? 1 : 0;
      const aScore = aTitle + aExcerpt + aContent;

      const bTitle = b.title.toLowerCase().includes(searchTerm) ? 3 : 0;
      const bExcerpt = b.excerpt.toLowerCase().includes(searchTerm) ? 2 : 0;
      const bContent = b.content.toLowerCase().includes(searchTerm) ? 1 : 0;
      const bScore = bTitle + bExcerpt + bContent;

      return bScore - aScore;
    });

    if (args.limit) {
      posts = posts.slice(0, args.limit);
    }

    return posts;
  },
});

// Get related posts
export const getRelatedPosts = query({
  args: { 
    postId: v.id("blogPosts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentPost = await ctx.db.get(args.postId);
    if (!currentPost) return [];

    let posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    // Remove current post
    posts = posts.filter(post => post._id !== args.postId);

    // Score posts by relevance
    const scoredPosts = posts.map(post => {
      let score = 0;
      
      // Same category gets high score
      if (post.category === currentPost.category) score += 10;
      
      // Shared tags get medium score
      const sharedTags = post.tags.filter(tag => 
        currentPost.tags.includes(tag)
      ).length;
      score += sharedTags * 3;
      
      // Same author gets small score
      if (post.authorId === currentPost.authorId) score += 2;

      return { ...post, score };
    });

    // Sort by score and recency
    scoredPosts.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt);
    });

    const limit = args.limit || 3;
    return scoredPosts.slice(0, limit).map(({ score, ...post }) => post);
  },
});

// Get blog statistics
export const getBlogStats = query({
  args: {},
  handler: async (ctx, args) => {
    const posts = await ctx.db.query("blogPosts").collect();
    
    const published = posts.filter(p => p.status === "published").length;
    const drafts = posts.filter(p => p.status === "draft").length;
    const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
    const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);

    const categories = posts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPosts: posts.length,
      published,
      drafts,
      totalViews,
      totalLikes,
      categories,
    };
  },
});

// Get trending posts (most viewed in last 7 days)
export const getTrendingPosts = query({
  args: { 
    limit: v.optional(v.number()),
    days: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    const days = args.days || 7;
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    let posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    // Filter posts updated/published in the last N days and sort by views
    posts = posts
      .filter(post => (post.publishedAt || post.createdAt) > since)
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);

    return posts;
  },
});

// Get most popular posts (all time)
export const getPopularPosts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    let posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    // Sort by views (descending)
    posts = posts
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);

    return posts;
  },
});
