import { useEffect, useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../../convex/_generated/api'
import ChatContainer from '../../../components/ChatContainer'
import type { Id } from '../../../../convex/_generated/dataModel'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/u/$username/chat')({
  component: UsernameChatComponent,
})

function UsernameChatComponent() {
  const { username } = Route.useParams()
  const router = useRouter()
  const { isAuthenticated, hasProfile, isLoading, user } = useAuth()
  const { data: existingChatId } = useSuspenseQuery(
    convexQuery(api.chats.getPrivateChatWithUser, {
      otherUsername: username,
    }),
  )
  const createPrivateChat = useMutation(api.chats.createPrivateChat)
  const [error, setError] = useState<string | null>(null)
  const [chatId, setChatId] = useState<Id<'chats'> | null>(null)
  const [isCreatingChat, setIsCreatingChat] = useState(false)

  const handleCreateChat = async () => {
    try {
      setIsCreatingChat(true)
      const id = await createPrivateChat({ otherUsername: username })
      setChatId(id)
    } catch (err) {
      console.error('Failed to create chat:', err)
      setError('Failed to create chat. Please make sure the username exists.')
    } finally {
      setIsCreatingChat(false)
    }
  }

  // Set chat ID if found via query
  useEffect(() => {
    if (existingChatId) {
      setChatId(existingChatId)
    }
  }, [existingChatId])

  // Create chat if not found and user is ready
  useEffect(() => {
    if (
      hasProfile &&
      existingChatId === null && // Query finished loading, no chat found
      !chatId &&
      !isCreatingChat
    ) {
      handleCreateChat()
    }
  }, [username, hasProfile, existingChatId, chatId, isCreatingChat])

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
    router.navigate({ to: '/login' })
    return null
  }

  if (!hasProfile) {
    // Redirect to profile setup if user doesn't have a profile
    router.navigate({ to: '/profile' })
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
            onClick={() => router.history.back()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Show loading while finding or creating chat
  if (existingChatId === null || (isCreatingChat && !chatId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {existingChatId === null
              ? `Finding chat with ${username}...`
              : `Creating chat with ${username}...`}
          </p>
        </div>
      </div>
    )
  }

  // Render the chat only when chatId is available
  if (!chatId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  return <ChatContainer chatId={chatId} />
}
