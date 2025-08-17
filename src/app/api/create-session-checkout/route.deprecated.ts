// This file is deprecated - bookings are now free for members
// Kept for reference only

export async function POST() {
  return new Response(
    JSON.stringify({ 
      error: "Booking payments are deprecated. Bookings are now free for members." 
    }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  );
}
