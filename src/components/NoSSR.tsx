"use client";

import { useState, useEffect, ReactNode } from 'react';

interface NoSSRProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to prevent hydration mismatches by only rendering children on client-side
 * Useful for components that interact with browser-specific APIs or are affected by browser extensions
 */
export default function NoSSR({ children, fallback = null }: NoSSRProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
