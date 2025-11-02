import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { ArrowLeft, Edit3, Keyboard, Settings } from 'lucide-react'
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    navigate({ to: '/login' })
    return null
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>

      <div className="relative max-w-md w-full">
        <div className="text-center mb-8">
          <Settings className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-300">Customize your chat experience</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          {/* Default Input Method */}
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-4">
              Default Input Method
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-4 bg-slate-700/50 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
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
                  className="w-4 h-4 text-cyan-500 bg-slate-600 border-slate-500 focus:ring-cyan-500 focus:ring-2"
                />
                <div className="ml-3 flex items-center gap-3">
                  <Keyboard className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-white font-medium">Keyboard</div>
                    <div className="text-gray-400 text-sm">
                      Start with text input by default
                    </div>
                  </div>
                </div>
              </label>

              <label className="flex items-center p-4 bg-slate-700/50 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
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
                  className="w-4 h-4 text-cyan-500 bg-slate-600 border-slate-500 focus:ring-cyan-500 focus:ring-2"
                />
                <div className="ml-3 flex items-center gap-3">
                  <Edit3 className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-white font-medium">Canvas</div>
                    <div className="text-gray-400 text-sm">
                      Start with drawing canvas by default
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/chats' })}
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
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
