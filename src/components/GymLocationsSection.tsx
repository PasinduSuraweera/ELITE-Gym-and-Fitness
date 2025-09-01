"use client";

import dynamic from "next/dynamic";
import { gymLocations } from "@/data/gymLocations";

// Dynamic import to avoid SSR issues
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-900/50 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading map...</p>
      </div>
    </div>
  ),
});

export default function GymLocationsSection() {
  return (
    <section className="relative z-10 py-16">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 xl:px-32">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Visit Our <span className="text-red-500">Gym Locations</span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Find the nearest ELITE Gym & Fitness location and start your fitness
            journey today
          </p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden mb-8">
          <LeafletMap
            locations={gymLocations}
            className="w-full h-64 md:h-96 lg:h-[500px]"
          />
        </div>

        {/* Location List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gymLocations.map((location) => (
            <div
              key={location.id}
              className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-red-500/50 transition-all duration-300"
            >
              <h3 className="text-white font-semibold text-lg mb-2">
                {location.name}
              </h3>
              <p className="text-gray-400 text-sm mb-2">{location.address}</p>
              {location.phone && (
                <p className="text-red-400 text-sm mb-3">📞 {location.phone}</p>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Get Directions
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
