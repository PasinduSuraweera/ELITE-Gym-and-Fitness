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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get featured posts
  const featuredPosts = useQuery(api.blog.getBlogPosts, {
    status: "published",
    featured: true,
    limit: 3,
  });

  // Get recent posts
  const recentPosts = useQuery(api.blog.getBlogPosts, {
    status: "published",
    category: selectedCategory,
    limit: 9,
  });

  // Search posts if there's a search term
  const searchResults = useQuery(
    api.blog.searchBlogPosts,
    searchTerm.trim() ? {
      searchTerm: searchTerm.trim(),
      category: selectedCategory,
      limit: 12,
    } : "skip"
  );

  // Get blog stats
  const blogStats = useQuery(api.blog.getBlogStats, {});

  const displayPosts = searchTerm.trim() ? searchResults : recentPosts;

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
      <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"></div>
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
          <div className="animate-pulse max-w-6xl mx-auto">
            <div className="h-16 bg-gray-800/50 rounded-2xl w-2/3 mx-auto mb-12"></div>
            <div className="h-12 bg-gray-800/30 rounded-xl w-1/3 mx-auto mb-16"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800/30 h-80 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black" suppressHydrationWarning>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20" suppressHydrationWarning></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_50%)]" suppressHydrationWarning></div>
      
      <div className="container mx-auto px-4 py-32 relative z-10 flex-1" suppressHydrationWarning>
        {/* Header */}
        <div className="flex justify-between items-center mb-12" suppressHydrationWarning>
          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="text-red-500">Fitness</span> Blog
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Expert insights, workout tips, and success stories to power your fitness journey
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between" suppressHydrationWarning>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === undefined
                  ? "bg-red-600 text-white"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
              }`}
            >
              All Categories
            </button>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(selectedCategory === key ? undefined : key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === key
                    ? "bg-red-600 text-white"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Posts */}
        {!searchTerm && featuredPosts && featuredPosts.length > 0 && (
          <div className="mb-12" suppressHydrationWarning>
            <h2 className="text-2xl font-bold text-white mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => {
                const categoryInfo = categoryConfig[post.category as keyof typeof categoryConfig];
                const Icon = categoryInfo?.icon || BookOpen;
                
                return (
                  <Link key={post._id} href={`/blog/${post.slug}`}>
                    <div className="group cursor-pointer bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden transition-colors hover:border-red-500/50 h-full flex flex-col">
                      {post.featuredImage && (
                        <div className="relative overflow-hidden h-48 flex-shrink-0">
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            width={400}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">Featured</span>
                          </div>
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={`h-4 w-4 ${categoryInfo?.color || 'text-gray-400'}`} />
                          <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">{categoryInfo?.label || post.category}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors mb-2 line-clamp-2 flex-shrink-0">
                          {post.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                          {truncateText(post.excerpt, 120)}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readTime}m
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post.likes}
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
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
        <div className="mb-12" suppressHydrationWarning>
          <h2 className="text-2xl font-bold text-white mb-6">
            {searchTerm ? `Search Results` : "Recent Articles"}
          </h2>
          {searchTerm && (
            <p className="text-gray-400 mb-6">
              {displayPosts?.length || 0} results for "{searchTerm}"
            </p>
          )}
          
          {displayPosts && displayPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayPosts.map((post) => {
                const categoryInfo = categoryConfig[post.category as keyof typeof categoryConfig];
                const Icon = categoryInfo?.icon || BookOpen;
                
                return (
                  <Link key={post._id} href={`/blog/${post.slug}`}>
                    <div className="group cursor-pointer bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden transition-colors hover:border-red-500/50 h-full flex flex-col">
                      {post.featuredImage && (
                        <div className="relative overflow-hidden h-48 flex-shrink-0">
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            width={400}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={`h-4 w-4 ${categoryInfo?.color || 'text-gray-400'}`} />
                          <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">{categoryInfo?.label || post.category}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors mb-2 line-clamp-2 flex-shrink-0">
                          {post.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                          {truncateText(post.excerpt, 120)}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readTime}m
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post.likes}
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
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
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Articles Found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm ? "Try adjusting your search terms or browse our categories" : "Check back soon for new content"}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BlogPage;
