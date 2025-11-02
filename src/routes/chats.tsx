import { createFileRoute, useRouter } from '@tanstack/react-router'
import ChatsList from '../components/ChatsList'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/chats')({
  component: ChatsComponent,
})

function ChatsComponent() {
  const router = useRouter()
  const { isAuthenticated, hasProfile, isLoading } = useAuth()

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

  return <ChatsList />
}
