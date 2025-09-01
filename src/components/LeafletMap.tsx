"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

interface GymLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone?: string;
}

interface MapProps {
  locations: GymLocation[];
  className?: string;
}

// Fix for default markers in Leaflet
const customIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 19.404 12.5 41 12.5 41S25 19.404 25 12.5C25 5.596 19.404 0 12.5 0Z" fill="#DC2626"/>
      <circle cx="12.5" cy="12.5" r="7" fill="white"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function LeafletMap({ locations, className = "" }: MapProps) {
  useEffect(() => {
    // Fix for Leaflet icons in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "data:image/svg+xml;base64," +
        btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 19.404 12.5 41 12.5 41S25 19.404 25 12.5C25 5.596 19.404 0 12.5 0Z" fill="#DC2626"/>
          <circle cx="12.5" cy="12.5" r="7" fill="white"/>
        </svg>
      `),
      iconUrl:
        "data:image/svg+xml;base64," +
        btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 19.404 12.5 41 12.5 41S25 19.404 25 12.5C25 5.596 19.404 0 12.5 0Z" fill="#DC2626"/>
          <circle cx="12.5" cy="12.5" r="7" fill="white"/>
        </svg>
      `),
      shadowUrl: "",
    });
  }, []);

  if (locations.length === 0) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-900/50 rounded-lg`}
      >
        <p className="text-gray-400">No locations to display</p>
      </div>
    );
  }

  // Calculate center of all locations
  const centerLat =
    locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
  const centerLng =
    locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;

  return (
    <div
      className={className}
      role="application"
      aria-label="Gym locations map"
    >
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={8}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={customIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg mb-2 text-gray-900">
                  {location.name}
                </h3>
                <p className="text-sm text-gray-700 mb-2">{location.address}</p>
                {location.phone && (
                  <p className="text-sm text-gray-700 mb-3">
                    📞 {location.phone}
                  </p>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Get Directions
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
