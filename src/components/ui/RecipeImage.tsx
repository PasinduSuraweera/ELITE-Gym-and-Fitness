"use client";

import { useState } from "react";
import { ChefHat } from "lucide-react";

interface RecipeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export const RecipeImage = ({
  src,
  alt,
  className = "w-full h-full object-cover",
  fallbackClassName = "w-full h-full flex items-center justify-center bg-gray-800 text-gray-600",
}: RecipeImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!src || imageError) {
    return (
      <div className={fallbackClassName}>
        <div className="text-center">
          <ChefHat className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs opacity-70">No Image</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {imageLoading && (
        <div className={fallbackClassName}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
            <p className="text-xs opacity-70">Loading...</p>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${imageLoading ? "hidden" : ""}`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
    </>
  );
};
