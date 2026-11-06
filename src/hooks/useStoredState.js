import { useCallback, useState } from 'react'

export function useStoredState(storageKey, readValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : readValue()
    } catch (error) {
      console.error(`Unable to read ${storageKey} from localStorage.`, error)
      return readValue()
    }
  })
  const updateValue = useCallback((nextValue) => {
    setValue((current) => {
      const resolved = typeof nextValue === 'function' ? nextValue(current) : nextValue
      try {
        localStorage.setItem(storageKey, JSON.stringify(resolved))
      } catch (error) {
        console.error(`Unable to save ${storageKey} to localStorage.`, error)
        throw new Error('Your browser could not save this setting.')
      }
      return resolved
    })
  }, [storageKey])
  return [value, updateValue]
}
