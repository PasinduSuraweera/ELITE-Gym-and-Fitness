"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Contact <span className="text-primary">ELITE Gym & Fitness</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Get in touch with Sri Lanka's most advanced fitness platform. We're here 24/7 to help you get jacked with AI!
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="p-8 bg-card/50">
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            
            {submitted ? (
              <div className="text-center py-8">
                <h3 className="text-2xl font-semibold mb-4 text-green-500">Message Sent!</h3>
                <p className="text-muted-foreground mb-6">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <Button 
                  onClick={() => setSubmitted(false)} 
                  className="mt-4"
                  variant="outline"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject
                  </label>
                  <Input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="What's this about?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Visit our locations in Kandy or connect digitally. Our trainers are available 6AM-10PM daily, 
                with 24/7 online platform access and AI chatbot support.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="p-6 hover:shadow-lg transition-shadow bg-card/50">
                <div>
                  <h3 className="font-semibold text-primary mb-2">ELITE Gym & Fitness - Kandy</h3>
                  <p className="text-muted-foreground">+94 11 234 5678</p>
                  <p className="text-sm text-muted-foreground">10 Riverview Rd, Tennekumbura</p>
                  <p className="text-xs text-muted-foreground mt-2">Main location with full facilities</p>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow bg-card/50">
                <div>
                  <h3 className="font-semibold text-primary mb-2">ELITE Gym & Fitness - Kandy VIP</h3>
                  <p className="text-muted-foreground">+94 81 234 5678</p>
                  <p className="text-sm text-muted-foreground">82 A26, Kundasale 20168</p>
                  <p className="text-xs text-muted-foreground mt-2">Premium location with VIP services</p>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow bg-card/50">
                <div>
                  <h3 className="font-semibold text-primary mb-2">Email Support</h3>
                  <p className="text-muted-foreground">support@elitegym.com</p>
                  <p className="text-sm text-muted-foreground">Response within 24 hours during business hours</p>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow bg-card/50">
                <div>
                  <h3 className="font-semibold text-primary mb-2">AI Chatbot Support</h3>
                  <p className="text-muted-foreground">Available 24/7 on platform</p>
                  <p className="text-sm text-muted-foreground">Instant assistance and voice AI consultations</p>
                </div>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="p-6 bg-card/50">
              <h3 className="font-semibold mb-4">Quick Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm">What are your operating hours?</h4>
                  <p className="text-sm text-muted-foreground">Trainers: 6AM-10PM daily (weekends included). Platform: 24/7 access. Premium members get 24/7 gym access.</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Do trainer sessions cost extra?</h4>
                  <p className="text-sm text-muted-foreground">No! ALL trainer sessions are included with any membership (Basic Rs. 2,500, Premium Rs. 3,000, Couple Rs. 4,500).</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Can I try the AI program generator?</h4>
                  <p className="text-sm text-muted-foreground">Yes! Voice AI consultations are available 24/7. We've generated 300+ personalized programs with 4.8+ star ratings.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
