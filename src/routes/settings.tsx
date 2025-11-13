import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { ArrowLeft, Edit3, Keyboard } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/settings')({
  component: SettingsComponent,
})

function SettingsComponent() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [defaultInputMethod, setDefaultInputMethod] = useState<
    'keyboard' | 'canvas'
  >('keyboard')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getUserSettings = useQuery(
    api.userSettings.getUserSettings,
    user?.userId ? { userId: user.userId } : 'skip',
  )
  const updateUserSettings = useMutation(api.userSettings.updateUserSettings)

  // Pre-fill form with existing settings
  useEffect(() => {
    if (getUserSettings) {
      setDefaultInputMethod(getUserSettings.defaultInputMethod)
    }
  }, [getUserSettings])

  // Redirect to login if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    navigate({ to: '/login' })
    return null
  }

  // Show skeleton loader while user settings are loading
  if (!getUserSettings) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center">
            <div className="w-9 h-9 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-md mx-auto p-4">
          <div className="space-y-6">
            {/* Settings section skeleton */}
            <div>
              <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {/* Radio option 1 */}
                <div className="flex items-center p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="ml-3 flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div>
                      <div className="h-4 w-20 bg-gray-200 rounded mb-1 animate-pulse"></div>
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Radio option 2 */}
                <div className="flex items-center p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="ml-3 flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div>
                      <div className="h-4 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                      <div className="h-3 w-36 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons skeleton */}
            <div className="flex gap-3 pt-4">
              <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.userId) return

    setIsSubmitting(true)
    try {
      await updateUserSettings({
        userId: user.userId,
        defaultInputMethod,
      })
      navigate({ to: '/chats' })
    } catch (error) {
      console.error('Failed to update settings:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={() => navigate({ to: '/chats' })}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Default Input Method */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Default Input Method
            </h2>
            <div className="space-y-3">
              <label className="flex items-center p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="inputMethod"
                  value="keyboard"
                  checked={defaultInputMethod === 'keyboard'}
                  onChange={(e) =>
                    setDefaultInputMethod(
                      e.target.value as 'keyboard' | 'canvas',
                    )
                  }
                  className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <div className="ml-3 flex items-center gap-3">
                  <Keyboard className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Keyboard</div>
                    <div className="text-sm text-gray-500">
                      Start with text input by default
                    </div>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="inputMethod"
                  value="canvas"
                  checked={defaultInputMethod === 'canvas'}
                  onChange={(e) =>
                    setDefaultInputMethod(
                      e.target.value as 'keyboard' | 'canvas',
                    )
                  }
                  className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <div className="ml-3 flex items-center gap-3">
                  <Edit3 className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Canvas</div>
                    <div className="text-sm text-gray-500">
                      Start with drawing canvas by default
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/chats' })}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
