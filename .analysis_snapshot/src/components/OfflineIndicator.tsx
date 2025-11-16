import { useEffect, useState } from 'react'
import { Wifi, WifiOff } from 'lucide-react'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showBackOnline, setShowBackOnline] = useState(false)

  useEffect(() => {
    // Skip during SSR
    if (typeof window === 'undefined') return

    // Set initial state after component mounts
    const initialState = navigator.onLine
    setIsOnline(initialState)

    // Only show if we start offline
    if (!initialState) {
      setShowBackOnline(false)
    }

    const handleOnline = () => {
      console.log('Coming back online')
      setIsOnline(true)
      setShowBackOnline(true)
      // Hide "back online" message after 3 seconds
      setTimeout(() => setShowBackOnline(false), 3000)
    }

    const handleOffline = () => {
      console.log('Going offline')
      setIsOnline(false)
      setShowBackOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Only show when offline or when just came back online
  if (isOnline && !showBackOnline) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 shadow-lg">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-green-500">
            Back online
          </span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">Offline</span>
        </>
      )}
    </div>
  )
}
