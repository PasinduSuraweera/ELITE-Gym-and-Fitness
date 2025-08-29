"use client"

import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"

interface ThemeAwareLogoProps {
  width: number
  height: number
  className?: string
  alt?: string
}

export function ThemeAwareLogo({ 
  width, 
  height, 
  className = "", 
  alt = "Elite Gym Logo" 
}: ThemeAwareLogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Image 
        src="/logo.png" 
        alt={alt}
        width={width} 
        height={height} 
        className={className}
      />
    )
  }

  // Use logo2.png for light mode, logo.png for dark mode
  const logoSrc = resolvedTheme === "light" ? "/logo2.png" : "/logo.png"
  
  return (
    <Image 
      src={logoSrc} 
      alt={alt}
      width={width} 
      height={height} 
      className={className}
    />
  )
}
