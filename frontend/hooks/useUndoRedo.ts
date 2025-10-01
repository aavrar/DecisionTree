import { useState, useCallback, useEffect } from 'react'

interface UseUndoRedoResult<T> {
  state: T
  setState: (newState: T | ((prev: T) => T)) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  clear: () => void
}

export function useUndoRedo<T>(initialState: T, maxHistory: number = 50): UseUndoRedoResult<T> {
  const [history, setHistory] = useState<T[]>([initialState])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Update history when initialState changes
  useEffect(() => {
    setHistory([initialState])
    setCurrentIndex(0)
  }, [JSON.stringify(initialState)])

  const state = history[currentIndex]

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory(prev => {
      const actualNewState = typeof newState === 'function'
        ? (newState as (prev: T) => T)(prev[currentIndex])
        : newState

      // Don't add to history if state hasn't changed
      if (JSON.stringify(actualNewState) === JSON.stringify(prev[currentIndex])) {
        return prev
      }

      // Remove any history after current index (when making changes after undo)
      const newHistory = prev.slice(0, currentIndex + 1)

      // Add new state
      newHistory.push(actualNewState)

      // Limit history size
      if (newHistory.length > maxHistory) {
        newHistory.shift()
        setCurrentIndex(currentIndex)
        return newHistory
      }

      setCurrentIndex(newHistory.length - 1)
      return newHistory
    })
  }, [currentIndex, maxHistory])

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }, [currentIndex])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, history.length])

  const clear = useCallback((newInitialState?: T) => {
    const stateToUse = newInitialState !== undefined ? newInitialState : state
    setHistory([stateToUse])
    setCurrentIndex(0)
  }, [state])

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    clear
  }
}
