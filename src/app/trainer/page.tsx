"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleGuard } from "@/components/RoleGuard";
import { 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  TrendingUp, 
  CheckCircle,
  XCircle,
  Edit,
  Plus,
  Trash2,
  Eye,
  Receipt,
  Download
} from "lucide-react";
import Link from "next/link";

export default function TrainerDashboard() {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Get trainer profile
  const trainerProfile = useQuery(
    api.trainerProfiles.getTrainerByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get trainer stats
  const trainerStats = useQuery(
    api.trainerProfiles.getTrainerStats,
    trainerProfile ? { trainerId: trainerProfile._id } : "skip"
  );

  // Get bookings for today
  const todayBookings = useQuery(
    api.bookings.getTrainerBookings,
    user?.id ? { 
      trainerClerkId: user.id, 
      date: new Date().toISOString().split('T')[0]
    } : "skip"
  );

  // Get all upcoming bookings
  const upcomingBookings = useQuery(
    api.bookings.getTrainerBookings,
    user?.id ? { 
      trainerClerkId: user.id, 
      status: "confirmed"
    } : "skip"
  );

  // Get availability
  const availability = useQuery(
    api.availability.getTrainerAvailability,
    trainerProfile ? { trainerId: trainerProfile._id } : "skip"
  );

  // Get trainer reviews
  const trainerReviews = useQuery(
    api.reviews.getTrainerReviews,
    trainerProfile ? { trainerId: trainerProfile._id, limit: 20 } : "skip"
  );

  // Get trainer payroll records
  const trainerPayrollRecords = useQuery(
    api.salary.getEmployeePayrollRecords,
    user?.id ? { employeeClerkId: user.id } : "skip"
  );

  const updateBookingStatus = useMutation(api.bookings.updateBookingStatus);
  const cancelBooking = useMutation(api.bookings.cancelBooking);
  const setWeeklyAvailability = useMutation(api.availability.setWeeklyAvailability);
  const updateTrainerRate = useMutation(api.trainerProfiles.updateTrainerRate);
  const updateMyProfile = useMutation(api.trainerProfiles.updateMyTrainerProfile);

  const [weeklySchedule, setWeeklySchedule] = useState([
    { dayOfWeek: "monday" as const, startTime: "09:00", endTime: "17:00", isActive: true },
    { dayOfWeek: "tuesday" as const, startTime: "09:00", endTime: "17:00", isActive: true },
    { dayOfWeek: "wednesday" as const, startTime: "09:00", endTime: "17:00", isActive: true },
    { dayOfWeek: "thursday" as const, startTime: "09:00", endTime: "17:00", isActive: true },
    { dayOfWeek: "friday" as const, startTime: "09:00", endTime: "17:00", isActive: true },
    { dayOfWeek: "saturday" as const, startTime: "10:00", endTime: "16:00", isActive: false },
    { dayOfWeek: "sunday" as const, startTime: "10:00", endTime: "16:00", isActive: false },
  ]);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    bio: "",
    experience: "",
    certifications: [] as string[],
    specializations: [] as string[],
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize profile form when trainerProfile loads
  useEffect(() => {
    if (trainerProfile && !isEditingProfile) {
      setProfileForm({
        bio: trainerProfile.bio || "",
        experience: trainerProfile.experience || "",
        certifications: trainerProfile.certifications || [],
        specializations: trainerProfile.specializations || [],
      });
    }
  }, [trainerProfile, isEditingProfile]);

  const handleBookingAction = async (bookingId: string, action: "confirm" | "cancel" | "complete") => {
    try {
      if (action === "cancel") {
        // Use proper cancel booking function with refund logic
        await cancelBooking({
          bookingId: bookingId as any,
          cancellationReason: "Cancelled by trainer",
          cancelledBy: "trainer"
        });
      } else {
        // For confirm/complete, use simple status update
        const status = action === "confirm" ? "confirmed" : "completed";
        await updateBookingStatus({ 
          bookingId: bookingId as any, 
          status,
          cancellationReason: undefined
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      alert(`Error ${action}ing booking. Please try again.`);
    }
  };

  const handleSaveSchedule = async () => {
    if (!trainerProfile) return;
    
    try {
      await setWeeklyAvailability({
        trainerId: trainerProfile._id,
        schedule: weeklySchedule
      });
      alert("Schedule updated successfully!");
    } catch (error) {
      console.error("Error updating schedule:", error);
      alert("Error updating schedule. Please try again.");
    }
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    if (trainerProfile) {
      setProfileForm({
        bio: trainerProfile.bio || "",
        experience: trainerProfile.experience || "",
        certifications: trainerProfile.certifications || [],
        specializations: trainerProfile.specializations || [],
      });
    }
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await updateMyProfile({
        bio: profileForm.bio,
        experience: profileForm.experience,
        certifications: profileForm.certifications,
        specializations: profileForm.specializations,
      });
      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddCertification = () => {
    setProfileForm(prev => ({
      ...prev,
      certifications: [...prev.certifications, ""]
    }));
  };

  const handleRemoveCertification = (index: number) => {
    setProfileForm(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleCertificationChange = (index: number, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => i === index ? value : cert)
    }));
  };

  const availableSpecializations = [
    "personal_training",
    "zumba", 
    "yoga",
    "crossfit",
    "cardio",
    "strength",
    "nutrition_consultation",
    "group_class"
  ];

  const handleSpecializationToggle = (specialization: string) => {
    setProfileForm(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const formatTime = (time: string) => {
    if (!mounted) return time;
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return dateString;
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    if (!mounted) return 'Rs. 0';
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleDownloadPaySlip = (payrollRecord: any) => {
    const paySlipHTML = generatePaySlipHTML(payrollRecord);
    const blob = new Blob([paySlipHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PaySlip_${payrollRecord.employeeName}_${payrollRecord.payrollPeriod.month}_${payrollRecord.payrollPeriod.year}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatePaySlipHTML = (record: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pay Slip - ${record.employeeName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
          .pay-slip-title { font-size: 18px; margin-top: 10px; }
          .employee-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-section { flex: 1; }
          .info-title { font-weight: bold; margin-bottom: 10px; color: #374151; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .table th { background-color: #f8f9fa; font-weight: bold; }
          .total-row { background-color: #f0f9ff; font-weight: bold; }
          .net-salary { background-color: #dcfce7; font-weight: bold; font-size: 18px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">ELITE Gym & Fitness</div>
          <div class="pay-slip-title">SALARY SLIP</div>
          <div>Pay Period: ${record.payrollPeriod.periodLabel}</div>
        </div>

        <div class="employee-info">
          <div class="info-section">
            <div class="info-title">Employee Details</div>
            <div><strong>Name:</strong> ${record.employeeName}</div>
            <div><strong>Employee ID:</strong> ${record.employeeClerkId}</div>
            <div><strong>Role:</strong> ${record.employeeRole}</div>
          </div>
          <div class="info-section">
            <div class="info-title">Pay Period</div>
            <div><strong>Month:</strong> ${record.payrollPeriod.month} ${record.payrollPeriod.year}</div>
            <div><strong>Status:</strong> ${record.status}</div>
            <div><strong>Generated:</strong> ${new Date(record.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th colspan="2" style="text-align: center; background-color: #dbeafe;">EARNINGS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Base Salary</td>
              <td style="text-align: right;">${formatCurrency(record.earnings.baseSalary)}</td>
            </tr>
            <tr>
              <td>Allowances</td>
              <td style="text-align: right;">${formatCurrency(record.earnings.allowances)}</td>
            </tr>
            <tr>
              <td>Performance Bonus</td>
              <td style="text-align: right;">${formatCurrency(record.earnings.performanceBonus || 0)}</td>
            </tr>
            <tr>
              <td>Session Earnings</td>
              <td style="text-align: right;">${formatCurrency(record.earnings.sessionEarnings || 0)}</td>
            </tr>
            <tr class="total-row">
              <td><strong>Total Earnings</strong></td>
              <td style="text-align: right;"><strong>${formatCurrency(record.earnings.totalEarnings)}</strong></td>
            </tr>
          </tbody>
        </table>

        <table class="table">
          <thead>
            <tr>
              <th colspan="2" style="text-align: center; background-color: #fef3c7;">DEDUCTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Income Tax (PAYE)</td>
              <td style="text-align: right;">${formatCurrency(record.deductions.incomeTax)}</td>
            </tr>
            <tr>
              <td>EPF Employee (8%)</td>
              <td style="text-align: right;">${formatCurrency(record.deductions.epfEmployee)}</td>
            </tr>
            <tr>
              <td>Insurance</td>
              <td style="text-align: right;">${formatCurrency(record.deductions.insurance || 0)}</td>
            </tr>
            <tr>
              <td>Other Deductions</td>
              <td style="text-align: right;">${formatCurrency(record.deductions.otherDeductions || 0)}</td>
            </tr>
            <tr class="total-row">
              <td><strong>Total Deductions</strong></td>
              <td style="text-align: right;"><strong>${formatCurrency(record.deductions.totalDeductions)}</strong></td>
            </tr>
          </tbody>
        </table>

        <table class="table">
          <thead>
            <tr>
              <th colspan="2" style="text-align: center; background-color: #fecaca;">EMPLOYER CONTRIBUTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>EPF Employer (12%)</td>
              <td style="text-align: right;">${formatCurrency(record.deductions.epfEmployer)}</td>
            </tr>
            <tr>
              <td>ETF Employer (3%)</td>
              <td style="text-align: right;">${formatCurrency(record.deductions.etfEmployer)}</td>
            </tr>
            <tr class="total-row">
              <td><strong>Total Employer Cost</strong></td>
              <td style="text-align: right;"><strong>${formatCurrency(record.totalEmployerCost)}</strong></td>
            </tr>
          </tbody>
        </table>

        <table class="table">
          <tbody>
            <tr class="net-salary">
              <td><strong>NET SALARY</strong></td>
              <td style="text-align: right;"><strong>${formatCurrency(record.netSalary)}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>This is a computer-generated pay slip. No signature required.</p>
          <p>ELITE Gym & Fitness - Payroll System</p>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;
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

  if (!trainerProfile) {
    return (
      <RoleGuard allowedRoles={["trainer", "admin"]}>
        <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative bg-background">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5"></div>
          <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">Setup Required</h1>
              <p className="text-muted-foreground mb-6">Your trainer profile needs to be set up first.</p>
              <Link href="/trainer/setup">
                <Button className="bg-primary hover:bg-primary/90">
                  Complete Profile Setup
                </Button>
              </Link>
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
        
        <div className="container mx-auto px-4 py-32 relative z-10 flex-1" suppressHydrationWarning>
          {/* Header */}
          <div className="mb-8" suppressHydrationWarning>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              Welcome back, <span className="text-primary">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.fullName || trainerProfile.name}</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your schedule, bookings, and track your performance
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/50 border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Sessions</p>
                    <p className="text-3xl font-bold text-foreground">{trainerStats?.totalSessions || 0}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Upcoming Sessions</p>
                    <p className="text-3xl font-bold text-foreground">{trainerStats?.upcomingSessions || 0}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Rating</p>
                    <div className="flex items-center gap-2">
                      <p className="text-3xl font-bold text-foreground">{trainerProfile.rating.toFixed(1)}</p>
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    </div>
                    <p className="text-xs text-muted-foreground">{trainerProfile.totalReviews} reviews</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Session Status</p>
                    <p className="text-3xl font-bold text-green-400">Included</p>
                    <p className="text-sm text-muted-foreground">For members</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-card/50 border border-border">
              <TabsTrigger value="bookings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Today's Bookings
              </TabsTrigger>
              <TabsTrigger value="schedule" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Manage Schedule
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Upcoming Sessions
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Reviews
              </TabsTrigger>
              <TabsTrigger value="payslips" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Payment Slips
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Profile Settings
              </TabsTrigger>
            </TabsList>

            {/* Today's Bookings */}
            <TabsContent value="bookings" className="space-y-6">
              <Card className="bg-card/50 border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Today's Sessions ({formatDate(new Date().toISOString().split('T')[0])})
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Manage your sessions for today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {todayBookings && todayBookings.length > 0 ? (
                    <div className="space-y-4">
                      {todayBookings.map((booking) => (
                        <div
                          key={booking._id}
                          className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-foreground">{booking.userName}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                booking.status === "confirmed" ? "bg-green-500/20 text-green-300" :
                                booking.status === "pending" ? "bg-yellow-500/20 text-yellow-300" :
                                booking.status === "cancelled" ? "bg-red-500/20 text-red-300" :
                                "bg-accent text-muted-foreground"
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)} • 
                              {booking.sessionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            {booking.notes && (
                              <p className="text-muted-foreground text-sm mt-1">Note: {booking.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            {booking.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleBookingAction(booking._id, "confirm")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBookingAction(booking._id, "cancel")}
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </>
                            )}
                            {booking.status === "confirmed" && (
                              <Button
                                size="sm"
                                onClick={() => handleBookingAction(booking._id, "complete")}
                                className="bg-primary hover:bg-primary/90"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No sessions scheduled for today</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Management */}
            <TabsContent value="schedule" className="space-y-6">
              <Card className="bg-card/50 border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Weekly Availability
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Set your available hours for each day of the week
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {weeklySchedule.map((day, index) => (
                    <div
                      key={day.dayOfWeek}
                      className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border"
                    >
                      <div className="w-24">
                        <label className="text-foreground font-medium capitalize">
                          {day.dayOfWeek}
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={day.isActive}
                          onChange={(e) => {
                            const newSchedule = [...weeklySchedule];
                            newSchedule[index].isActive = e.target.checked;
                            setWeeklySchedule(newSchedule);
                          }}
                          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                        />
                        <span className="text-muted-foreground text-sm">Available</span>
                      </div>

                      {day.isActive && (
                        <>
                          <div className="flex items-center gap-2">
                            <label className="text-muted-foreground text-sm">From:</label>
                            <Input
                              type="time"
                              value={day.startTime}
                              onChange={(e) => {
                                const newSchedule = [...weeklySchedule];
                                newSchedule[index].startTime = e.target.value;
                                setWeeklySchedule(newSchedule);
                              }}
                              className="w-32 bg-background border-border text-foreground"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="text-muted-foreground text-sm">To:</label>
                            <Input
                              type="time"
                              value={day.endTime}
                              onChange={(e) => {
                                const newSchedule = [...weeklySchedule];
                                newSchedule[index].endTime = e.target.value;
                                setWeeklySchedule(newSchedule);
                              }}
                              className="w-32 bg-background border-border text-foreground"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleSaveSchedule}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Save Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Upcoming Sessions */}
            <TabsContent value="upcoming" className="space-y-6">
              <Card className="bg-card/50 border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Upcoming Sessions
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    All your confirmed upcoming sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingBookings && upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBookings
                        .filter(booking => new Date(booking.sessionDate) > new Date())
                        .slice(0, 10)
                        .map((booking) => (
                        <div
                          key={booking._id}
                          className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-foreground">{booking.userName}</h3>
                              <span className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                                {booking.sessionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              {formatDate(booking.sessionDate)} • 
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              Contact: {booking.userEmail}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-border text-foreground hover:bg-accent"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No upcoming sessions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <Card className="bg-card/50 border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Customer Reviews
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    See what your clients are saying about your training sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {trainerReviews && trainerReviews.length > 0 ? (
                    <div className="space-y-4">
                      {/* Reviews Summary */}
                      <div className="bg-card rounded-lg p-4 border border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Star className="h-5 w-5 text-yellow-500 fill-current" />
                              <span className="text-foreground text-lg font-semibold">
                                {trainerProfile?.rating}/5.0
                              </span>
                            </div>
                            <span className="text-muted-foreground">
                              ({trainerProfile?.totalReviews} reviews)
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground text-sm">Overall Rating</p>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= (trainerProfile?.rating || 0)
                                      ? "text-yellow-500 fill-current"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Individual Reviews */}
                      <div className="space-y-3">
                        {trainerReviews.map((review) => (
                          <div
                            key={review._id}
                            className="bg-card rounded-lg p-4 border border-border"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                  {review.userImage ? (
                                    <img
                                      src={review.userImage}
                                      alt={review.userName}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-foreground font-medium">
                                      {review.userName.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="text-foreground font-medium">{review.userName}</p>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-3 w-3 ${
                                          star <= review.rating
                                            ? "text-yellow-500 fill-current"
                                            : "text-muted-foreground"
                                        }`}
                                      />
                                    ))}
                                    <span className="text-muted-foreground text-sm ml-1">
                                      {review.rating}/5
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-muted-foreground text-xs">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            {review.comment && (
                              <div className="mt-3">
                                <p className="text-foreground text-sm leading-relaxed">
                                  "{review.comment}"
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Load More Button (if needed) */}
                      {trainerReviews.length >= 20 && (
                        <div className="text-center">
                          <Button
                            variant="outline"
                            className="border-border text-foreground hover:bg-accent"
                          >
                            Load More Reviews
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-foreground text-lg font-medium mb-2">No Reviews Yet</h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        You haven't received any reviews yet. Complete some training sessions 
                        and encourage your clients to leave feedback about their experience.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Slips */}
            <TabsContent value="payslips" className="space-y-6">
              <Card className="bg-card/50 border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Payment Slips
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Download your salary payment slips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {trainerPayrollRecords && trainerPayrollRecords.length > 0 ? (
                    <div className="space-y-4">
                      {trainerPayrollRecords.map((record) => (
                        <div
                          key={record._id}
                          className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                <Receipt className="h-5 w-5 text-primary-foreground" />
                              </div>
                              <div>
                                <h3 className="text-foreground font-medium">
                                  Salary for {record.payrollPeriod.periodLabel}
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  Status: 
                                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                    record.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                    record.status === 'paid' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-yellow-500/20 text-yellow-400'
                                  }`}>
                                    {record.status === 'pending_approval' ? 'Pending' : record.status}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Gross Pay</p>
                                <p className="text-foreground font-medium">
                                  {formatCurrency(record.earnings.totalEarnings)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Deductions</p>
                                <p className="text-foreground font-medium">
                                  {formatCurrency(record.deductions.totalDeductions)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Net Salary</p>
                                <p className="text-green-400 font-bold">
                                  {formatCurrency(record.netSalary)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Generated</p>
                                <p className="text-foreground">
                                  {new Date(record.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              onClick={() => handleDownloadPaySlip(record)}
                              size="sm"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-foreground text-lg font-medium mb-2">No Payment Slips</h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto">
                        You don't have any payment slips yet. Payment slips will appear here 
                        after your salary is processed by the admin.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Settings */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-card/50 border border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Profile Settings
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Update your trainer profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Profile Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Profile Information
                        </label>
                        <div className="space-y-3">
                          <div className="p-3 bg-card rounded-lg border border-border">
                            <p className="text-muted-foreground text-sm">Name</p>
                            <p className="text-foreground">{trainerProfile?.name}</p>
                          </div>
                          <div className="p-3 bg-card rounded-lg border border-border">
                            <p className="text-muted-foreground text-sm">Email</p>
                            <p className="text-foreground">{trainerProfile?.email}</p>
                          </div>
                          <div className="p-3 bg-card rounded-lg border border-border">
                            <p className="text-muted-foreground text-sm">Rating</p>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-foreground">{trainerProfile?.rating}/5.0</span>
                              <span className="text-muted-foreground">({trainerProfile?.totalReviews} reviews)</span>
                            </div>
                          </div>
                          <div className="p-3 bg-card rounded-lg border border-border">
                            <p className="text-muted-foreground text-sm">Specializations</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {trainerProfile?.specializations.map((spec, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full"
                                >
                                  {spec.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="p-3 bg-card rounded-lg border border-border">
                            <p className="text-muted-foreground text-sm">Session Status</p>
                            <p className="text-foreground">
                              All sessions are included with member subscriptions
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-card rounded-lg p-6 border border-border">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-foreground">Edit Profile Information</h3>
                          {!isEditingProfile ? (
                            <button
                              onClick={handleEditProfile}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
                            >
                              Edit Profile
                            </button>
                          ) : (
                            <div className="space-x-2">
                              <button
                                onClick={handleCancelEdit}
                                className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveProfile}
                                disabled={isSavingProfile}
                                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                              >
                                {isSavingProfile ? "Saving..." : "Save Changes"}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-6">
                          {/* Bio Section */}
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Bio
                            </label>
                            {isEditingProfile ? (
                              <textarea
                                value={profileForm.bio}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                                rows={4}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Tell us about yourself..."
                              />
                            ) : (
                              <p className="text-foreground bg-muted p-3 rounded-lg">
                                {trainerProfile?.bio || "No bio added yet"}
                              </p>
                            )}
                          </div>

                          {/* Experience Section */}
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Experience
                            </label>
                            {isEditingProfile ? (
                              <textarea
                                value={profileForm.experience}
                                onChange={(e) => setProfileForm(prev => ({ ...prev, experience: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Describe your training experience..."
                              />
                            ) : (
                              <p className="text-foreground bg-muted p-3 rounded-lg">
                                {trainerProfile?.experience || "No experience added yet"}
                              </p>
                            )}
                          </div>

                          {/* Certifications Section */}
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Certifications
                            </label>
                            {isEditingProfile ? (
                              <div className="space-y-2">
                                {profileForm.certifications.map((cert, index) => (
                                  <div key={index} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={cert}
                                      onChange={(e) => handleCertificationChange(index, e.target.value)}
                                      className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                                      placeholder="Enter certification..."
                                    />
                                    <button
                                      onClick={() => handleRemoveCertification(index)}
                                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-2 rounded-lg transition-colors"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={handleAddCertification}
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
                                >
                                  Add Certification
                                </button>
                              </div>
                            ) : (
                              <div className="bg-muted p-3 rounded-lg">
                                {trainerProfile?.certifications && trainerProfile.certifications.length > 0 ? (
                                  <ul className="text-foreground space-y-1">
                                    {trainerProfile.certifications.map((cert, index) => (
                                      <li key={index} className="flex items-center">
                                        <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                        {cert}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-muted-foreground">No certifications added yet</p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Specializations Section */}
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Update Specializations
                            </label>
                            {isEditingProfile ? (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {availableSpecializations.map((spec) => (
                                  <label
                                    key={spec}
                                    className="flex items-center space-x-2 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={profileForm.specializations.includes(spec)}
                                      onChange={() => handleSpecializationToggle(spec)}
                                      className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-foreground text-sm capitalize">
                                      {spec.replace('_', ' ')}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-muted p-3 rounded-lg">
                                <p className="text-muted-foreground text-sm mb-2">Current specializations (click Edit Profile to modify):</p>
                                {trainerProfile?.specializations && trainerProfile.specializations.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {trainerProfile.specializations.map((spec, index) => (
                                      <span
                                        key={index}
                                        className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm capitalize"
                                      >
                                        {spec.replace('_', ' ')}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground">No specializations selected yet</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RoleGuard>
  );
}
