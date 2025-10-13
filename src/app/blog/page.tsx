"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { 
  Search, 
  Clock, 
  Eye, 
  Heart, 
  User, 
  Target,
  Utensils,
  Award,
  Users,
  BookOpen,
  Newspaper
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const categoryConfig = {
  "workout-tips": { label: "Workout Tips", icon: Target, color: "text-red-400" },
  "nutrition": { label: "Nutrition", icon: Utensils, color: "text-green-400" },
  "success-stories": { label: "Success Stories", icon: Award, color: "text-yellow-400" },
  "trainer-insights": { label: "Trainer Insights", icon: Users, color: "text-blue-400" },
  "equipment-guides": { label: "Equipment Guides", icon: BookOpen, color: "text-purple-400" },
  "wellness": { label: "Wellness", icon: Heart, color: "text-pink-400" },
  "news": { label: "News", icon: Newspaper, color: "text-orange-400" },
};

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(9);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset display limit when category or search term changes
  useEffect(() => {
    setDisplayLimit(9);
  }, [selectedCategory, searchTerm]);

  const loadMore = () => {
    setDisplayLimit(prev => prev + 9);
  };

  // Get featured posts
  const featuredPosts = useQuery(api.blog.getBlogPosts, {
    status: "published",
    featured: true,
    limit: 3,
  });

  // Get all posts for the selected category (no limit)
  const allPosts = useQuery(api.blog.getBlogPosts, {
    status: "published",
    category: selectedCategory,
  });

  // Search posts if there's a search term
  const searchResults = useQuery(
    api.blog.searchBlogPosts,
    searchTerm.trim() ? {
      searchTerm: searchTerm.trim(),
      category: selectedCategory,
    } : "skip"
  );

  // Get blog stats
  const blogStats = useQuery(api.blog.getBlogStats, {});

  // Determine which posts to display and apply pagination
  const basePosts = searchTerm.trim() ? searchResults : allPosts;
  const displayPosts = basePosts?.slice(0, displayLimit);
  const hasMore = basePosts && basePosts.length > displayLimit;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb,220,38,38),0.1)_0%,transparent_50%)]"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
          <div className="animate-pulse max-w-6xl mx-auto">
            <div className="h-16 bg-muted rounded-2xl w-2/3 mx-auto mb-12"></div>
            <div className="h-12 bg-muted/50 rounded-xl w-1/3 mx-auto mb-16"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-muted/30 h-80 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background" suppressHydrationWarning>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5" suppressHydrationWarning></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb,220,38,38),0.1)_0%,transparent_50%)]" suppressHydrationWarning></div>
      
      <div className="container mx-auto px-4 py-32 relative z-10 flex-1" suppressHydrationWarning>
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-12" suppressHydrationWarning>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
            <span className="text-primary">Fitness</span> Blog
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Expert insights, workout tips, and success stories to power your fitness journey
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="max-w-7xl mx-auto mb-10" suppressHydrationWarning>
          <div className="flex items-center justify-center mb-6">
            <span className="text-sm font-medium text-muted-foreground">Categories:</span>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm ${
                selectedCategory === undefined
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/50 border border-border text-muted-foreground hover:bg-primary/10 hover:text-foreground hover:border-primary/30"
              }`}
            >
              All Categories
            </button>
            {Object.entries(categoryConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(selectedCategory === key ? undefined : key)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm flex items-center gap-2 ${
                    selectedCategory === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-card/50 border border-border text-muted-foreground hover:bg-primary/10 hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Posts */}
        {!searchTerm && featuredPosts && featuredPosts.length > 0 && (
          <div className="max-w-7xl mx-auto mb-12" suppressHydrationWarning>
            <h2 className="text-3xl font-bold text-foreground mb-8">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => {
                const categoryInfo = categoryConfig[post.category as keyof typeof categoryConfig];
                const Icon = categoryInfo?.icon || BookOpen;
                
                return (
                  <Link key={post._id} href={`/blog/${post.slug}`}>
                    <div className="group cursor-pointer bg-card/50 border border-border rounded-lg overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg h-full flex flex-col">
                      {post.featuredImage && (
                        <div className="relative overflow-hidden h-56 flex-shrink-0">
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            width={400}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-md font-medium">Featured</span>
                          </div>
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <Icon className={`h-5 w-5 ${categoryInfo?.color || 'text-muted-foreground'}`} />
                          <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-md">{categoryInfo?.label || post.category}</span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-3 line-clamp-2 flex-shrink-0">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-base line-clamp-3 mb-6 flex-1 leading-relaxed">
                          {truncateText(post.excerpt, 120)}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {post.readTime}m
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {post.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {post.likes}
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {post.authorName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent/Search Results */}
        <div className="max-w-7xl mx-auto mb-12" suppressHydrationWarning>
          <h2 className="text-3xl font-bold text-foreground mb-8">
            {searchTerm ? `Search Results` : "Recent Articles"}
          </h2>
          {searchTerm && (
            <p className="text-muted-foreground mb-8 text-lg">
              {displayPosts?.length || 0} results for "{searchTerm}"
            </p>
          )}
          
          {displayPosts && displayPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayPosts.map((post) => {
                const categoryInfo = categoryConfig[post.category as keyof typeof categoryConfig];
                const Icon = categoryInfo?.icon || BookOpen;
                
                return (
                  <Link key={post._id} href={`/blog/${post.slug}`}>
                    <div className="group cursor-pointer bg-card/50 border border-border rounded-lg overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg h-full flex flex-col">
                      {post.featuredImage && (
                        <div className="relative overflow-hidden h-56 flex-shrink-0">
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            width={400}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <Icon className={`h-5 w-5 ${categoryInfo?.color || 'text-muted-foreground'}`} />
                          <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-md">{categoryInfo?.label || post.category}</span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-3 line-clamp-2 flex-shrink-0">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground text-base line-clamp-3 mb-6 flex-1 leading-relaxed">
                          {truncateText(post.excerpt, 120)}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {post.readTime}m
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {post.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {post.likes}
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {post.authorName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4">No Articles Found</h3>
              <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                {searchTerm ? "Try adjusting your search terms or browse our categories" : "Check back soon for new content"}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm font-medium shadow-sm"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && displayPosts && displayPosts.length > 0 && (
            <div className="text-center mt-12">
              <button
                onClick={loadMore}
                className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200 text-lg font-medium shadow-sm hover:shadow-md hover:scale-105"
              >
                Load More Articles
              </button>
              <p className="text-muted-foreground mt-4 text-sm">
                Showing {displayPosts.length} of {basePosts?.length || 0} articles
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BlogPage;
