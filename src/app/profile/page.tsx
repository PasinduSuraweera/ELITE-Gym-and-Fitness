"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserLayout } from "@/components/UserLayout";
import ProfileHeader from "@/components/ProfileHeader";
import NoFitnessPlan from "@/components/NoFitnessPlan";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Shield, Activity, Target, Clock, Download, CreditCard } from "lucide-react";
import { useMembershipExpiryCheck, getMembershipStatusInfo, formatMembershipDate } from "@/lib/membership-utils";

const ProfilePage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const userId = user?.id as string;
  const [mounted, setMounted] = useState(false);
  
  // Auto-check for expired memberships
  useMembershipExpiryCheck();

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
      return;
    }
  }, [isLoaded, user, router]);

  const allPlans = useQuery(
    api.plans.getUserPlans, 
    user?.id ? { userId: user.id } : "skip"
  );
  const userRole = useQuery(api.users.getCurrentUserRole);
  const currentMembership = useQuery(
    api.memberships.getUserMembershipWithExpiryCheck,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  // Get user's recent bookings
  const userBookings = useQuery(
    api.bookings.getUserBookings,
    user?.id ? { userClerkId: user.id } : "skip"
  );
  
  // Get user's own payroll records (for all users including admins)
  const userPayrollRecords = useQuery(
    api.salary.getEmployeePayrollRecords,
    user?.id ? { employeeClerkId: user.id } : "skip"
  );
  
  const cancelMembership = useMutation(api.memberships.cancelMembership);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during auth check or hydration
  if (!mounted || !isLoaded) {
    return (
      <UserLayout 
        title="Profile Overview" 
        subtitle="Manage your account and view your fitness journey"
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-card rounded-lg"></div>
          </div>
        </div>
      </UserLayout>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const handleCancelMembership = async () => {
    if (!user?.id) return;
    
    console.log("🔍 Cancel button clicked for user:", user.id);
    console.log("🔍 Current membership before cancel:", currentMembership);
    
    if (!confirm('Are you sure you want to cancel your membership?\n\nThis will:\n• Cancel your Stripe subscription\n• Stop future billing\n• You\'ll keep access until your current billing period ends\n\nThis action cannot be undone.')) {
      return;
    }
    
    try {
      console.log("🚫 User cancelling their own membership:", user.id);
      const result = await cancelMembership({ clerkId: user.id });
      console.log("✅ Cancel membership result:", result);
      alert('✅ Your membership has been cancelled successfully.\n\nYour membership will remain active until the end of your current billing period. No further charges will be made.');
    } catch (error) {
      console.error("❌ Error cancelling membership:", error);
      alert("❌ Error cancelling membership. Please contact support if this issue persists.");
    }
  };

  // Generate and download membership card
  const downloadMembershipCard = () => {
    if (!currentMembership || !user) return;

    // Create canvas for membership card
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set card dimensions (standard credit card ratio)
    canvas.width = 800;
    canvas.height = 500;

    // Create gradient background using system colors
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'hsl(222.2, 84%, 4.9%)'); // background
    gradient.addColorStop(0.5, 'hsl(217.2, 32.6%, 17.5%)'); // muted
    gradient.addColorStop(1, 'hsl(222.2, 84%, 4.9%)'); // background
    
    // Fill background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add outer border using foreground color
    ctx.strokeStyle = 'hsl(210, 40%, 98%)'; // foreground
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Add inner accent border using primary color
    ctx.strokeStyle = 'hsl(221.2, 83.2%, 53.3%)'; // primary
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Load and draw logo
    const logoImg = new Image();
    logoImg.onload = () => {
      // Draw logo in top left with proper sizing
      ctx.drawImage(logoImg, 40, 40, 80, 80);
      generateCardContent();
    };
    
    logoImg.onerror = () => {
      // If logo fails to load, create a placeholder
      ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)'; // primary
      ctx.fillRect(40, 40, 80, 80);
      ctx.fillStyle = 'hsl(210, 40%, 98%)'; // foreground
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ELITE', 80, 70);
      ctx.fillText('GYM', 80, 90);
      generateCardContent();
    };
    
    // Try to load the logo
    logoImg.src = '/logo.png';

    const generateCardContent = () => {
      // Add membership title
      ctx.fillStyle = 'hsl(210, 40%, 98%)'; // foreground
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('ELITE GYM & FITNESS', 140, 70);
      
      ctx.font = '18px Arial';
      ctx.fillStyle = 'hsl(215, 20.2%, 65.1%)'; // muted-foreground
      ctx.fillText('MEMBERSHIP CARD', 140, 95);

      // Add member information
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)'; // primary
      ctx.fillText('MEMBER NAME', 40, 160);
      ctx.font = '18px Arial';
      ctx.fillStyle = 'hsl(210, 40%, 98%)'; // foreground
      ctx.fillText(user.fullName || user.firstName || 'Member', 40, 185);

      // Add email
      ctx.font = '14px Arial';
      ctx.fillStyle = 'hsl(215, 20.2%, 65.1%)'; // muted-foreground
      ctx.fillText(`${user.emailAddresses?.[0]?.emailAddress || 'N/A'}`, 40, 205);

      // Add membership type with color coding
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)'; // primary
      ctx.fillText('PLAN TYPE', 40, 250);
      
      // Color code different plan types
      const planColors = {
        'Premium': 'hsl(142.1, 76.2%, 36.3%)', // success/green
        'Standard': 'hsl(221.2, 83.2%, 53.3%)', // primary/blue  
        'Basic': 'hsl(25, 95%, 53%)', // warning/orange
      };
      const planType = currentMembership.membershipType || 'Standard';
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = planColors[planType as keyof typeof planColors] || planColors.Standard;
      ctx.fillText(`${planType.toUpperCase()} PLAN`, 40, 275);

      // Add member ID
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)'; // primary
      ctx.textAlign = 'right';
      ctx.fillText('MEMBER ID', canvas.width - 40, 160);
      ctx.font = '16px Arial';
      ctx.fillStyle = 'hsl(210, 40%, 98%)'; // foreground
      const memberId = currentMembership.stripeCustomerId?.slice(-8).toUpperCase() || user.id.slice(-8).toUpperCase();
      ctx.fillText(`#${memberId}`, canvas.width - 40, 185);

      // Add validity dates
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)'; // primary
      ctx.fillText('VALID FROM', canvas.width - 40, 220);
      ctx.font = '16px Arial';
      ctx.fillStyle = 'hsl(210, 40%, 98%)'; // foreground
      ctx.fillText(formatDate(currentMembership.currentPeriodStart), canvas.width - 40, 245);

      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = 'hsl(221.2, 83.2%, 53.3%)'; // primary
      ctx.fillText('VALID UNTIL', canvas.width - 40, 280);
      ctx.font = '16px Arial';
      ctx.fillStyle = 'hsl(210, 40%, 98%)'; // foreground
      ctx.fillText(formatDate(currentMembership.currentPeriodEnd), canvas.width - 40, 305);

      // Add status with system color scheme
      ctx.font = 'bold 18px Arial';
      const statusInfo = getMembershipStatusInfo(currentMembership);
      if (statusInfo) {
        const statusColors = {
          'green': 'hsl(142.1, 76.2%, 36.3%)', // success
          'orange': 'hsl(25, 95%, 53%)', // warning
          'yellow': 'hsl(47.9, 95.8%, 53.1%)', // warning variant
          'red': 'hsl(0, 84.2%, 60.2%)', // destructive
        };
        ctx.fillStyle = statusColors[statusInfo.color as keyof typeof statusColors] || statusColors.green;
        ctx.textAlign = 'center';
        ctx.fillText(`STATUS: ${statusInfo.message.toUpperCase()}`, canvas.width / 2, 350);
      }

      // Generate and draw barcode in bottom right
      const generateBarcode = (membershipId: string) => {
        // Create a simple barcode pattern from membership ID
        const barcodeData = membershipId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const barcodeWidth = 160;
        const barcodeHeight = 35;
        const barcodeX = canvas.width - barcodeWidth - 40; // Position from right edge
        const barcodeY = 380;
        
        // Draw barcode background with slight border
        ctx.fillStyle = 'hsl(210, 40%, 98%)'; // foreground (white background for barcode)
        ctx.fillRect(barcodeX - 3, barcodeY - 3, barcodeWidth + 6, barcodeHeight + 20);
        
        // Add subtle border around barcode
        ctx.strokeStyle = 'hsl(215, 20.2%, 65.1%)'; // muted-foreground
        ctx.lineWidth = 1;
        ctx.strokeRect(barcodeX - 3, barcodeY - 3, barcodeWidth + 6, barcodeHeight + 20);
        
        // Draw barcode lines
        ctx.fillStyle = 'hsl(222.2, 84%, 4.9%)'; // background (black bars)
        const barWidth = 1.5;
        const spaceWidth = 1;
        
        for (let i = 0; i < barcodeData.length && i * (barWidth + spaceWidth) * 2.5 < barcodeWidth - 10; i++) {
          const char = barcodeData[i];
          const charCode = char.charCodeAt(0);
          
          // Create pattern based on character code
          const pattern = [
            charCode % 2 === 0 ? barWidth : barWidth * 0.7, // Thick or thin bar
            spaceWidth, // Space
            charCode % 3 === 0 ? barWidth * 1.3 : barWidth, // Variable width bar
            spaceWidth, // Space
            charCode % 4 === 0 ? barWidth : barWidth * 0.8, // Another pattern
          ];
          
          let currentX = barcodeX + 5 + (i * (barWidth + spaceWidth) * 2.5);
          
          for (let j = 0; j < pattern.length; j += 2) {
            if (pattern[j] > 0 && currentX < barcodeX + barcodeWidth - pattern[j] - 5) {
              ctx.fillRect(currentX, barcodeY, pattern[j], barcodeHeight);
            }
            currentX += pattern[j] + (pattern[j + 1] || 0);
          }
        }
        
        // Add barcode number below in smaller font
        ctx.font = '8px monospace';
        ctx.fillStyle = 'hsl(222.2, 84%, 4.9%)'; // background (black text)
        ctx.textAlign = 'center';
        ctx.fillText(barcodeData.slice(0, 16), barcodeX + barcodeWidth / 2, barcodeY + barcodeHeight + 12);
      };
      
      // Generate barcode from membership ID
      const barcodeId = currentMembership._id || currentMembership.stripeCustomerId || user.id;
      generateBarcode(barcodeId);

      // Add footer text positioned to not conflict with barcode
      ctx.font = '12px Arial';
      ctx.fillStyle = 'hsl(215, 20.2%, 65.1%)'; // muted-foreground
      ctx.textAlign = 'left';
      ctx.fillText('Elite Gym & Fitness - Your Premium Fitness Partner', 40, 440);
      ctx.font = '10px Arial';
      ctx.fillText(`Generated on ${new Date().toLocaleDateString()}`, 40, 460);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `elite-gym-membership-card-${user.firstName || 'member'}-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
  };

  // Check if membership is expired or expiring soon
  const getMembershipStatus = (membership: any) => {
    if (!mounted || !membership) return null;
    
    const now = new Date().getTime();
    const endDate = new Date(membership.currentPeriodEnd).getTime();
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    
    if (membership.status !== 'active') {
      return { status: 'inactive', message: 'Membership Inactive', color: 'red' };
    } else if (daysRemaining < 0) {
      return { status: 'expired', message: 'Membership Expired', color: 'red' };
    } else if (daysRemaining <= 7) {
      return { status: 'expiring', message: `Expires in ${daysRemaining} days`, color: 'yellow' };
    } else if (daysRemaining <= 30) {
      return { status: 'active', message: `${daysRemaining} days remaining`, color: 'orange' };
    } else {
      return { status: 'active', message: 'Active Membership', color: 'green' };
    }
  };

  // Format date consistently on client side only
  const formatDate = (date: number | Date | null | undefined) => {
    if (!mounted || !date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatYear = (date: number | Date | null | undefined) => {
    if (!mounted || !date) return 'N/A';
    try {
      return new Date(date).getFullYear().toString();
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount: number) => {
    if (!mounted) return 'Rs. 0';
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const activePlan = allPlans?.find((plan) => plan.isActive);

  // Shared profile content for both admin and regular users
  const profileContentForUser = () => (
    <>
      {/* Membership Status - Always show this regardless of plans */}
      {currentMembership && (
        <Card className={`bg-card/50 mb-6 ${
          (currentMembership.status === 'cancelled' || 
           (currentMembership.status === 'active' && currentMembership.cancelAtPeriodEnd)) ? 'border-orange-500/50' : 
          currentMembership.status === 'expired' ? 'border-red-500/50' : 
          'border-green-500/50'
        }`}>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Shield className={`h-6 w-6 ${
                (currentMembership.status === 'cancelled' || 
                 (currentMembership.status === 'active' && currentMembership.cancelAtPeriodEnd)) ? 'text-orange-500' : 
                currentMembership.status === 'expired' ? 'text-red-500' : 
                'text-green-500'
              }`} />
              {(currentMembership.status === 'active' && currentMembership.cancelAtPeriodEnd) ? 'Cancelling Membership' :
               currentMembership.status === 'cancelled' ? 'Cancelled Membership' : 
               currentMembership.status === 'expired' ? 'Expired Membership' : 
               'Current Membership'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan Type</p>
                <p className="text-foreground font-semibold capitalize">
                  {currentMembership.membershipType} Plan
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                {(() => {
                  const statusInfo = getMembershipStatusInfo(currentMembership);
                  if (!statusInfo) return <span className="text-muted-foreground">Loading...</span>;
                  
                  const colorClasses = {
                    green: 'text-green-400',
                    yellow: 'text-yellow-400', 
                    orange: 'text-orange-400',
                    red: 'text-red-400'
                  };

                  return (
                    <p className={`font-semibold ${colorClasses[statusInfo.color as keyof typeof colorClasses] || 'text-muted-foreground'}`}>
                      {statusInfo.message}
                    </p>
                  );
                })()}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="text-foreground font-semibold">
                  {formatMembershipDate(currentMembership.currentPeriodStart)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="text-foreground font-semibold">
                  {formatMembershipDate(currentMembership.currentPeriodEnd)}
                </p>
              </div>
            </div>
            
            {/* Progress Bar for Active Memberships */}
            {(() => {
              if (currentMembership.status !== 'active') return null;
              
              const now = new Date().getTime();
              const start = new Date(currentMembership.currentPeriodStart).getTime();
              const end = new Date(currentMembership.currentPeriodEnd).getTime();
              const total = end - start;
              const elapsed = now - start;
              const progress = Math.max(0, Math.min(100, (elapsed / total) * 100));
              
              return (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Membership Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress > 80 ? 'bg-red-500' :
                        progress > 60 ? 'bg-orange-500' :
                        progress > 40 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })()}
            
            {/* Cancel Membership Button or Status Info */}
            {currentMembership.status === 'active' && !currentMembership.cancelAtPeriodEnd && (
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Membership Actions</p>
                    <p className="text-xs text-muted-foreground">Download your card or manage your membership</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={downloadMembershipCard}
                    variant="outline"
                    size="sm"
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Card
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancelMembership}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Cancel Membership
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!currentMembership && (
        <Card className="bg-card/50 border-yellow-500/50 mb-6">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Active Membership</h3>
            <p className="text-muted-foreground mb-4">
              Get access to premium features and facilities with our membership plans
            </p>
            <Button 
              onClick={() => window.location.href = '/membership'}
              className="bg-primary hover:bg-primary/90"
            >
              View Membership Plans
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Fitness Plans Section */}
      {allPlans && allPlans.length > 0 ? (
        <>
          {/* Active Plan Preview */}
          {activePlan ? (
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Active Fitness Plan
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your current active fitness program
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{activePlan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Schedule: {activePlan.workoutPlan.schedule.join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Daily Calories</p>
                      <p className="text-xl font-bold text-primary">{activePlan.dietPlan.dailyCalories}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      asChild 
                      className=""
                    >
                      <a href="/profile/fitness-plans">View Workout Plan</a>
                    </Button>
                    <Button 
                      asChild 
                      variant="outline" 
                      className=""
                    >
                      <a href="/profile/diet-plans">View Diet Plan</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/50 border-border">
              <CardContent className="p-8 text-center">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Active Plan</h3>
                <p className="text-muted-foreground mb-6">
                  Get started with a personalized fitness and diet plan tailored to your goals.
                </p>
                <Button 
                  asChild 
                  className=""
                >
                  <a href="/generate-program">Generate Your Plan</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Show NoFitnessPlan when user has no plans */
        <NoFitnessPlan />
      )}
    </>
  );



  return (
    <UserLayout 
      title="Profile Overview" 
      subtitle="Manage your account and view your fitness journey"
    >
      <div className="space-y-6">
        {/* Original Profile Header with Picture */}
        <ProfileHeader user={user} />

        {/* User Profile Card - Always show this */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="text-foreground font-semibold capitalize">{userRole || 'User'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-foreground font-semibold">
                    {formatDate(user?.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Plans</p>
                  <p className="text-foreground font-semibold">{allPlans?.filter(plan => plan.isActive).length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rest of profile content */}
        {profileContentForUser()}
      </div>
    </UserLayout>
  );
};
export default ProfilePage;
