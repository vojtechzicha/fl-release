import { useNavigate } from '@remix-run/react'
import { useCallback, useEffect } from 'react'

function useRevalidate() {
  // We get the navigate function from React Rotuer
  let navigate = useNavigate()
  // And return a function which will navigate to `.` (same URL) and replace it
  return useCallback(
    function revalidate() {
      navigate('.', { replace: true })
    },
    [navigate]
  )
}

interface OptionsOnFocus {
  enabled?: boolean
}

export function useRevalidateOnFocus({ enabled = false }: OptionsOnFocus) {
  let revalidate = useRevalidate()

  useEffect(
    function revalidateOnFocus() {
      if (!enabled) return
      function onFocus() {
        const navigate = useNavigate()
        navigate('.', { replace: true })
      }
      window.addEventListener('focus', onFocus)
      return () => window.removeEventListener('focus', onFocus)
    },
    [revalidate]
  )

  useEffect(
    function revalidateOnVisibilityChange() {
      if (!enabled) return
      function onVisibilityChange() {
        const navigate = useNavigate()
        navigate('.', { replace: true })
      }
      window.addEventListener('visibilitychange', onVisibilityChange)
      return () =>
        window.removeEventListener('visibilitychange', onVisibilityChange)
    },
    [revalidate]
  )
}

interface OptionsOnInterval {
  enabled?: boolean
  interval?: number
}

export function useRevalidateOnInterval({
  enabled = false,
  interval = 1000,
}: OptionsOnInterval) {
  useEffect(function revalidateOnInterval() {
    if (!enabled) return
    let intervalId = setInterval(() => {
      const navigate = useNavigate()
      navigate('.', { replace: true })
    }, interval)
    return () => clearInterval(intervalId)
  }, [])
}
