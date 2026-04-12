import { useState, useCallback } from 'react'

const STORAGE_KEY = 'sh_favorites'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => load())

  const toggleFavorite = useCallback((cafeteriaId) => {
    setFavorites((prev) => {
      const next = prev.includes(cafeteriaId)
        ? prev.filter((id) => id !== cafeteriaId)
        : [...prev, cafeteriaId]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (cafeteriaId) => favorites.includes(cafeteriaId),
    [favorites]
  )

  return { favorites, toggleFavorite, isFavorite }
}
