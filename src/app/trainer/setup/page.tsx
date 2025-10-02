"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RoleGuard } from "@/components/RoleGuard";
import { useRouter } from "next/navigation";
import { 
  User, 
  Star, 
  DollarSign, 
  Award,
  FileText,
  Upload,
  CheckCircle
} from "lucide-react";

export default function TrainerSetup() {
  const { user } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTrainerProfile = useMutation(api.trainerProfiles.createTrainerProfile);

  const [formData, setFormData] = useState({
    bio: "",
    specializations: [] as string[],
    experience: "",
    certifications: [] as string[],
    hourlyRate: 50,
    profileImage: "",
  });

  const [tempSpecialization, setTempSpecialization] = useState("");
  const [tempCertification, setTempCertification] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const specializationOptions = [
    "personal_training",
    "zumba", 
    "yoga",
    "crossfit",
    "cardio",
    "strength",
    "nutrition_consultation",
    "group_class"
  ];

  const handleSpecializationToggle = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const addCertification = () => {
    if (tempCertification.trim() && !formData.certifications.includes(tempCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, tempCertification.trim()]
      }));
      setTempCertification("");
    }
  };

  const removeCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert)
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      await createTrainerProfile({
        clerkId: user.id,
        name: user.fullName || `${user.firstName} ${user.lastName}` || "Unknown",
        email: user.emailAddresses[0]?.emailAddress || "",
        bio: formData.bio,
        specializations: formData.specializations,
        experience: formData.experience,
        certifications: formData.certifications,
        hourlyRate: formData.hourlyRate,
        profileImage: user.imageUrl,
      });

      // Redirect to trainer dashboard
      router.push("/trainer");
    } catch (error) {
      console.error("Error creating trainer profile:", error);
      alert("Error creating profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return formData.bio.length >= 50 && formData.experience.length > 0;
      case 2:
        return formData.specializations.length > 0;
      case 3:
        return formData.certifications.length > 0 && formData.hourlyRate > 0;
      default:
        return false;
    }
  };

  const formatSpecialization = (spec: string) => {
    return spec.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!mounted) {
    return (
      <RoleGuard allowedRoles={["trainer", "admin"]}>
        <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
          <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-accent rounded-lg"></div>
              <div className="h-64 bg-accent rounded-lg"></div>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["trainer", "admin"]}>
      <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background" suppressHydrationWarning>
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5" suppressHydrationWarning></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1)_0%,transparent_50%)]" suppressHydrationWarning></div>
        
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1 max-w-4xl" suppressHydrationWarning>
          {/* Header */}
          <div className="text-center mb-8" suppressHydrationWarning>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Complete Your <span className="text-primary">Trainer Profile</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Set up your professional profile to start accepting bookings from gym members
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= stepNum 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {step > stepNum ? <CheckCircle className="h-6 w-6" /> : stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div className={`w-16 h-1 ${
                      step > stepNum ? "bg-primary" : "bg-muted"
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-2">
              <span className="text-muted-foreground text-sm">
                Step {step} of 3
              </span>
            </div>
          </div>

          {/* Step Content */}
          <Card className="bg-card/50 border border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                {step === 1 && <><User className="h-5 w-5" /> Personal Information</>}
                {step === 2 && <><Star className="h-5 w-5" /> Specializations</>}
                {step === 3 && <><Award className="h-5 w-5" /> Certifications & Pricing</>}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {step === 1 && "Tell members about yourself and your experience"}
                {step === 2 && "Select your areas of expertise and training specializations"}
                {step === 3 && "Add your certifications and set your hourly rate"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Professional Bio <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell members about your background, training philosophy, and what makes you unique as a trainer..."
                      className="w-full p-4 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-none"
                      rows={5}
                    />
                    <div className="text-right text-xs text-muted-foreground mt-1">
                      {formData.bio.length}/300 characters (minimum 50)
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Years of Experience <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.experience}
                      onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="e.g., 5+ years, 10 years, etc."
                      className="bg-card border-border text-foreground focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Specializations */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-4">
                      Select Your Specializations <span className="text-destructive">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {specializationOptions.map((spec) => (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => handleSpecializationToggle(spec)}
                          className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                            formData.specializations.includes(spec)
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-card border-border text-foreground hover:bg-accent"
                          }`}
                        >
                          {formatSpecialization(spec)}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected: {formData.specializations.length} specialization(s)
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Certifications & Pricing */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Certifications <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        type="text"
                        value={tempCertification}
                        onChange={(e) => setTempCertification(e.target.value)}
                        placeholder="Enter certification name..."
                        className="flex-1 bg-card border-border text-foreground focus:ring-primary"
                        onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                      />
                      <Button
                        type="button"
                        onClick={addCertification}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Add
                      </Button>
                    </div>
                    
                    {formData.certifications.length > 0 && (
                      <div className="space-y-2">
                        {formData.certifications.map((cert, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                          >
                            <span className="text-foreground">{cert}</span>
                            <button
                              type="button"
                              onClick={() => removeCertification(cert)}
                              className="text-destructive hover:text-destructive/80 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Session Rate (LKR) <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
                        min="1000"
                        max="50000"
                        className="pl-10 bg-card border-border text-foreground focus:ring-primary"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Standard rate for reference (sessions are included with membership)
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              variant="outline"
              className="border-border text-foreground hover:bg-accent disabled:opacity-50"
            >
              Previous
            </Button>

            <div className="flex gap-3">
              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!isStepValid(step)}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid(step) || isSubmitting}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating Profile..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
