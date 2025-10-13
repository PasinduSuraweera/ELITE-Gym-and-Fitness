const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Terms of <span className="text-primary">Service</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Welcome to ELITE Gym & Fitness! Please read these terms for our Sri Lankan fitness platform 
              featuring AI consultations, included trainer sessions, and marketplace services.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: October 14, 2025
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          <div className="space-y-12">
            
            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">1. Acceptance of Terms</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Welcome to Elite Gym & Fitness. These Terms of Service ("Terms") govern your use of our website, 
                  mobile application, and services (collectively, the "Platform"). By accessing or using our Platform, 
                  you agree to be bound by these Terms and our Privacy Policy.
                </p>
                <p>
                  If you do not agree to these Terms, please do not use our Platform. We may modify these Terms at any 
                  time, and such modifications will be effective immediately upon posting.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">2. Description of Service</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>ELITE Gym & Fitness provides:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Voice-activated AI fitness consultations available 24/7</li>
                  <li>ALL trainer sessions included with membership (no hourly fees)</li>
                  <li>Two Kandy locations with certified professionals (6AM-10PM availability)</li>
                  <li>Integrated marketplace with LKR pricing and member discounts</li>
                  <li>24/7 platform access with Premium member gym access</li>
                  <li>Community features supporting 1000+ active members</li>
                </ul>
                <p>
                  Our services are designed to support your fitness journey but are not intended to replace professional 
                  medical advice or treatment.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">3. User Accounts and Registration</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>To access our services, you must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Be at least 13 years old (or have parental consent)</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Promptly update any changes to your account information</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
                <p>
                  You may not create multiple accounts, share your account with others, or use another person's account 
                  without permission.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">4. Subscription and Payment Terms</h2>
              <div className="space-y-4 text-muted-foreground">
                <h3 className="text-xl font-semibold text-foreground">Membership Plans</h3>
                <p>We offer membership tiers with ALL trainer sessions included:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Basic Plan: Rs. 2,500/month (gym access, trainers included, community features)</li>
                  <li>Premium Plan: Rs. 3,000/month (adds 24/7 access, AI programs, priority booking)</li>
                  <li>Couple Plan: Rs. 4,500/month (Premium features for 2 people - great value!)</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-foreground mt-6">Billing and Renewal</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subscriptions automatically renew unless cancelled</li>
                  <li>Payments are processed securely through Stripe</li>
                  <li>Prices may change with 30 days notice</li>
                  <li>No refunds for partial months, except as required by law</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-foreground mt-6">Cancellation</h3>
                <p>
                  You may cancel your subscription at any time through your account settings. Cancellation takes effect 
                  at the end of your current billing period, and you'll retain access to paid features until then.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">5. Acceptable Use Policy</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use our Platform for illegal activities or to violate others' rights</li>
                  <li>Share inappropriate, offensive, or harmful content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt our Platform's operation</li>
                  <li>Scrape, copy, or reverse engineer our Platform</li>
                  <li>Impersonate others or provide false information</li>
                  <li>Spam other users or send unsolicited communications</li>
                  <li>Upload malicious code or harmful software</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">6. Trainer Services</h2>
              <div className="space-y-4 text-muted-foreground">
                <h3 className="text-xl font-semibold text-foreground">Trainer Qualifications</h3>
                <p>
                  All trainers on our platform are independently verified and certified professionals. However, 
                  we do not guarantee specific results from training sessions.
                </p>
                
                <h3 className="text-xl font-semibold text-foreground mt-4">Membership Required for Trainer Access</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You MUST have an active membership to book any trainer sessions</li>
                  <li>ALL trainer sessions are included with membership - no additional hourly fees</li>
                  <li>Premium members get priority booking over Basic members</li>
                  <li>Sessions available 6AM-10PM daily (weekends included)</li>
                  <li>Trainers offer Personal Training, Zumba, Yoga, CrossFit, Cardio, Strength Training, and Nutrition Consultation</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-foreground mt-4">Professional Relationship</h3>
                <p>
                  The relationship between users and trainers is professional. Any inappropriate behavior should be 
                  reported immediately. We reserve the right to terminate access for policy violations.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">7. AI-Generated Content</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our voice-activated AI has successfully generated 300+ personalized fitness programs. However:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>AI consultations are available 24/7 but are for informational purposes only</li>
                  <li>Consult healthcare professionals before starting any fitness program</li>
                  <li>While we maintain 4.8+ star ratings, individual results may vary</li>
                  <li>You assume responsibility for following AI recommendations safely</li>
                  <li>Our certified trainers (included with membership) can provide additional guidance</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">8. Marketplace Terms</h2>
              <div className="space-y-4 text-muted-foreground">
                <h3 className="text-xl font-semibold text-foreground">Product Information</h3>
                <p>
                  We strive to provide accurate product descriptions, but we don't guarantee that all information 
                  is error-free. Product availability and pricing are subject to change.
                </p>
                
                <h3 className="text-xl font-semibold text-foreground mt-4">Orders and Shipping</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Orders are subject to acceptance and availability</li>
                  <li>Shipping costs and delivery times vary by location</li>
                  <li>Risk of loss transfers upon delivery</li>
                  <li>International shipping may be subject to customs fees</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-foreground mt-4">Returns and Refunds</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>30-day return policy for unused items in original packaging</li>
                  <li>Return shipping costs are the customer's responsibility</li>
                  <li>Personalized or perishable items may not be returnable</li>
                  <li>Refunds processed within 5-10 business days after return receipt</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">9. Intellectual Property</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  All content on our Platform, including text, graphics, logos, software, and AI algorithms, is owned 
                  by Elite Gym & Fitness or our licensors and protected by intellectual property laws.
                </p>
                <p>You may not:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Copy, reproduce, or distribute our content without permission</li>
                  <li>Create derivative works based on our Platform</li>
                  <li>Remove copyright or proprietary notices</li>
                  <li>Use our trademarks without authorization</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">10. Health and Safety Disclaimers</h2>
              <div className="space-y-4 text-muted-foreground">
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Important Health Notice</h3>
                  <p>
                    <strong>Consult your healthcare provider before starting any fitness program.</strong> Our services are 
                    not intended to diagnose, treat, cure, or prevent any disease. Exercise carries inherent risks, and 
                    you participate at your own risk.
                  </p>
                </div>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Stop exercising immediately if you feel pain or discomfort</li>
                  <li>Our trainers are fitness professionals, not medical doctors</li>
                  <li>AI recommendations are based on general fitness principles</li>
                  <li>Individual results may vary based on many factors</li>
                  <li>We're not liable for injuries resulting from Platform use</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">11. Limitation of Liability</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, ELITE GYM & FITNESS SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, 
                  DATA, USE, OR OTHER INTANGIBLE LOSSES.
                </p>
                <p>
                  Our total liability for any claims arising from these Terms or your use of the Platform shall not 
                  exceed the amount you paid us in the 12 months preceding the claim.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">12. Indemnification</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  You agree to indemnify and hold harmless Elite Gym & Fitness from any claims, damages, losses, or 
                  expenses arising from your use of the Platform, violation of these Terms, or infringement of any 
                  third-party rights.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">13. Termination</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may terminate or suspend your account immediately, without notice, for conduct that we believe 
                  violates these Terms or is harmful to other users, us, or third parties.
                </p>
                <p>
                  Upon termination, your right to use the Platform ceases immediately, but provisions regarding 
                  liability, indemnification, and dispute resolution survive termination.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">14. Governing Law and Disputes</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  These Terms are governed by the laws of Sri Lanka, without regard to conflict of law 
                  principles. Any disputes shall be resolved through binding arbitration in Kandy, Sri Lanka, except for 
                  claims that may be brought in small claims court.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">15. Contact Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  For questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-card p-6 rounded-lg border">
                  <p><strong>Email:</strong> legal@elitegym.com</p>
                  <p><strong>Kandy Location:</strong> 10 Riverview Rd, Tennekumbura</p>
                  <p><strong>Phone:</strong> +94 11 234 5678</p>
                  <p><strong>Kandy VIP Location:</strong> 82 A26, Kundasale 20168</p>
                  <p><strong>VIP Phone:</strong> +94 81 234 5678</p>
                </div>
                <p className="text-sm mt-4">
                  By using our Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
