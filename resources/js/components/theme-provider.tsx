"use client"

import type * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement

    if (disableTransitionOnChange) {
      root.classList.add("[&_*]:!transition-none")
      document.documentElement.classList.add("[&_*]:!transition-none")
    }

    return () => {
      if (disableTransitionOnChange) {
        root.classList.remove("[&_*]:!transition-none")
        document.documentElement.classList.remove("[&_*]:!transition-none")
      }
    }
  }, [disableTransitionOnChange])

  useEffect(() => {
    const root = window.document.documentElement

    function add(attribute: string, value: string) {
      root.setAttribute(attribute, value)
    }

    function remove(attribute: string) {
      root.removeAttribute(attribute)
    }

    if (attribute === "class") {
      root.classList.remove("light", "dark")
      if (theme === "system") {
        if (enableSystem) {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
          root.classList.add(systemTheme)
        }
      } else if (theme) {
        root.classList.add(theme)
      }
    } else if (attribute) {
      remove(attribute)
      if (theme === "system") {
        if (enableSystem) {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
          add(attribute, systemTheme)
        }
      } else if (theme) {
        add(attribute, theme)
      }
    }
  }, [theme, attribute, enableSystem])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
