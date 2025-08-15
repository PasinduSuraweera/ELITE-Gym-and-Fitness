import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export function useMembershipExpiryCheck() {
  const checkExpiredMemberships = useMutation(api.memberships.checkExpiredMemberships);

  const checkExpiry = async () => {
    try {
      const result = await checkExpiredMemberships({});
      if (result.updatedCount > 0) {
        console.log(`🔄 Updated ${result.updatedCount} expired memberships`);
      }
      return result;
    } catch (error) {
      console.error("Error checking expired memberships:", error);
      return null;
    }
  };

  // Auto-check on component mount and every hour
  useEffect(() => {
    // Check immediately
    checkExpiry();

    // Set up periodic check every hour
    const interval = setInterval(() => {
      checkExpiry();
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  return { checkExpiry };
}

// Utility function to get membership status with expiry information
export function getMembershipStatusInfo(membership: any) {
  if (!membership) return null;
  
  const now = new Date().getTime();
  const endDate = new Date(membership.currentPeriodEnd).getTime();
  const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  
  // Handle active membership with cancellation pending
  if (membership.status === 'active' && membership.cancelAtPeriodEnd) {
    return { 
      status: 'cancelling', 
      message: `Cancelling (${daysRemaining} days left)`, 
      color: 'orange',
      daysRemaining,
      isExpired: false
    };
  }
  
  // Handle cancelled status
  if (membership.status === 'cancelled') {
    if (membership.cancelAtPeriodEnd && daysRemaining > 0) {
      return { 
        status: 'cancelled', 
        message: `Cancelled (${daysRemaining} days left)`, 
        color: 'orange',
        daysRemaining,
        isExpired: false
      };
    } else {
      return { 
        status: 'cancelled', 
        message: 'Membership Cancelled', 
        color: 'red',
        daysRemaining: 0,
        isExpired: true
      };
    }
  } else if (membership.status !== 'active') {
    return { 
      status: 'inactive', 
      message: 'Membership Inactive', 
      color: 'red',
      daysRemaining: 0,
      isExpired: true
    };
  } else if (daysRemaining < 0) {
    return { 
      status: 'expired', 
      message: 'Membership Expired', 
      color: 'red',
      daysRemaining: 0,
      isExpired: true
    };
  } else if (daysRemaining <= 7) {
    return { 
      status: 'expiring', 
      message: `Expires in ${daysRemaining} days`, 
      color: 'yellow',
      daysRemaining,
      isExpired: false
    };
  } else if (daysRemaining <= 30) {
    return { 
      status: 'active', 
      message: `${daysRemaining} days remaining`, 
      color: 'orange',
      daysRemaining,
      isExpired: false
    };
  } else {
    return { 
      status: 'active', 
      message: 'Active Membership', 
      color: 'green',
      daysRemaining,
      isExpired: false
    };
  }
}

// Format dates consistently
export function formatMembershipDate(date: number | Date | null | undefined) {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'N/A';
  }
}
