import { mutation } from "./_generated/server";

// Migration to update existing beginner memberships to basic
export const migrateBeginnerMemberships = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Starting migration of beginner memberships to basic...");
    
    // Get all memberships with beginner type
    const allMemberships = await ctx.db.query("memberships").collect();
    const beginnerMemberships = allMemberships.filter(m => (m as any).membershipType === "beginner");
    
    console.log(`📊 Found ${beginnerMemberships.length} beginner memberships to migrate`);
    
    let migratedCount = 0;
    
    for (const membership of beginnerMemberships) {
      try {
        await ctx.db.patch(membership._id, {
          membershipType: "basic",
          updatedAt: Date.now(),
        });
        migratedCount++;
        console.log(`✅ Migrated membership ${membership._id} from beginner to basic`);
      } catch (error) {
        console.error(`❌ Failed to migrate membership ${membership._id}:`, error);
      }
    }
    
    // Also migrate membership plans if any exist
    const allPlans = await ctx.db.query("membershipPlans").collect();
    const beginnerPlans = allPlans.filter(p => (p as any).type === "beginner");
    
    console.log(`📊 Found ${beginnerPlans.length} beginner plans to remove`);
    
    let removedPlansCount = 0;
    
    for (const plan of beginnerPlans) {
      try {
        await ctx.db.delete(plan._id);
        removedPlansCount++;
        console.log(`🗑️ Removed beginner plan ${plan._id}`);
      } catch (error) {
        console.error(`❌ Failed to remove plan ${plan._id}:`, error);
      }
    }
    
    console.log("✅ Migration completed!");
    
    return {
      migratedMemberships: migratedCount,
      removedPlans: removedPlansCount,
      message: `Successfully migrated ${migratedCount} memberships and removed ${removedPlansCount} beginner plans`
    };
  },
});

// Alternative: Delete beginner memberships if you prefer
export const deleteBeginnerMemberships = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Starting deletion of beginner memberships...");
    
    const allMemberships = await ctx.db.query("memberships").collect();
    const beginnerMemberships = allMemberships.filter(m => (m as any).membershipType === "beginner");
    
    console.log(`📊 Found ${beginnerMemberships.length} beginner memberships to delete`);
    
    let deletedCount = 0;
    
    for (const membership of beginnerMemberships) {
      try {
        await ctx.db.delete(membership._id);
        deletedCount++;
        console.log(`🗑️ Deleted beginner membership ${membership._id}`);
      } catch (error) {
        console.error(`❌ Failed to delete membership ${membership._id}:`, error);
      }
    }
    
    return {
      deletedCount,
      message: `Successfully deleted ${deletedCount} beginner memberships`
    };
  },
});