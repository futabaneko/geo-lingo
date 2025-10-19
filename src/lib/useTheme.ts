import { useEffect, useState } from 'react'

const KEY = 'geo-lingo-theme'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const v = localStorage.getItem(KEY) as Theme | null
      return v ?? (prefersDark ? 'dark' : 'light')
    } catch {
      return prefersDark ? 'dark' : 'light'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem(KEY, theme) } catch {}
  }, [theme])

  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return { theme, toggle }
}
