"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { MessageCircle, X, Send, Dumbbell } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const ChadBot = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting based on user status
      const greeting = user 
        ? `Yo ${user.firstName || "champ"}! 💪 Welcome back to Elite Gym! Ready to crush some goals today? What can your boy ChadBot help you with?`
        : "Yo! 🔥 Welcome to Elite Gym & Fitness! I'm ChadBot, your fitness bro who knows EVERYTHING about this place. Ready to get JACKED? What's good?";
      
      setTimeout(() => {
        addBotMessage(greeting);
      }, 500);
    }
  }, [isOpen, user]);

  const addBotMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      isBot: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getResponse = (userInput: string): string => {
    const input = userInput.toLowerCase().trim();

    // Bad words filter (simple example, expand as needed)
    const badWords = [
      "fuck", "shit", "bitch", "asshole", "bastard", "dick", "crap", "piss", "damn", "cunt", "fag", "slut", "whore"
    ];
    for (const word of badWords) {
      if (input.includes(word)) {
        return "Whoa, bro! 🚫 Let's keep it ELITE and positive in here. No bad vibes or language—ChadBot's all about respect and GAINS! 💪";
      }
    }

    

    // Memberships & Pricing (Most specific first)
    if (input.includes("membership") || input.includes("price") || input.includes("cost") || input.includes("rupee") || input.includes("rs.") || input.includes("rs ") || input === "rs" || input.includes("fee") || input.includes("subscription") || input.includes("monthly") || input.includes("payment") || input.includes("how much")) {
      return "Bro, our memberships are ABSOLUTELY FIRE! 🔥💰 Check these ELITE packages:\n\n🏃‍♂️ **BEGINNER** - Rs. 2,500/month\n✅ Perfect for fitness newbies\n✅ Basic gym access & guided workouts\n✅ Off-peak hours access\n\n💪 **BASIC** - Rs. 2,500/month\n✅ Full gym equipment access\n✅ All operating hours\n✅ Standard facilities\n\n💑 **COUPLE** - Rs. 4,500/month\n✅ Train together, stay together!\n✅ Couple workout programs\n✅ Premium facilities for 2\n\n👑 **PREMIUM** - Rs. 3,000/month (MOST POPULAR!)\n✅ Ultimate fitness experience\n✅ Personal training sessions\n✅ Spa & sauna access\n✅ 24/7 gym access\n\nAll include AI workout generation, trainer bookings & ELITE community access! Which one's calling your name?";
    }

    // Greetings & Welcome
    if (input.includes("hello") || input.includes("hi") || input.includes("hey") || input.includes("sup") || input.includes("what's up") || input.includes("yo")) {
      return user 
        ? `Yooo ${user.firstName || "beast"}! 🔥 Always pumped to see you here! What's the move today - gonna book a session with one of our ELITE trainers or generate a sick AI workout plan?`
        : "Yooo what's good! 💪 Welcome to the ELITE family! Ready to transform your life? I can hook you up with everything you need to know!";
    }

    // Trainers & Booking
    if (input.includes("trainer") || input.includes("coach") || input.includes("book") || input.includes("session") || input.includes("training") || input.includes("instructor") || input.includes("appointment") || input.includes("schedule") || input.includes("personal") || input.includes("pt")) {
      return "YO! Our trainers are absolute LEGENDS! 💪🔥 We got 30+ certified BEASTS who'll help you DOMINATE:\n\n🥊 **Personal Training** - One-on-one GAINS\n💃 **Zumba** - Dance your way to fitness (we make it COOL)\n🧘‍♀️ **Yoga** - Flexibility meets strength\n🏋️‍♂️ **CrossFit** - For the hardcore warriors\n❤️ **Cardio Training** - Heart-pumping workouts\n💪 **Strength Training** - Build that muscle!\n🥗 **Nutrition Consultation** - Fuel your gains\n👥 **Group Classes** - Community vibes\n\nBest part? ALL SESSIONS ARE INCLUDED with your membership - NO EXTRA COST! 🎉 Our trainers average 4.8+ stars because they're PHENOMENAL! Ready to book your first session and start your transformation?";
    }

    // AI Features & Programs (More specific matching)
    if ((input.includes("ai") || input.includes("artificial") || input.includes("smart") || input.includes("algorithm")) || 
        (input.includes("generate") && (input.includes("workout") || input.includes("program"))) ||
        (input.includes("custom") && (input.includes("workout") || input.includes("program"))) ||
        input.includes("personalized workout") || input.includes("workout plan") || input.includes("program generate")) {
      return "Dude, our AI is NEXT LEVEL INSANE! 🤖💪🚀 We've already generated 300+ personalized plans and counting! Our AI is like having a genius trainer + nutritionist combo:\n\n🔥 **Custom Workout Routines**\n✅ Tailored to YOUR specific goals\n✅ Adapts as you get STRONGER\n✅ Progressive overload built-in\n\n🥗 **Personalized Diet Plans & Recipes**\n✅ Delicious meals that fuel gains\n✅ Macro calculations done for you\n✅ Meal prep made EASY\n✅ Custom recipes for your goals and taste\n\n🎯 **Goal-Specific Programs**\n✅ Weight loss, muscle gain, strength\n✅ Sport-specific training\n✅ Injury recovery protocols\n\nIt's like having a personal trainer in your pocket that NEVER sleeps! Ready to get your custom AI-generated plan?";
    }

    // Recipes & Nutrition
    if (input.includes("recipe") || input.includes("food") || input.includes("meal") || input.includes("nutrition") || input.includes("eat") || input.includes("cooking") || input.includes("healthy") || input.includes("protein") || input.includes("calories") || input.includes("diet") || input.includes("breakfast") || input.includes("lunch") || input.includes("dinner") || input.includes("snack")) {
      return "BRO! Our recipe collection is ABSOLUTELY STACKED! 🍳💪🔥 We got the FIRE nutrition game:\n\n🌅 **Breakfast GAINS**\n✅ High-protein morning fuel\n✅ Pre-workout energy bombs\n\n🥙 **Lunch POWER**\n✅ Balanced macro meals\n✅ Quick prep options\n\n🍖 **Dinner RECOVERY**\n✅ Muscle-building proteins\n✅ Post-workout repair meals\n\n🥜 **Snacks that SLAP**\n✅ Healthy between-meal options\n✅ Craving-crushing treats\n\n⚡ **Pre-Workout FUEL**\n✅ Energy without the crash\n✅ Performance optimizers\n\n🔋 **Post-Workout RECOVERY**\n✅ Muscle repair nutrition\n✅ Glycogen replenishment\n\nEvery recipe comes with FULL nutrition breakdown - calories, protein, carbs, fats, the WORKS! Plus difficulty levels from beginner to chef status. Want some killer meal ideas for your goals?";
    }

    // Marketplace & Products
    if (input.includes("supplement") || input.includes("equipment") || input.includes("gear") || input.includes("buy") || input.includes("shop") || input.includes("store") || input.includes("product") || input.includes("creatine") || input.includes("weights") || input.includes("apparel") || input.includes("clothes") || input.includes("accessories")) {
      return "YO! Our marketplace is ABSOLUTELY LOADED! 🛒💪🔥 We only stock the PREMIUM stuff that we actually use:\n\n💊 **Supplements that WORK**\n✅ Protein powders (all flavors)\n✅ Creatine for explosive power\n✅ Pre-workouts that HIT DIFFERENT\n✅ Post-workout recovery blends\n✅ Vitamins & minerals\n\n🏋️‍♂️ **Equipment for HOME GAINS**\n✅ Dumbbells & barbells\n✅ Resistance bands\n✅ Yoga mats & accessories\n✅ Cardio equipment\n\n👕 **ELITE Apparel to FLEX**\n✅ Moisture-wicking workout gear\n✅ Compression wear\n✅ Elite Gym branded merch\n✅ Athleisure for everyday\n\n🎒 **Accessories for the GRIND**\n✅ Gym bags & backpacks\n✅ Water bottles & shakers\n✅ Lifting gloves & straps\n✅ Fitness trackers\n\n🥤 **Nutrition Products**\n✅ Meal replacement shakes\n✅ Healthy snacks\n✅ Electrolyte drinks\n\nEvery product is QUALITY TESTED by our team! Need recommendations for your specific goals?";
    }

    // Getting Started & Help
    if (input.includes("start") || input.includes("begin") || input.includes("new") || input.includes("help") || input.includes("how") || input.includes("guide") || input.includes("first") || input.includes("confused") || input.includes("lost") || input.includes("where")) {
      if (user) {
        return "Let's GET IT, CHAMPION! 🔥💪 Here's your ELITE roadmap to DOMINATION:\n\n1️⃣ **Generate Your AI Plan** (2 minutes!)\n✅ Custom workout routine\n✅ Personalized nutrition plan\n✅ Goal-specific programming\n\n2️⃣ **Book Your First Trainer Session**\n✅ Choose from 30+ certified trainers\n✅ Pick your specialty (strength, cardio, etc.)\n✅ FREE with your membership!\n\n3️⃣ **Explore Our Recipe Database**\n✅ Meal prep like a PRO\n✅ Nutrition info for everything\n✅ From beginner to chef level\n\n4️⃣ **Join the Community**\n✅ 1000+ members crushing goals\n✅ Share progress & get motivated\n✅ Support system that NEVER quits\n\nWhat sounds most EXCITING to you right now? I'm here to guide you every step!";
      } else {
        return "Welcome to the ELITE lifestyle, future LEGEND! 💪🚀 Here's your game plan to join the ELITE:\n\n1️⃣ **Choose Your Membership**\n✅ Beginner: Rs. 2,500/month\n✅ Basic: Rs. 2,500/month\n✅ Couple: Rs. 4,500/month\n✅ Premium: Rs. 3,000/month (MOST POPULAR!)\n\n2️⃣ **Get Your AI-Generated Plans**\n✅ Instant workout routines\n✅ Personalized nutrition\n✅ Goal-crushing programs\n\n3️⃣ **Book Your First Trainer**\n✅ 30+ certified professionals\n✅ All sessions INCLUDED\n✅ Choose your specialty\n\n4️⃣ **Start DOMINATING**\n✅ Join 1000+ success stories\n✅ Transform your life\n✅ Become the BEST version of yourself\n\nReady to join the ELITE family and start your transformation journey?";
      }
    }

    // Community & Members
    if (input.includes("community") || input.includes("member") || input.includes("people") || input.includes("friends") || input.includes("social") || input.includes("support") || input.includes("motivation") || input.includes("group") || input.includes("family") || input.includes("together")) {
      return "Our ELITE community is ABSOLUTELY MASSIVE and INCREDIBLE! 🔥👥💪\n\n🌟 **1000+ ACTIVE MEMBERS**\n✅ All crushing their goals DAILY\n✅ Supportive & motivating environment\n✅ Success stories everywhere\n\n💬 **COMMUNITY FEATURES**\n✅ Progress sharing & celebrations\n✅ Workout buddy matching\n✅ Group challenges & competitions\n✅ Expert tips from trainers\n\n🤝 **SUPPORT SYSTEM**\n✅ 24/7 motivation from members\n✅ Accountability partners\n✅ Beginner-friendly guidance\n✅ Advanced training discussions\n\n🏆 **ACHIEVEMENTS & MILESTONES**\n✅ Celebrate every victory\n✅ Monthly transformation highlights\n✅ Community awards & recognition\n\nIt's not just a gym - it's a LIFESTYLE and FAMILY! We lift each other up (literally and figuratively)! Ready to be part of something BIGGER than yourself?";
    }

    // Contact & Support
    if (input.includes("contact") || input.includes("support") || input.includes("problem") || input.includes("issue") || input.includes("customer") || input.includes("service") || input.includes("staff") || input.includes("admin") || input.includes("manager")) {
      return "Got questions or need ELITE support? I'm here 24/7, bro! 💬💪 But if you need human backup:\n\n🔥 **I'M YOUR FIRST STOP**\n✅ Ask me ANYTHING about Elite Gym\n✅ Memberships, trainers, programs\n✅ Instant answers, zero wait time\n\n👥 **HUMAN SUPPORT TEAM**\n✅ Hit up our Contact page\n✅ Response time faster than your PR deadlift! 🏋️‍♂️\n✅ Professional & knowledgeable staff\n\n⚡ **QUICK SOLUTIONS**\n✅ Account issues? We got you\n✅ Booking problems? Solved!\n✅ Payment questions? Easy!\n\nOur team responds LIGHTNING FAST because we care about your fitness journey! What specific help do you need right now?";
    }

    // Hours & Availability
    if (input.includes("hour") || input.includes("time") || input.includes("open") || input.includes("close") || input.includes("available") || input.includes("when") || input.includes("access")) {
      return "We're ALWAYS here for you, CHAMPION! 🌍💪⏰\n\n🔥 **ONLINE PLATFORM: 24/7**\n✅ Book trainers ANYTIME\n✅ Generate AI plans INSTANTLY\n✅ Browse recipes at 3AM\n✅ Shop marketplace 24/7\n\n⭐ **PREMIUM MEMBERS: 24/7 GYM ACCESS**\n✅ Swipe card entry anytime\n✅ Night owl? We got you!\n✅ Early bird? Come through!\n\n🏋️‍♂️ **TRAINER AVAILABILITY**\n✅ 6AM - 10PM daily\n✅ Weekends included\n✅ Book sessions in advance\n✅ Flexible scheduling\n\n💻 **CHATBOT (ME!): ALWAYS ON**\n✅ Questions at midnight? Ask away!\n✅ Motivation at 5AM? I'm here!\n✅ Support whenever you need\n\nThe grind NEVER stops, and neither do we! When do you want to start your ELITE journey?";
    }

    // Reviews & Testimonials
    if (input.includes("review") || input.includes("testimonial") || input.includes("feedback") || input.includes("rating") || input.includes("star") || input.includes("opinion") || input.includes("experience") || input.includes("success") || input.includes("result")) {
      return "Bro, our members are ABSOLUTELY LOVING their ELITE experience! 🌟💪🔥\n\n⭐ **TRAINER RATINGS**\n✅ Average 4.8+ stars across ALL trainers\n✅ Real feedback from real transformations\n✅ Certified professionals who DELIVER\n\n🏆 **SUCCESS STORIES**\n✅ 300+ AI-generated plans creating results\n✅ Members hitting goals FASTER than expected\n✅ Life-changing transformations daily\n\n💬 **MEMBER TESTIMONIALS**\n✅ \"Best investment I ever made!\"\n✅ \"Trainers are absolute legends!\"\n✅ \"AI workouts are game-changing!\"\n✅ \"Community support is UNREAL!\"\n\n📊 **PROVEN RESULTS**\n✅ 1000+ satisfied members\n✅ Consistent 5-star experiences\n✅ Zero regrets, only GAINS\n\nCheck out our trainer profiles for detailed reviews! Every rating tells a story of TRANSFORMATION. Want to add your success story to the collection?";
    }

    // Default responses for unmatched queries
    const defaultResponses = [
      "Yo! I'm here to help you get ABSOLUTELY JACKED! 💪🔥 Ask me about our memberships (starting Rs. 2,500), ELITE trainers, AI workout generation, fire recipes, or our 1000+ member community!",
      "What's good, future LEGEND! 🚀 Want to know about our INSANE trainers, sick AI programs, STACKED marketplace, or FIRE memberships? I got ALL the intel!",
      "BRO! I know EVERYTHING about Elite Gym! Ask me about booking our 30+ trainers, generating AI plans, joining our MASSIVE community, or our facilities! Let's GET IT! 💪",
      "YO! Ready to level up your FITNESS GAME? 🔥 I can tell you about our membership plans (Rs. 2,500-4,500), trainer sessions, AI workout generator, recipes, or ANYTHING Elite Gym related!",
      "CHAMPION! I'm your fitness BRO with ALL the answers! 💪 Memberships, trainers, AI programs, nutrition, equipment, community - what do you want to DOMINATE today?"
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    setInputValue("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = getResponse(inputValue);
      addBotMessage(response);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {/* Pulsing attention ring */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-500/30 rounded-full animate-ping"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full animate-pulse"></div>
        
        <Button
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-full w-16 h-16 shadow-2xl transition-all duration-300 hover:scale-110 group border-2 border-white/20"
        >
          <MessageCircle className="h-6 w-6" />
          
          {/* Notification badge */}
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
            !
          </div>
        </Button>
        
        {/* Enhanced tooltip */}
        <div className="absolute bottom-full right-0 mb-4 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-3 rounded-xl text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl border border-white/20 group-hover:scale-105">
          <div className="font-bold">💪 Chat with ChadBot!</div>
          <div className="text-xs text-white/80">Your fitness bro is here to help</div>
          
          {/* Tooltip arrow */}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-orange-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">ChadBot</h3>
            <p className="text-white/80 text-sm">Your fitness bro 💪</p>
          </div>
        </div>
        <Button
          onClick={() => setIsOpen(false)}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[340px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.isBot
                  ? 'bg-gray-800 text-white'
                  : 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-white p-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask ChadBot anything..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChadBot;