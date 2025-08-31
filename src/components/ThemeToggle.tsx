"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="w-9 h-9 hover:bg-gray-700/50 transition-colors"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-gray-800 dark:text-gray-200" />
      ) : (
        <Sun className="h-4 w-4 text-gray-200" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
