import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 Checking database status...");
    
    // Check users
    let users = [];
    try {
      users = await convex.query(api.users.getAllUsers, {});
      console.log("👥 Total users:", users?.length || 0);
    } catch (userError) {
      console.error("❌ Users query failed:", userError);
      return NextResponse.json({ 
        error: "Users query failed: " + (userError instanceof Error ? userError.message : String(userError))
      }, { status: 500 });
    }
    
    // Check marketplace items  
    let marketplaceItems = [];
    try {
      marketplaceItems = await convex.query(api.marketplace.getMarketplaceItems, {});
      console.log("🏪 Total marketplace items:", marketplaceItems?.length || 0);
    } catch (marketError) {
      console.error("❌ Marketplace query failed:", marketError);
    }

    return NextResponse.json({
      users: users?.length || 0,
      marketplaceItems: marketplaceItems?.length || 0,
      sampleUsers: users?.slice(0, 3).map(u => ({ 
        id: u._id, 
        clerkId: u.clerkId, 
        name: u.name 
      })) || [],
      convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL
    });

  } catch (error) {
    console.error("❌ Database check failed:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
