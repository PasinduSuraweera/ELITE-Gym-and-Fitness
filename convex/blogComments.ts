import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add comment to blog post
export const addComment = mutation({
  args: {
    postId: v.id("blogPosts"),
    content: v.string(),
    parentCommentId: v.optional(v.id("blogComments")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const post = await ctx.db.get(args.postId);
    if (!post || post.status !== "published") {
      throw new Error("Post not found or not published");
    }

    const commentId = await ctx.db.insert("blogComments", {
      postId: args.postId,
      userId: user._id,
      userClerkId: identity.subject,
      userName: user.name,
      userImage: user.image,
      content: args.content,
      status: "approved", // Auto-approve for now, can add moderation later
      parentCommentId: args.parentCommentId,
      likes: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return commentId;
  },
});

// Get comments for a blog post
export const getComments = query({
  args: { 
    postId: v.id("blogPosts"),
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
  },
  handler: async (ctx, args) => {
    let comments = await ctx.db
      .query("blogComments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("desc")
      .collect();

    if (args.status) {
      comments = comments.filter(comment => comment.status === args.status);
    } else {
      // Default to approved comments only for public view
      comments = comments.filter(comment => comment.status === "approved");
    }

    // Organize comments in a tree structure (parent comments with replies)
    const parentComments = comments.filter(comment => !comment.parentCommentId);
    const replies = comments.filter(comment => comment.parentCommentId);

    const commentsWithReplies = parentComments.map(parent => ({
      ...parent,
      replies: replies
        .filter(reply => reply.parentCommentId === parent._id)
        .sort((a, b) => a.createdAt - b.createdAt), // Sort replies chronologically
    }));

    return commentsWithReplies.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Update comment status (moderation)
export const updateCommentStatus = mutation({
  args: {
    commentId: v.id("blogComments"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || (user.role !== "admin" && user.role !== "trainer")) {
      throw new Error("Unauthorized: Admin or Trainer access required");
    }

    await ctx.db.patch(args.commentId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete comment
export const deleteComment = mutation({
  args: { commentId: v.id("blogComments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    // Only allow deletion by comment author or admin
    if (comment.userId !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized: You can only delete your own comments");
    }

    await ctx.db.delete(args.commentId);
    return { success: true };
  },
});

// Toggle like on comment
export const toggleCommentLike = mutation({
  args: { commentId: v.id("blogComments") },
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
      .withIndex("by_comment", (q) => q.eq("commentId", args.commentId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    if (existingLike) {
      // Unlike
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.commentId, {
        likes: Math.max(0, comment.likes - 1),
        updatedAt: Date.now(),
      });
      return { liked: false };
    } else {
      // Like
      await ctx.db.insert("blogLikes", {
        commentId: args.commentId,
        userId: user._id,
        userClerkId: identity.subject,
        type: "comment",
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.commentId, {
        likes: comment.likes + 1,
        updatedAt: Date.now(),
      });
      return { liked: true };
    }
  },
});

// Get user's liked comments
export const getUserLikedComments = query({
  args: { userClerkId: v.string() },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("blogLikes")
      .withIndex("by_user_clerk", (q) => q.eq("userClerkId", args.userClerkId))
      .filter((q) => q.eq(q.field("type"), "comment"))
      .collect();

    return likes.map(like => like.commentId).filter(Boolean);
  },
});

// Get all comments for admin moderation
export const getAllComments = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || (user.role !== "admin" && user.role !== "trainer")) {
      throw new Error("Unauthorized: Admin or Trainer access required");
    }

    let comments = await ctx.db
      .query("blogComments")
      .order("desc")
      .collect();

    if (args.status) {
      comments = comments.filter(comment => comment.status === args.status);
    }

    if (args.limit) {
      comments = comments.slice(0, args.limit);
    }

    // Enrich with post information
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const post = await ctx.db.get(comment.postId);
        return {
          ...comment,
          postTitle: post?.title || "Unknown Post",
          postSlug: post?.slug,
        };
      })
    );

    return enrichedComments;
  },
});
