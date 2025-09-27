"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Check, 
  X, 
  Eye, 
  Edit, 
  Star, 
  Users, 
  DollarSign, 
  Calendar,
  Award,
  Mail,
  Phone
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { useAuth } from "@clerk/nextjs";

export default function AdminTrainerManagementPage() {
  const { isSignedIn } = useAuth();
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("pending");

  // Get all trainer profiles
  const allTrainers = useQuery(api.trainerProfiles.getActiveTrainers, isSignedIn ? {} : "skip");

  // Get trainer applications (mock data - you'd need to create this query)
  const pendingApplications = [
    {
      _id: "app1",
      name: "John Smith",
      email: "john@example.com",
      bio: "Certified personal trainer with 5 years experience",
      specializations: ["strength", "cardio"],
      experience: "5 years",
      certifications: ["NASM-CPT", "ACSM"],
      hourlyRate: 75,
      profileImage: null,
      appliedAt: Date.now() - 86400000,
      status: "pending"
    },
    {
      _id: "app2", 
      name: "Sarah Johnson",
      email: "sarah@example.com",
      bio: "Yoga instructor and nutrition specialist",
      specializations: ["yoga", "nutrition_consultation"],
      experience: "3 years",
      certifications: ["RYT-200", "NASM-CNC"],
      hourlyRate: 65,
      profileImage: null,
      appliedAt: Date.now() - 172800000,
      status: "pending"
    }
  ];

  // Mutations
  const createTrainerProfile = useMutation(api.trainerProfiles.createTrainerProfile);
  const updateTrainerProfile = useMutation(api.trainerProfiles.updateTrainerProfile);

  const handleApproveApplication = async (application: any) => {
    try {
      await createTrainerProfile({
        clerkId: `temp_${application._id}`, // In real app, this would be the actual clerk ID
        name: application.name,
        email: application.email,
        bio: application.bio,
        specializations: application.specializations,
        experience: application.experience,
        certifications: application.certifications,
        hourlyRate: application.hourlyRate,
        profileImage: application.profileImage,
      });
      
      alert("Trainer application approved!");
    } catch (error) {
      console.error("Error approving application:", error);
      alert("Failed to approve application");
    }
  };

  const handleRejectApplication = (applicationId: string) => {
    // In real app, update application status to rejected
    alert("Application rejected");
  };

  const handleToggleTrainerStatus = async (trainerId: Id<"trainerProfiles">, isActive: boolean) => {
    try {
      await updateTrainerProfile({
        trainerId,
        isActive: !isActive,
      });
      alert(`Trainer ${!isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Error updating trainer status:", error);
      alert("Failed to update trainer status");
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`}
      />
    ));
  };

  return (
    <AdminLayout 
      title="Trainer Management" 
      subtitle="Manage trainer applications and profiles"
    >

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-border mb-8">
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Pending Applications ({pendingApplications.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Active Trainers ({allTrainers?.filter(t => t.isActive).length || 0})
            </TabsTrigger>
            <TabsTrigger value="inactive" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
              Inactive Trainers ({allTrainers?.filter(t => !t.isActive).length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Pending Applications */}
          <TabsContent value="pending">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingApplications.map((application) => (
                <Card key={application._id} className="bg-card/50 border border-border p-6 hover:border-primary/30 transition-all duration-300">
                  <div className="text-center mb-4">
                    <img
                      src={application.profileImage || "/logo.png"}
                      alt={application.name}
                      className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                    />
                    <h3 className="text-lg font-semibold text-foreground">{application.name}</h3>
                    <p className="text-muted-foreground text-sm">{application.email}</p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Experience:</span>
                      <span className="text-foreground">{application.experience}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rate:</span>
                      <span className="text-foreground">LKR {application.hourlyRate.toLocaleString()}/hr</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-muted-foreground text-xs mb-2">Specializations:</p>
                    <div className="flex flex-wrap gap-1">
                      {application.specializations.map((spec: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {application.bio && (
                    <div className="mb-4">
                      <p className="text-muted-foreground text-xs mb-1">Bio:</p>
                      <p className="text-foreground text-xs">{application.bio.slice(0, 100)}...</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproveApplication(application)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRejectApplication(application._id)}
                      variant="outline"
                      className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Active Trainers */}
          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTrainers?.filter(trainer => trainer.isActive).map((trainer) => (
                <Card key={trainer._id} className="bg-card/50 border border-border p-6 hover:border-primary/30 transition-all duration-300">
                  <div className="text-center mb-4">
                    <img
                      src={trainer.profileImage || "/logo.png"}
                      alt={trainer.name}
                      className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                    />
                    <h3 className="text-lg font-semibold text-foreground">{trainer.name}</h3>
                    <div className="flex items-center justify-center gap-1 text-yellow-400 mt-1">
                      {renderStars(Math.floor(trainer.rating || 0))}
                      <span className="text-muted-foreground text-sm">({trainer.totalReviews})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-foreground">{trainer.totalSessions}</div>
                      <div className="text-xs text-muted-foreground">Sessions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground">LKR {trainer.hourlyRate.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Per Hour</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {trainer.specializations.map((spec: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedTrainer(trainer)}
                      variant="outline"
                      className="flex-1 border-border text-foreground hover:bg-accent"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      onClick={() => handleToggleTrainerStatus(trainer._id, trainer.isActive)}
                      variant="outline"
                      className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      Deactivate
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Inactive Trainers */}
          <TabsContent value="inactive">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTrainers?.filter(trainer => !trainer.isActive).map((trainer) => (
                <Card key={trainer._id} className="bg-card/30 border border-border p-6 opacity-75">
                  <div className="text-center mb-4">
                    <img
                      src={trainer.profileImage || "/logo.png"}
                      alt={trainer.name}
                      className="w-16 h-16 rounded-full mx-auto mb-3 object-cover grayscale"
                    />
                    <h3 className="text-lg font-semibold text-foreground">{trainer.name}</h3>
                    <Badge variant="secondary" className="mt-2 bg-muted text-muted-foreground">
                      Inactive
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-muted-foreground">{trainer.totalSessions}</div>
                      <div className="text-xs text-muted-foreground/70">Sessions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-muted-foreground">LKR {trainer.hourlyRate.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground/70">Per Hour</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedTrainer(trainer)}
                      variant="outline"
                      className="flex-1 border-border text-foreground hover:bg-accent"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      onClick={() => handleToggleTrainerStatus(trainer._id, trainer.isActive)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Activate
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Trainer Details Modal */}
        {selectedTrainer && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="bg-card border border-border p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-foreground">{selectedTrainer.name}</h2>
                <Button
                  onClick={() => setSelectedTrainer(null)}
                  variant="outline"
                  className="border-border text-foreground hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedTrainer.profileImage || "/logo.png"}
                    alt={selectedTrainer.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400 mb-2">
                      {renderStars(Math.floor(selectedTrainer.rating || 0))}
                      <span className="text-foreground">({selectedTrainer.totalReviews})</span>
                    </div>
                    <Badge 
                      variant={selectedTrainer.isActive ? "default" : "secondary"}
                      className={selectedTrainer.isActive ? "bg-green-600" : "bg-muted"}
                    >
                      {selectedTrainer.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-foreground font-medium mb-2">Contact Information</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{selectedTrainer.email}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-foreground font-medium mb-2">Professional Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Experience:</span>
                        <span className="text-foreground">{selectedTrainer.experience}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hourly Rate:</span>
                        <span className="text-foreground">LKR {selectedTrainer.hourlyRate.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Sessions:</span>
                        <span className="text-foreground">{selectedTrainer.totalSessions}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-foreground font-medium mb-2">Specializations</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTrainer.specializations.map((spec: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedTrainer.certifications && (
                    <div>
                      <h4 className="text-foreground font-medium mb-2">Certifications</h4>
                      <div className="space-y-1">
                        {selectedTrainer.certifications.map((cert: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-foreground text-sm">
                            <Award className="h-3 w-3 text-yellow-400" />
                            <span>{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedTrainer.bio && (
                <div className="mt-6">
                  <h4 className="text-foreground font-medium mb-2">Bio</h4>
                  <p className="text-foreground text-sm leading-relaxed">{selectedTrainer.bio}</p>
                </div>
              )}
            </Card>
          </div>
        )}
    </AdminLayout>
  );
}
