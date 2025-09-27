"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/AdminLayout";
import { 
  Save,
  Eye,
  ArrowLeft,
  ImageIcon,
  FileText,
  Settings,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { RichTextPreview } from "@/components/ui/RichTextPreview";

// Simple Textarea component for non-rich text areas
const Textarea = ({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const baseClasses = "flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50";
  
  return (
    <textarea 
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
};

const EditBlogPostPage = () => {
  const router = useRouter();
  const { postId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    category: "workout-tips" as "workout-tips" | "nutrition" | "success-stories" | "trainer-insights" | "equipment-guides" | "wellness" | "news",
    tags: "",
    status: "draft" as "draft" | "published" | "archived",
    isFeatured: false,
    seoTitle: "",
    seoDescription: "",
  });

  // Get the blog post to edit
  const post = useQuery(api.blog.getBlogPostById, { 
    postId: postId as any 
  });

  const updatePost = useMutation(api.blog.updateBlogPost);

  // Load post data when it becomes available
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        featuredImage: post.featuredImage || "",
        category: post.category,
        tags: post.tags.join(", "),
        status: post.status,
        isFeatured: post.isFeatured,
        seoTitle: post.seoTitle || "",
        seoDescription: post.seoDescription || "",
      });
      setIsLoading(false);
    }
  }, [post]);

  const categories = [
    { value: "workout-tips", label: "Workout Tips" },
    { value: "nutrition", label: "Nutrition" },
    { value: "success-stories", label: "Success Stories" },
    { value: "trainer-insights", label: "Trainer Insights" },
    { value: "equipment-guides", label: "Equipment Guides" },
    { value: "wellness", label: "Wellness" },
    { value: "news", label: "News" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      alert("Please fill in all required fields (title, excerpt, and content)");
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await updatePost({
        postId: postId as any,
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        featuredImage: formData.featuredImage.trim() || undefined,
        category: formData.category,
        tags,
        status: formData.status,
        isFeatured: formData.isFeatured,
        seoTitle: formData.seoTitle.trim() || undefined,
        seoDescription: formData.seoDescription.trim() || undefined,
      });

      alert("Blog post updated successfully!");
      router.push("/admin/blog");
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update blog post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = () => {
    setFormData(prev => ({ ...prev, status: "draft" }));
    setTimeout(() => {
      document.getElementById("submit-form")?.click();
    }, 100);
  };

  const handlePublish = () => {
    setFormData(prev => ({ ...prev, status: "published" }));
    setTimeout(() => {
      document.getElementById("submit-form")?.click();
    }, 100);
  };

  const handleArchive = () => {
    setFormData(prev => ({ ...prev, status: "archived" }));
    setTimeout(() => {
      document.getElementById("submit-form")?.click();
    }, 100);
  };

  // Auto-generate SEO title and description if not provided
  useEffect(() => {
    if (formData.title && !formData.seoTitle) {
      setFormData(prev => ({ ...prev, seoTitle: formData.title }));
    }
    if (formData.excerpt && !formData.seoDescription) {
      setFormData(prev => ({ ...prev, seoDescription: formData.excerpt }));
    }
  }, [formData.title, formData.excerpt, formData.seoTitle, formData.seoDescription]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading blog post...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!post) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
              <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
              <Link href="/admin/blog">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Blog Management
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/blog">
              <Button variant="outline" className="border-border text-foreground hover:border-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Edit Blog Post</h1>
              <p className="text-muted-foreground">Update your article content and settings</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="border-border text-foreground hover:border-blue-500 hover:text-blue-500"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>
            <Button
              onClick={handleSaveAsDraft}
              variant="outline"
              className="border-border text-foreground hover:border-yellow-500 hover:text-yellow-500"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            
            {formData.status !== "archived" && (
              <Button
                onClick={handleArchive}
                variant="outline"
                className="border-border text-foreground hover:border-orange-500 hover:text-orange-500"
                disabled={isSubmitting}
              >
                Archive
              </Button>
            )}
            
            <Button
              onClick={handlePublish}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {formData.status === "published" ? "Update" : "Publish"}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Content */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Post Content
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                The main content of your blog post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter post title..."
                  className="bg-background border-border text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Excerpt *
                  <span className="text-muted-foreground font-normal ml-2">(Brief description for blog listing)</span>
                </label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Write a compelling excerpt that will appear on the blog listing page and in search results..."
                  className="bg-background border-border text-foreground min-h-[120px] resize-none"
                  required
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {formData.excerpt.length}/300 characters recommended
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Content *
                  <span className="text-muted-foreground font-normal ml-2">(Rich text editor with formatting)</span>
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Write your full article content here. Use the toolbar to format text, add headings, lists, links, and more..."
                  minHeight="400px"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Use the toolbar above to format your content with headings, bold text, lists, quotes, and links. 
                  The editor supports rich formatting that will display beautifully on your blog.
                </p>

                {/* Content Preview */}
                {showPreview && formData.content && (
                  <div className="mt-6 border-t border-border pt-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Content Preview:</h4>
                    <div className="bg-muted/50 border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
                      <RichTextPreview content={formData.content} />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Media & Categorization */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Media & Category
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Add images and categorize your post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Featured Image URL
                </label>
                <Input
                  type="url"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-background border border-border text-foreground rounded-md px-3 py-2"
                    required
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tags
                  </label>
                  <Input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="fitness, workout, nutrition (comma separated)"
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="rounded border-border bg-background text-primary focus:ring-primary"
                />
                <label htmlFor="featured" className="text-sm text-foreground">
                  Mark as featured post
                </label>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Settings className="h-5 w-5" />
                SEO Settings
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Optimize your post for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  SEO Title
                </label>
                <Input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder="SEO optimized title (will use post title if empty)"
                  className="bg-background border-border text-foreground"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.seoTitle.length}/60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Meta Description
                </label>
                <Textarea
                  value={formData.seoDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder="SEO meta description (will use excerpt if empty)"
                  className="bg-background border-border text-foreground min-h-[80px]"
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.seoDescription.length}/160 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Hidden submit button for programmatic submission */}
          <button type="submit" id="submit-form" className="hidden" disabled={isSubmitting}>
            Submit
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default EditBlogPostPage;
