const TrainerBookingPage = () => {
  return (
    <div className="flex flex-col min-h-screen text-white overflow-hidden relative bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950/20 to-orange-950/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 py-32 relative z-10 flex-1">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            <span className="text-red-500">Trainer</span> Booking
          </h1>
          <div className="bg-black/90 backdrop-blur-sm border border-red-500/30 rounded-xl p-8 shadow-2xl">
            <p className="text-gray-300 text-lg">Book sessions with our certified trainers - Coming Soon!</p>
            <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm font-medium">This feature is under development and will be available soon.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerBookingPage;
