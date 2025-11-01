import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Camera, Check, User, X } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/profile')({
  component: ProfileComponent,
})

function ProfileComponent() {
  const navigate = useNavigate()
  const { signOut, user, isAuthenticated, isLoading } = useAuth()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [profilePicture, setProfilePicture] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createOrUpdateProfile = useMutation(api.users.createOrUpdateProfile)
  const isUsernameAvailable = useQuery(
    api.users.isUsernameAvailable,
    username ? { username } : 'skip',
  )

  // Pre-fill form with existing user data if available
  useEffect(() => {
    if (user) {
      setUsername(user.username || '')
      setDisplayName(user.displayName || '')
      setProfilePicture(user.profilePicture || '')
    }
  }, [user])

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
    window.location.href = '/login'
    return null
  }

  const checkUsername = async () => {
    if (!username.trim()) return

    setIsCheckingUsername(true)
    setUsernameError('')

    // Basic validation
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters')
      setIsCheckingUsername(false)
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError(
        'Username can only contain letters, numbers, and underscores',
      )
      setIsCheckingUsername(false)
      return
    }

    // Check availability (this will be debounced by the query)
    setTimeout(() => {
      setIsCheckingUsername(false)
    }, 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !displayName.trim()) {
      setUsernameError('Please fill in all required fields')
      return
    }

    if (usernameError) return

    setIsSubmitting(true)

    try {
      // Get current user from auth context
      if (!user?.userId) {
        throw new Error('User not authenticated')
      }

      await createOrUpdateProfile({
        userId: user.userId,
        username: username.trim(),
        displayName: displayName.trim(),
        profilePicture: profilePicture.trim() || undefined,
        email: user.email,
      })

      navigate({ to: '/chat' })
    } catch (error) {
      console.error('Failed to create profile:', error)
      setUsernameError('Failed to create profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    signOut()
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>

      <div className="relative max-w-md w-full">
        <div className="text-center mb-8">
          <User className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-300">Set up your profile to start chatting</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
        >
          {/* Profile Picture */}
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              Profile Picture (Optional)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="url"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  placeholder="Enter image URL"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Username */}
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              Username *
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                onBlur={checkUsername}
                placeholder="Choose a unique username"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
              {username && !isCheckingUsername && (
                <div className="absolute right-3 top-2.5">
                  {isUsernameAvailable === false ? (
                    <X className="w-5 h-5 text-red-400" />
                  ) : isUsernameAvailable === true ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : null}
                </div>
              )}
            </div>
            {usernameError && (
              <p className="text-red-400 text-sm mt-1">{usernameError}</p>
            )}
            {username && !usernameError && isUsernameAvailable === false && (
              <p className="text-red-400 text-sm mt-1">
                Username is already taken
              </p>
            )}
            {username && !usernameError && isUsernameAvailable === true && (
              <p className="text-green-400 text-sm mt-1">
                Username is available!
              </p>
            )}
          </div>

          {/* Display Name */}
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              Display Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !username.trim() ||
                !displayName.trim() ||
                isUsernameAvailable === false
              }
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {isSubmitting ? 'Creating Profile...' : 'Complete Profile'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSignOut}
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Sign Out
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
