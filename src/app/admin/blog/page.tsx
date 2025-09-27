"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser, useAuth } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/AdminLayout";
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  Heart,
  Calendar,
  User,
  Search,
  BarChart3,
  FileText
} from "lucide-react";
import Link from "next/link";

// Simple Badge component
const Badge = ({ children, className = "", variant = "default" }: { 
  children: React.ReactNode; 
  className?: string; 
  variant?: "default" | "outline" | "secondary" | "destructive"
}) => {
  const baseClasses = "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variantClasses = {
    default: "border-transparent bg-red-600/20 text-red-400",
    outline: "border-gray-600 text-gray-400 bg-transparent",
    secondary: "border-transparent bg-orange-600/20 text-orange-400",
    destructive: "border-transparent bg-red-900/20 text-red-300"
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

const AdminBlogPage = () => {
  const { isSignedIn } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get blog posts
  const allPosts = useQuery(api.blog.getBlogPosts, isSignedIn ? {} : "skip");
  
  // Get blog statistics
  const blogStats = useQuery(api.blog.getBlogStats, isSignedIn ? {} : "skip");

  // Delete post mutation
  const deletePost = useMutation(api.blog.deleteBlogPost);

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      await deletePost({ postId: postId as any });
      alert("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter posts
  const filteredPosts = allPosts?.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "workout-tips", label: "Workout Tips" },
    { value: "nutrition", label: "Nutrition" },
    { value: "success-stories", label: "Success Stories" },
    { value: "trainer-insights", label: "Trainer Insights" },
    { value: "equipment-guides", label: "Equipment Guides" },
    { value: "wellness", label: "Wellness" },
    { value: "news", label: "News" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
    { value: "archived", label: "Archived" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Blog Management</h1>
            <p className="text-gray-400">Manage blog posts, view analytics, and create content</p>
          </div>
          <Link href="/admin/blog/create">
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </Link>
        </div>

        {/* Statistics */}
        {blogStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Posts</CardTitle>
                <FileText className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{blogStats.totalPosts}</div>
                <p className="text-xs text-gray-500">
                  {blogStats.published} published, {blogStats.drafts} drafts
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{blogStats.totalViews.toLocaleString()}</div>
                <p className="text-xs text-gray-500">Across all posts</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Likes</CardTitle>
                <Heart className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{blogStats.totalLikes}</div>
                <p className="text-xs text-gray-500">User engagement</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Categories</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {Object.keys(blogStats.categories).length}
                </div>
                <p className="text-xs text-gray-500">Active categories</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Filter Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <Button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:border-red-500"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Table */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Blog Posts</CardTitle>
            <CardDescription className="text-gray-400">
              {filteredPosts?.length || 0} posts found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPosts && filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post._id}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white text-lg">{post.title}</h3>
                        <Badge 
                          variant={
                            post.status === "published" ? "default" :
                            post.status === "draft" ? "secondary" : "destructive"
                          }
                        >
                          {post.status}
                        </Badge>
                        {post.isFeatured && <Badge variant="outline">Featured</Badge>}
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {post.authorName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(post.publishedAt || post.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes} likes
                        </div>
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {post.status === "published" && (
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-500"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      
                      <Link href={`/admin/blog/edit/${post._id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:border-yellow-500 hover:text-yellow-500"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      
                      <Button
                        onClick={() => handleDeletePost(post._id)}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Posts Found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first blog post"
                  }
                </p>
                <Link href="/admin/blog/create">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Post
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminBlogPage;
