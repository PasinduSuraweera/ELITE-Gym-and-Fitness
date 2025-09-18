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
    default: "border-transparent bg-primary/20 text-primary",
    outline: "border-border text-muted-foreground bg-transparent",
    secondary: "border-transparent bg-secondary/20 text-secondary-foreground"
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
      <div className="flex flex-col min-h-screen overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-primary/5"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-muted rounded mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-primary/5"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or has been removed.</p>
            <Link href="/blog">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
    <div className="flex flex-col min-h-screen overflow-hidden relative bg-background" suppressHydrationWarning>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-primary/5" suppressHydrationWarning></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1)_0%,transparent_50%)]" suppressHydrationWarning></div>
      
      <div className="container mx-auto px-4 py-32 relative z-10 flex-1" suppressHydrationWarning>
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-base">
            <ArrowLeft className="h-5 w-5" />
            Back to Blog
          </Link>

          {/* Article Header */}
          <article className="mb-12">
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Icon className={`h-5 w-5 ${categoryInfo?.color || 'text-muted-foreground'}`} />
                <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-md">{categoryInfo?.label || post.category}</span>
                {post.isFeatured && <span className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md font-medium">Featured</span>}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                {post.title}
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
                {post.excerpt}
              </p>

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 text-base text-muted-foreground pb-8 border-b border-border">
                <div className="flex items-center gap-3">
                  {post.authorImage && (
                    <Image
                      src={post.authorImage}
                      alt={post.authorName}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="font-medium">{post.authorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {formatDate(post.publishedAt || post.createdAt)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {post.readTime} min read
                </div>
                <div className="flex items-center gap-2">
                  <Eye className={`h-5 w-5 ${viewsJustIncremented ? 'text-green-500 animate-pulse' : ''}`} />
                  <span className={viewsJustIncremented ? 'text-green-500 font-medium' : ''}>
                    {post.views} views
                  </span>
                  {viewsJustIncremented && <span className="text-sm text-green-500 ml-1">+1</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mt-8">
                <button
                  onClick={handleLikePost}
                  disabled={!user}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-base font-medium transition-colors ${
                    isLiked 
                      ? "bg-primary/20 text-primary border border-primary/50" 
                      : "bg-muted/50 text-muted-foreground border border-border hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                  {post.likes}
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-medium bg-muted/50 text-muted-foreground border border-border hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </button>

                <button
                  onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-medium bg-muted/50 text-muted-foreground border border-border hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
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
            <div className="mb-16">
              <div 
                className="prose prose-xl prose-neutral dark:prose-invert max-w-none text-foreground leading-relaxed
                  prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight
                  prose-h1:text-4xl prose-h1:mb-8 prose-h2:text-3xl prose-h2:mb-6 prose-h3:text-2xl prose-h3:mb-4
                  prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6
                  prose-strong:text-foreground prose-strong:font-bold
                  prose-em:text-foreground prose-em:italic
                  prose-blockquote:border-l-primary prose-blockquote:border-l-4 prose-blockquote:pl-6 prose-blockquote:text-muted-foreground prose-blockquote:italic prose-blockquote:text-lg
                  prose-code:bg-muted prose-code:text-primary prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-base
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                  prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
                  prose-li:text-lg prose-li:leading-relaxed prose-li:mb-2"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mb-16 pt-8 border-t border-border">
                <h3 className="text-2xl font-bold text-foreground mb-6">Tags</h3>
                <div className="flex flex-wrap gap-3">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-sm bg-muted/50 text-muted-foreground px-4 py-2 rounded-lg border border-border hover:border-primary/50 transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Comments Section */}
          <section id="comments" className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Comments ({comments?.length || 0})
            </h2>

            {/* Add Comment Form */}
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-12 bg-card/50 border border-border rounded-lg p-6">
                <div className="flex gap-4">
                  {user.imageUrl && (
                    <Image
                      src={user.imageUrl}
                      alt={user.firstName || "User"}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-background border border-border text-foreground placeholder-muted-foreground rounded-lg p-4 mb-4 resize-none text-base"
                      rows={4}
                      disabled={isSubmittingComment}
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim() || isSubmittingComment}
                      className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-base font-medium transition-colors disabled:opacity-50"
                    >
                      <Send className="h-4 w-4 mr-2 inline" />
                      {isSubmittingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-card/50 border border-border rounded-lg p-8 mb-12 text-center">
                <p className="text-muted-foreground mb-6 text-lg">Please sign in to leave a comment</p>
                <Link href="/sign-in">
                  <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-base font-medium">
                    Sign In
                  </button>
                </Link>
              </div>
            )}

            {/* Comments List */}
            {comments && comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment._id} className="bg-card/50 border border-border rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      {comment.userImage && (
                        <Image
                          src={comment.userImage}
                          alt={comment.userName}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-semibold text-foreground text-base">{comment.userName}</span>
                          <span className="text-muted-foreground text-sm">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-foreground text-base mb-4 leading-relaxed">{comment.content}</p>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLikeComment(comment._id)}
                            disabled={!user}
                            className={`flex items-center gap-2 text-sm transition-colors ${
                              userLikedComments?.includes(comment._id) 
                                ? "text-primary" 
                                : "text-muted-foreground hover:text-primary"
                            }`}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            {comment.likes}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <p className="text-muted-foreground text-lg">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </section>

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-10">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => {
                  const relatedCategoryInfo = categoryConfig[relatedPost.category as keyof typeof categoryConfig];
                  const RelatedIcon = relatedCategoryInfo?.icon || BookOpen;
                  
                  return (
                    <Link key={relatedPost._id} href={`/blog/${relatedPost.slug}`}>
                      <div className="bg-card/50 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 group h-full flex flex-col cursor-pointer">
                        {relatedPost.featuredImage && (
                          <div className="h-40 bg-muted relative overflow-hidden flex-shrink-0">
                            <Image
                              src={relatedPost.featuredImage}
                              alt={relatedPost.title}
                              width={400}
                              height={200}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-center gap-2 mb-3">
                            <RelatedIcon className={`h-4 w-4 ${relatedCategoryInfo?.color || 'text-muted-foreground'}`} />
                            <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                              {relatedCategoryInfo?.label || relatedPost.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-6 min-h-[3.5rem] flex-1">
                            {relatedPost.title}
                          </h3>
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {relatedPost.readTime} min
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
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
