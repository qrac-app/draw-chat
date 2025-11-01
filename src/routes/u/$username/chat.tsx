import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/u/$username/chat')({
  component: UsernameChatComponent,
})

function UsernameChatComponent() {
  const { username } = Route.useParams()
  const { isAuthenticated, hasProfile, isLoading, user } = useAuth()
  const createOrGetPrivateChat = useMutation(api.chats.getOrCreatePrivateChat)
  const [error, setError] = useState<string | null>(null)

  const handleStartChat = async () => {
    try {
      const chatId = await createOrGetPrivateChat({ otherUsername: username })
      // Redirect to the actual chat
      window.location.href = `/chat/${chatId}`
    } catch (err) {
      console.error('Failed to start chat:', err)
      setError('Failed to start chat. Please make sure the username exists.')
    }
  }

  // Auto-start the chat when component mounts and user is ready
  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      hasProfile &&
      user &&
      user.username !== username
    ) {
      handleStartChat()
    }
  }, [username, isLoading, isAuthenticated, hasProfile, user])

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
    // Redirect to login if not authenticated
    window.location.href = '/login'
    return null
  }

  if (!hasProfile) {
    // Redirect to profile setup if user doesn't have a profile
    window.location.href = '/profile'
    return null
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    )
  }

  // Don't allow chatting with yourself
  if (user.username === username) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">You cannot start a chat with yourself</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Starting chat with {username}...</p>
      </div>
    </div>
  )
}
