"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, Dumbbell } from "lucide-react";

export default function BecomeTrainerPage() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    experience: "",
    certifications: "",
    motivation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const submitApplication = useMutation(api.trainers.submitTrainerApplication);
  const existingApplication = useQuery(api.trainers.getUserTrainerApplication);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      await submitApplication(formData);
      alert("Application submitted successfully! We'll review it and get back to you.");
      setFormData({ experience: "", certifications: "", motivation: "" });
    } catch (error) {
      alert("Failed to submit application: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-400">You need to be signed in to apply as a trainer</p>
        </div>
      </div>
    );
  }

  if (existingApplication) {
    const getStatusIcon = () => {
      switch (existingApplication.status) {
        case "pending":
          return <Clock className="h-16 w-16 text-yellow-400" />;
        case "approved":
          return <CheckCircle className="h-16 w-16 text-green-400" />;
        case "rejected":
          return <XCircle className="h-16 w-16 text-red-400" />;
        default:
          return <Clock className="h-16 w-16 text-yellow-400" />;
      }
    };

    const getStatusMessage = () => {
      switch (existingApplication.status) {
        case "pending":
          return {
            title: "Application Under Review",
            description: "Your trainer application is being reviewed by our admin team. We'll notify you once a decision is made.",
            bgColor: "from-yellow-500/20 to-orange-500/20",
            borderColor: "border-yellow-500/30"
          };
        case "approved":
          return {
            title: "Congratulations! You're Now a Trainer",
            description: "Your application has been approved. You now have access to trainer features and can start helping members achieve their fitness goals.",
            bgColor: "from-green-500/20 to-emerald-500/20",
            borderColor: "border-green-500/30"
          };
        case "rejected":
          return {
            title: "Application Not Approved",
            description: "Unfortunately, your trainer application was not approved at this time. Feel free to gain more experience and apply again in the future.",
            bgColor: "from-red-500/20 to-pink-500/20",
            borderColor: "border-red-500/30"
          };
        default:
          return {
            title: "Application Status Unknown",
            description: "Please contact support for assistance.",
            bgColor: "from-gray-500/20 to-gray-600/20",
            borderColor: "border-gray-500/30"
          };
      }
    };

    const statusInfo = getStatusMessage();

    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className={`bg-gradient-to-br ${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-lg p-8 text-center`}>
              <div className="mb-6">
                {getStatusIcon()}
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">{statusInfo.title}</h1>
              <p className="text-gray-300 mb-6 leading-relaxed">{statusInfo.description}</p>
              
              <div className="bg-black/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400 mb-2">Application submitted on:</p>
                <p className="text-white font-medium">{new Date(existingApplication.submittedAt).toLocaleDateString()}</p>
              </div>

              {existingApplication.notes && (
                <div className="bg-black/30 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-400 mb-2">Admin Notes:</p>
                  <p className="text-white">{existingApplication.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-6">
              <Dumbbell className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Become a Trainer</h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Join our elite team of fitness professionals and help members achieve their fitness goals. 
              Share your expertise and passion for fitness with our community.
            </p>
          </div>

          {/* Requirements */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Certified Fitness Professional</p>
                  <p className="text-gray-400 text-sm">Valid fitness certification required</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Experience in Training</p>
                  <p className="text-gray-400 text-sm">Minimum 1 year of training experience</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Passion for Fitness</p>
                  <p className="text-gray-400 text-sm">Genuine desire to help others succeed</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Professional Attitude</p>
                  <p className="text-gray-400 text-sm">Excellent communication skills</p>
                </div>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Application Form</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-white mb-2">
                  Training Experience *
                </label>
                <textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Describe your fitness and training experience. Include years of experience, types of training you specialize in, and any notable achievements..."
                  className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label htmlFor="certifications" className="block text-sm font-medium text-white mb-2">
                  Certifications & Qualifications *
                </label>
                <textarea
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                  placeholder="List your fitness certifications, education, and any relevant qualifications. Include certification body, date obtained, and current status..."
                  className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label htmlFor="motivation" className="block text-sm font-medium text-white mb-2">
                  Why do you want to be a trainer at Elite Gym? *
                </label>
                <textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  placeholder="Tell us about your passion for fitness, why you want to help others, and what you can bring to our team..."
                  className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/25 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting Application..." : "Submit Application"}
              </Button>
            </form>
          </div>

          {/* What Happens Next */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">What Happens Next?</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">1</div>
                <p className="text-gray-300">We'll review your application within 2-3 business days</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">2</div>
                <p className="text-gray-300">If approved, you'll receive trainer access and onboarding materials</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">3</div>
                <p className="text-gray-300">You can start helping members and building your trainer profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
