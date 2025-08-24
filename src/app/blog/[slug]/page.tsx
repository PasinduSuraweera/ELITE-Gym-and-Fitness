"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft,
  Clock, 
  Eye, 
  Heart, 
  User, 
  Calendar,
  Share2,
  MessageCircle,
  Send,
  ThumbsUp,
  BookOpen,
  Target,
  Utensils,
  Award,
  Users,
  Newspaper
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Simple Badge component
const Badge = ({ children, className = "", variant = "default" }: { 
  children: React.ReactNode; 
  className?: string; 
  variant?: "default" | "outline" | "secondary"
}) => {
  const baseClasses = "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variantClasses = {
    default: "border-transparent bg-red-600/20 text-red-400",
    outline: "border-gray-600 text-gray-400 bg-transparent",
    secondary: "border-transparent bg-orange-600/20 text-orange-400"
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

const categoryConfig = {
  "workout-tips": { label: "Workout Tips", icon: Target, color: "text-red-400" },
  "nutrition": { label: "Nutrition", icon: Utensils, color: "text-green-400" },
  "success-stories": { label: "Success Stories", icon: Award, color: "text-yellow-400" },
  "trainer-insights": { label: "Trainer Insights", icon: Users, color: "text-blue-400" },
  "equipment-guides": { label: "Equipment Guides", icon: BookOpen, color: "text-purple-400" },
  "wellness": { label: "Wellness", icon: Heart, color: "text-pink-400" },
  "news": { label: "News", icon: Newspaper, color: "text-orange-400" },
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [hasViewedThisSession, setHasViewedThisSession] = useState(false);
  const [viewsJustIncremented, setViewsJustIncremented] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the blog post
  const post = useQuery(api.blog.getBlogPostBySlug, { 
    slug: slug as string 
  });

  // Get related posts
  const relatedPosts = useQuery(
    api.blog.getRelatedPosts,
    post ? { postId: post._id, limit: 3 } : "skip"
  );

  // Get comments
  const comments = useQuery(
    api.blogComments.getComments,
    post ? { postId: post._id } : "skip"
  );

  // Get user's liked posts and comments
  const userLikedPosts = useQuery(
    api.blog.getUserLikedPosts,
    user ? { userClerkId: user.id } : "skip"
  );

  const userLikedComments = useQuery(
    api.blogComments.getUserLikedComments,
    user ? { userClerkId: user.id } : "skip"
  );

  // Mutations
  const incrementViews = useMutation(api.blog.incrementPostViews);
  const toggleLike = useMutation(api.blog.toggleBlogPostLike);
  const addComment = useMutation(api.blogComments.addComment);
  const toggleCommentLike = useMutation(api.blogComments.toggleCommentLike);

  // Increment views when post loads (only once per session)
  useEffect(() => {
    if (post && mounted && !hasViewedThisSession) {
      // Check if we've already viewed this post in this session
      const sessionKey = `viewed_post_${post._id}`;
      const hasViewed = sessionStorage.getItem(sessionKey);
      
      if (!hasViewed) {
        incrementViews({ postId: post._id }).then(() => {
          setViewsJustIncremented(true);
          // Remove the indicator after 2 seconds
          setTimeout(() => setViewsJustIncremented(false), 2000);
        });
        sessionStorage.setItem(sessionKey, 'true');
        setHasViewedThisSession(true);
      }
    }
  }, [post, mounted, hasViewedThisSession, incrementViews]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLikePost = async () => {
    if (!user || !post) return;
    try {
      await toggleLike({ postId: post._id });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post || !commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await addComment({
        postId: post._id,
        content: commentText.trim(),
      });
      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) return;
    try {
      await toggleCommentLike({ commentId: commentId as any });
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying URL
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-gray-800 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-800 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-800 rounded mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Article Not Found</h1>
            <p className="text-gray-400 mb-8">The article you're looking for doesn't exist or has been removed.</p>
            <Link href="/blog">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categoryInfo = categoryConfig[post.category as keyof typeof categoryConfig];
  const Icon = categoryInfo?.icon || BookOpen;
  const isLiked = userLikedPosts?.includes(post._id) || false;

  return (
    <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black" suppressHydrationWarning>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20" suppressHydrationWarning></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_50%)]" suppressHydrationWarning></div>
      
      <div className="container mx-auto px-4 py-32 relative z-10 flex-1" suppressHydrationWarning>
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Article Header */}
          <article className="mb-12">
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Icon className={`h-4 w-4 ${categoryInfo?.color || 'text-gray-400'}`} />
                <span className="text-sm text-gray-400 bg-gray-800/50 px-2 py-1 rounded">{categoryInfo?.label || post.category}</span>
                {post.isFeatured && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">Featured</span>}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {post.title}
              </h1>
              
              <p className="text-lg text-gray-400 mb-6">
                {post.excerpt}
              </p>

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-6 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  {post.authorImage && (
                    <Image
                      src={post.authorImage}
                      alt={post.authorName}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span>{post.authorName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.publishedAt || post.createdAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime} min read
                </div>
                <div className="flex items-center gap-1">
                  <Eye className={`h-4 w-4 ${viewsJustIncremented ? 'text-green-400 animate-pulse' : ''}`} />
                  <span className={viewsJustIncremented ? 'text-green-400 font-medium' : ''}>
                    {post.views} views
                  </span>
                  {viewsJustIncremented && <span className="text-xs text-green-400 ml-1">+1</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleLikePost}
                  disabled={!user}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                    isLiked 
                      ? "bg-red-600/20 text-red-400 border border-red-500/50" 
                      : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-red-500/50 hover:text-red-400"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  {post.likes}
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-red-500/50 hover:text-red-400 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>

                <button
                  onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-red-500/50 hover:text-red-400 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  {comments?.length || 0}
                </button>
              </div>
            </header>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="mb-8">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="mb-12">
              <div 
                className="prose prose-lg prose-invert max-w-none text-gray-300 leading-relaxed
                  prose-headings:text-white prose-headings:font-semibold
                  prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                  prose-strong:text-white prose-strong:font-semibold
                  prose-em:text-gray-200 prose-em:italic
                  prose-blockquote:border-l-red-500 prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:text-gray-400
                  prose-code:bg-gray-800 prose-code:text-red-400 prose-code:px-1 prose-code:rounded
                  prose-a:text-red-400 prose-a:no-underline hover:prose-a:text-red-300
                  prose-ul:list-disc prose-ol:list-decimal
                  prose-li:text-gray-300"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-12 pt-6 border-t border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-800/50 text-gray-400 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Comments Section */}
          <section id="comments" className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Comments ({comments?.length || 0})
            </h2>

            {/* Add Comment Form */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-8 bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                <div className="flex gap-3">
                  {user.imageUrl && (
                    <Image
                      src={user.imageUrl}
                      alt={user.firstName || "User"}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 rounded-lg p-3 mb-3 resize-none"
                      rows={3}
                      disabled={isSubmittingComment}
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim() || isSubmittingComment}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      <Send className="h-4 w-4 mr-2 inline" />
                      {isSubmittingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 mb-8 text-center">
                <p className="text-gray-400 mb-4">Please sign in to leave a comment</p>
                <Link href="/sign-in">
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    Sign In
                  </button>
                </Link>
              </div>
            )}

            {/* Comments List */}
            {comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {comment.userImage && (
                        <Image
                          src={comment.userImage}
                          alt={comment.userName}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-white text-sm">{comment.userName}</span>
                          <span className="text-gray-500 text-xs">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{comment.content}</p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleLikeComment(comment._id)}
                            disabled={!user}
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              userLikedComments?.includes(comment._id) 
                                ? "text-red-400" 
                                : "text-gray-500 hover:text-red-400"
                            }`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            {comment.likes}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </section>

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => {
                  const relatedCategoryInfo = categoryConfig[relatedPost.category as keyof typeof categoryConfig];
                  const RelatedIcon = relatedCategoryInfo?.icon || BookOpen;
                  
                  return (
                    <Link key={relatedPost._id} href={`/blog/${relatedPost.slug}`}>
                      <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden hover:border-red-500/50 transition-all duration-300 group h-full flex flex-col cursor-pointer">
                        {relatedPost.featuredImage && (
                          <div className="h-32 bg-gray-800 relative overflow-hidden flex-shrink-0">
                            <Image
                              src={relatedPost.featuredImage}
                              alt={relatedPost.title}
                              width={300}
                              height={150}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-center gap-2 mb-2">
                            <RelatedIcon className={`h-4 w-4 ${relatedCategoryInfo?.color || 'text-gray-400'}`} />
                            <span className="text-xs text-gray-400 uppercase tracking-wider">
                              {relatedCategoryInfo?.label || relatedPost.category}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-2 mb-4 min-h-[2.5rem] flex-1">
                            {relatedPost.title}
                          </h3>
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {relatedPost.readTime} min
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {relatedPost.views}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
