const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              About <span className="text-primary">ELITE Gym & Fitness</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A modern fitness AI platform designed to help people "get jacked with AI" - combining traditional gym services with cutting-edge technology in Sri Lanka.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-6">
              To provide accessible, high-quality fitness solutions through expert trainers, AI-powered programs, 
              and a supportive community. Located in Sri Lanka, we serve over 1000+ active members with 
              industry-leading technology and certified professionals.
            </p>
            <p className="text-lg text-muted-foreground">
              We've generated 300+ AI-powered fitness programs and maintain a 4.8+ star rating across all our 
              services, helping members achieve life-changing transformations daily.
            </p>
          </div>
          <div className="bg-card/50 rounded-xl p-8 border">
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-primary">Voice-Activated AI Programs</h3>
                  <p className="text-sm text-muted-foreground">Real-time AI consultations creating personalized workout and diet plans instantly</p>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">All Trainer Sessions Included</h3>
                  <p className="text-sm text-muted-foreground">Unlimited access to certified trainers with any membership - no hourly fees</p>
                </div>
                <div>
                  <h3 className="font-semibold text-primary">Complete Fitness Ecosystem</h3>
                  <p className="text-sm text-muted-foreground">Gym access, marketplace, recipes, and community support all in one platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What Makes Us Different</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're not just another gym management system. We're a comprehensive fitness ecosystem 
              built for the future of health and wellness.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8 bg-card/50 rounded-xl border hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-primary">Voice AI Technology</h3>
              <p className="text-muted-foreground">
                Simply speak your fitness goals to our AI coach and get instant personalized workout and nutrition 
                plans. Available 24/7 with over 300+ successful programs generated.
              </p>
            </div>
            
            <div className="text-center p-8 bg-card/50 rounded-xl border hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-primary">Integrated Marketplace</h3>
              <p className="text-muted-foreground">
                Shop supplements, equipment, apparel, and nutrition products with member discounts. 
                Free shipping on orders over Rs. 10,000 with secure LKR payment processing.
              </p>
            </div>
            
            <div className="text-center p-8 bg-card/50 rounded-xl border hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-primary">Expert Trainers Included</h3>
              <p className="text-muted-foreground">
                Access certified trainers specializing in personal training, Zumba, yoga, CrossFit, and more. 
                All sessions included with membership - no additional hourly fees.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Plans Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Membership Plans & Pricing</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Affordable monthly memberships in Sri Lankan Rupees with ALL trainer sessions included - no hidden fees.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6 bg-card/50 rounded-xl border">
            <h3 className="text-2xl font-semibold mb-2 text-primary">Basic</h3>
            <div className="text-3xl font-bold mb-4">Rs. 2,500<span className="text-lg text-muted-foreground">/month</span></div>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6 text-left">
              <li>• Gym facilities access</li>
              <li>• Basic workout programs</li>
              <li>• ALL trainer sessions included</li>
              <li>• Community forum access</li>
              <li>• Standard customer support</li>
            </ul>
          </div>
          <div className="text-center p-6 bg-card/50 rounded-xl border ring-2 ring-primary">
            <h3 className="text-2xl font-semibold mb-2 text-primary">Premium</h3>
            <div className="text-3xl font-bold mb-4">Rs. 3,000<span className="text-lg text-muted-foreground">/month</span></div>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6 text-left">
              <li>• 24/7 gym access with swipe card</li>
              <li>• Advanced AI program generation</li>
              <li>• Priority trainer booking</li>
              <li>• ALL trainer sessions included</li>
              <li>• Detailed progress tracking</li>
              <li>• Nutrition consultation access</li>
            </ul>
          </div>
          <div className="text-center p-6 bg-card/50 rounded-xl border">
            <h3 className="text-2xl font-semibold mb-2 text-primary">Couple</h3>
            <div className="text-3xl font-bold mb-4">Rs. 4,500<span className="text-lg text-muted-foreground">/month</span></div>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6 text-left">
              <li>• All Premium features for 2 people</li>
              <li>• Partner workout programs</li>
              <li>• Shared progress tracking</li>
              <li>• ALL trainer sessions for both</li>
              <li>• Couple-specific training</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Jacked with AI?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join 1000+ satisfied members with our 4.8+ star rated services. Experience voice AI consultations, 
            unlimited trainer sessions, and life-changing transformations in Sri Lanka's most advanced fitness platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/membership" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started Today
            </a>
            <a 
              href="/contact" 
              className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
