"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, CheckCircle } from "lucide-react";

interface NewsletterSignupProps {
  source?: string;
  variant?: "default" | "compact" | "footer";
  className?: string;
}

const NewsletterSignup = ({ 
  source = "blog", 
  variant = "default",
  className = "" 
}: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const subscribeToNewsletter = useMutation(api.newsletter.subscribeToNewsletter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await subscribeToNewsletter({
        email: email.trim(),
        name: name.trim() || undefined,
        source,
      });

      if (result.success) {
        setIsSuccess(true);
        setMessage(result.message);
        setEmail("");
        setName("");
        
        // Reset success state after 5 seconds
        setTimeout(() => {
          setIsSuccess(false);
          setMessage("");
        }, 5000);
      } else {
        setMessage(result.message);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setMessage("Failed to subscribe. Please try again.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === "compact") {
    return (
      <div className={`bg-gray-900/50 border border-gray-700 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-4 w-4 text-red-500" />
          <h3 className="font-semibold text-white">Stay Updated</h3>
        </div>
        
        {isSuccess ? (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="bg-gray-800 border-gray-600 text-white text-sm"
              required
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              disabled={!email.trim() || isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm h-8"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
            {message && !isSuccess && (
              <p className="text-xs text-red-400">{message}</p>
            )}
          </form>
        )}
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={`text-center ${className}`}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-red-500" />
          <h3 className="text-xl font-semibold text-white">Stay Updated</h3>
        </div>
        <p className="text-gray-400 mb-6 max-w-sm mx-auto">
          Get fitness tips, nutrition guides, and exclusive content delivered to your inbox.
        </p>
        
        {isSuccess ? (
          <div className="flex items-center justify-center gap-2 text-green-400 py-4">
            <CheckCircle className="h-5 w-5" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-3 max-w-sm mx-auto">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-gray-900/50 border-gray-700 text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
                required
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                disabled={!email.trim() || isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "..." : "Subscribe"}
              </Button>
            </div>
            {message && !isSuccess && (
              <p className="text-sm text-red-400">{message}</p>
            )}
          </form>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <Card className={`bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-500/30 ${className}`}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Mail className="h-6 w-6 text-red-500" />
          <CardTitle className="text-2xl text-white">Stay Updated</CardTitle>
        </div>
        <CardDescription className="text-gray-300">
          Get the latest fitness tips, nutrition guides, and success stories delivered to your inbox.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
              <CheckCircle className="h-6 w-6" />
              <span className="text-lg font-semibold">{message}</span>
            </div>
            <p className="text-gray-300 text-sm">
              Check your email for confirmation and get ready for amazing content!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="bg-black/50 border-gray-600 text-white placeholder-gray-400"
                disabled={isSubmitting}
              />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="bg-black/50 border-gray-600 text-white placeholder-gray-400"
                required
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              disabled={!email.trim() || isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Subscribing..." : "Subscribe Now"}
            </Button>
            {message && !isSuccess && (
              <p className="text-sm text-red-400 text-center">{message}</p>
            )}
            <p className="text-xs text-gray-400 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsletterSignup;
