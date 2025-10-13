const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Privacy <span className="text-primary">Policy</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your privacy matters to ELITE Gym & Fitness. This policy explains how we protect your data across our AI consultations, 
              trainer bookings, and marketplace transactions in Sri Lanka.
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
              <h2 className="text-3xl font-bold mb-6 text-foreground">1. Information We Collect</h2>
              <div className="space-y-4 text-muted-foreground">
                <h3 className="text-xl font-semibold text-foreground">Personal Information</h3>
                <p>
                  When you join ELITE Gym & Fitness, we collect information such as:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and email address for account creation</li>
                  <li>Profile picture (optional)</li>
                  <li>Phone number for trainer session coordination</li>
                  <li>Payment information (processed securely through Stripe in LKR)</li>
                  <li>Fitness goals, health conditions, and preferences for voice AI consultations</li>
                  <li>Membership tier selection (Basic Rs. 2,500, Premium Rs. 3,000, Couple Rs. 4,500)</li>
                </ul>
                
                <h3 className="text-xl font-semibold text-foreground mt-6">Usage Information</h3>
                <p>We automatically collect information about how you use our services, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Pages visited and features used</li>
                  <li>AI consultation recordings and transcripts (for program generation)</li>
                  <li>Workout progress and statistics</li>
                  <li>Device information and IP address</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">2. How We Use Your Information</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide 24/7 access to our fitness platform and voice AI consultations</li>
                  <li>Generate personalized workout and nutrition plans (300+ programs created)</li>
                  <li>Process membership payments and marketplace transactions in LKR</li>
                  <li>Coordinate trainer sessions (available 6AM-10PM daily, all included with membership)</li>
                  <li>Provide 24/7 gym access for Premium members with swipe card entry</li>
                  <li>Send updates about our Kandy locations and new features</li>
                  <li>Maintain our 4.8+ star rating through continuous improvement</li>
                  <li>Provide AI chatbot support and customer assistance</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">3. Information Sharing</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>With Certified Trainers:</strong> When booking sessions (all included with membership), we share relevant fitness information with your chosen trainer</li>
                  <li><strong>Service Providers:</strong> Stripe for LKR payments, Clerk for authentication, Convex for data storage, VAPI for AI consultations</li>
                  <li><strong>Marketplace Partners:</strong> For supplement and equipment deliveries within Sri Lanka</li>
                  <li><strong>Legal Requirements:</strong> When required by Sri Lankan law or to protect member safety</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">4. Data Security</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We implement robust security measures to protect your information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All data is encrypted in transit and at rest</li>
                  <li>Payment information is processed securely through Stripe (PCI DSS compliant)</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication measures</li>
                  <li>Secure cloud infrastructure with leading providers</li>
                </ul>
                <p className="mt-4">
                  While we strive to protect your information, no method of transmission over the internet is 100% secure. 
                  We encourage you to use strong passwords and keep your account information confidential.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">5. Your Rights and Choices</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>You have several rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information in your profile</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                  <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Restrict Processing:</strong> Limit how we use your information</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us at privacy@elitegym.com or through your account settings.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">6. Cookies and Tracking</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for platform functionality and security</li>
                  <li><strong>Performance Cookies:</strong> Help us understand how you use our platform</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                  <li><strong>Analytics:</strong> Aggregate usage statistics to improve our services</li>
                </ul>
                <p className="mt-4">
                  You can control cookie preferences through your browser settings, though this may affect platform functionality.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">7. Third-Party Services</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>Our platform integrates with several third-party services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Clerk:</strong> Authentication and user management</li>
                  <li><strong>Stripe:</strong> Payment processing and billing</li>
                  <li><strong>Convex:</strong> Database and real-time functionality</li>
                  <li><strong>Vercel:</strong> Platform hosting and deployment</li>
                  <li><strong>VAPI:</strong> AI voice consultation services</li>
                </ul>
                <p className="mt-4">
                  These services have their own privacy policies, and we encourage you to review them.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">8. Data Retention</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We retain your information for as long as necessary to provide our services and comply with legal obligations:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Account information: Until you delete your account</li>
                  <li>Payment records: 7 years for tax and legal purposes</li>
                  <li>AI consultation data: Until you request deletion</li>
                  <li>Usage analytics: Anonymized after 2 years</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">9. Children's Privacy</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our services are not intended for children under 13 years of age. We do not knowingly collect 
                  personal information from children under 13. If you believe we have collected information from 
                  a child under 13, please contact us immediately.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">10. International Users</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our services are hosted in the United States. If you are accessing our platform from outside 
                  the US, please be aware that your information may be transferred to, stored, and processed in 
                  the US where our servers are located and our central database is operated.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">11. Updates to This Policy</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes 
                  by email or through a prominent notice on our platform. Your continued use of our services after 
                  such modifications constitutes acknowledgment and acceptance of the updated Privacy Policy.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-6 text-foreground">12. Contact Us</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-card p-6 rounded-lg border">
                  <p><strong>Email:</strong> privacy@elitegym.com</p>
                  <p><strong>Kandy Location:</strong> 10 Riverview Rd, Tennekumbura</p>
                  <p><strong>Phone:</strong> +94 11 234 5678</p>
                  <p><strong>Kandy VIP Location:</strong> 82 A26, Kundasale 20168</p>
                  <p><strong>VIP Phone:</strong> +94 81 234 5678</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
