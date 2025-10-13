"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I create an account?",
          answer: "Click on 'Sign Up' in the top right corner and follow the registration process. You can sign up using your email or Google account."
        },
        {
          question: "What membership plans are available?",
          answer: "We offer Basic (Rs. 2,500/month), Premium (Rs. 3,000/month), and Couple (Rs. 4,500/month) plans. ALL plans include unlimited trainer sessions at no extra cost. Premium adds 24/7 gym access and priority booking."
        },
        {
          question: "How do I download my membership card?",
          answer: "Go to your Profile page and if you have an active membership, you'll see a 'Download Membership Card' button that generates a digital card with your details."
        }
      ]
    },
    {
      category: "AI Program Generator",
      questions: [
        {
          question: "How does the AI program generator work?",
          answer: "Simply speak your fitness goals to our voice-activated AI coach available 24/7. It instantly creates personalized workout and nutrition plans. We've generated 300+ successful programs with real-time consultations."
        },
        {
          question: "Can I modify my generated program?",
          answer: "Yes! Once generated, you can view and download your program from your profile. For modifications, you can generate a new program or consult with a trainer."
        },
        {
          question: "How accurate are the AI recommendations?",
          answer: "Our AI is trained on extensive fitness data and best practices. However, for complex health conditions, we recommend consulting with our certified trainers."
        }
      ]
    },
    {
      category: "Trainer Booking",
      questions: [
        {
          question: "How do I book a session with a trainer?",
          answer: "You MUST have an active membership first (Basic, Premium, or Couple). Then visit Trainer Booking, select from certified professionals available 6AM-10PM daily. ALL sessions are included - no additional fees!"
        },
        {
          question: "Do trainer sessions cost extra?",
          answer: "No! ALL trainer sessions are included with any membership plan. Premium members get priority booking over Basic members. No hourly fees ever - everything is covered by your monthly membership."
        },
        {
          question: "What types of training sessions are available?",
          answer: "Personal Training, Zumba, Yoga, CrossFit, Cardio Training, Strength Training, Nutrition Consultation, and Group Classes. All led by certified professionals with 4.8+ star ratings."
        }
      ]
    },
    {
      category: "Marketplace",
      questions: [
        {
          question: "What products are available in the marketplace?",
          answer: "Supplements (protein, BCAA, creatine), Equipment (dumbbells, resistance bands, yoga mats), Apparel (performance wear, shoes), Accessories (smart bottles, gym bags), and Nutrition (protein bars, vitamins). All priced in LKR with member discounts."
        },
        {
          question: "What are the shipping costs?",
          answer: "Free shipping on orders over Rs. 10,000. Standard shipping is Rs. 500 for orders under Rs. 10,000. 18% VAT added to all purchases. Delivery tracking provided for all orders."
        },
        {
          question: "Do members get discounts on marketplace items?",
          answer: "Yes! Members receive exclusive discounts on all marketplace products. Payments processed securely in Sri Lankan Rupees (LKR) with order tracking and delivery updates."
        }
      ]
    },
    {
      category: "Account & Billing",
      questions: [
        {
          question: "How much do memberships cost?",
          answer: "Basic: Rs. 2,500/month (gym access, trainers included). Premium: Rs. 3,000/month (adds 24/7 access, AI programs, priority booking). Couple: Rs. 4,500/month (Premium features for 2 people). All payments via secure Stripe in LKR."
        },
        {
          question: "Are there any hidden fees?",
          answer: "No hidden fees! ALL trainer sessions are included with any membership. No hourly charges, no booking fees. Monthly membership covers everything - gym access, trainers, AI programs, community features."
        },
        {
          question: "How do I cancel my subscription?",
          answer: "You can cancel anytime from your profile settings. Monthly auto-renewal can be stopped with cancellation option available. Your access continues until the end of your current billing period."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "The website is running slowly. What should I do?",
          answer: "Try clearing your browser cache, disabling browser extensions, or switching to a different browser. Contact support if the issue persists."
        },
        {
          question: "I'm having trouble with payments. What should I do?",
          answer: "Ensure your payment information is correct and your card has sufficient funds. Contact your bank if needed, or try an alternative payment method."
        },
        {
          question: "The AI voice consultation isn't working.",
          answer: "Check microphone permissions and internet connection. Our voice AI is available 24/7 and has generated 300+ successful programs. Try refreshing the page. Contact support if issues persist - our AI chatbot is always available for assistance."
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              ELITE Gym <span className="text-primary">Help Center</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Get support for Sri Lanka's most advanced fitness platform. 1000+ members, 4.8+ star rating, 24/7 AI assistance.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-lg py-3 px-6"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Quick Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="p-8 text-center hover:shadow-lg transition-shadow cursor-pointer bg-card/50">
            <h3 className="font-semibold mb-3 text-primary">AI Programs</h3>
            <p className="text-sm text-muted-foreground">Learn about our AI-powered fitness programs</p>
          </Card>
          
          <Card className="p-8 text-center hover:shadow-lg transition-shadow cursor-pointer bg-card/50">
            <h3 className="font-semibold mb-3 text-primary">Trainer Booking</h3>
            <p className="text-sm text-muted-foreground">How to book and manage trainer sessions</p>
          </Card>
          
          <Card className="p-8 text-center hover:shadow-lg transition-shadow cursor-pointer bg-card/50">
            <h3 className="font-semibold mb-3 text-primary">Marketplace</h3>
            <p className="text-sm text-muted-foreground">Shopping, orders, and returns</p>
          </Card>
          
          <Card className="p-8 text-center hover:shadow-lg transition-shadow cursor-pointer bg-card/50">
            <h3 className="font-semibold mb-3 text-primary">Billing</h3>
            <p className="text-sm text-muted-foreground">Payments, subscriptions, and refunds</p>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          {filteredFaqs.length === 0 ? (
            <Card className="p-8 text-center bg-card/50">
              <p className="text-muted-foreground">No results found for "{searchQuery}". Try different keywords or browse categories below.</p>
            </Card>
          ) : (
            <div className="space-y-8">
              {filteredFaqs.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="text-xl font-semibold mb-4 text-primary">{category.category}</h3>
                  <div className="space-y-3">
                    {category.questions.map((faq, faqIndex) => {
                      const globalIndex = categoryIndex * 100 + faqIndex;
                      return (
                        <Card key={faqIndex} className="overflow-hidden bg-card/50">
                          <button
                            onClick={() => toggleFaq(globalIndex)}
                            className="w-full p-6 text-left hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{faq.question}</h4>
                              <span className={`transform transition-transform ${
                                expandedFaq === globalIndex ? 'rotate-180' : ''
                              }`}>
                                ⌄
                              </span>
                            </div>
                          </button>
                          {expandedFaq === globalIndex && (
                            <div className="px-6 pb-6">
                              <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Support */}
        <Card className="max-w-4xl mx-auto mt-16 p-8 text-center bg-card/50">
          <h3 className="text-2xl font-semibold mb-4">Still Need Help?</h3>
          <p className="text-muted-foreground mb-6">
            Join 1000+ satisfied members! Our support team and AI chatbot are available 24/7. 
            Visit our Kandy locations or get instant assistance online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Contact Support
            </a>
            <a 
              href="mailto:support@elitegym.com" 
              className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Email Us
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HelpPage;
