import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Settings } from 'lucide-react'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@/hooks/useAuth'

export default function ChatsList() {
  const { user } = useAuth()
  const { data: chats, isLoading } = useQuery({
    ...convexQuery(api.chats.getUserChats, {}),
  })

  const getChatTitle = (chat: any) => {
    if (chat.type === 'private' && chat.members.length === 2) {
      const otherMember = chat.members.find(
        (member: any) => member.userId !== user?.userId,
      )
      return otherMember?.displayName || otherMember?.username || 'Private Chat'
    }
    return chat.name || 'Group Chat'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const getNavigationPath = (chat: any) => {
    if (chat.type === 'private' && chat.members.length === 2) {
      const otherMember = chat.members.find(
        (member: any) => member.userId !== user?.userId,
      )
      return `/u/${otherMember?.username}/chat`
    }
    return `/chat/${chat._id}`
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) {
      return 'Just now'
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
            <Link
              to="/settings"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Settings size={20} className="text-gray-600" />
            </Link>
          </div>
        </div>

        {/* Skeleton items */}
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center px-4 py-3">
              {/* Avatar skeleton */}
              <div className="flex-shrink-0 mr-3">
                <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse"></div>
              </div>

              {/* Content skeleton */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (chats !== undefined && chats.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl text-gray-400">💬</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No chats yet
          </h2>
          <p className="text-gray-600">
            Start a conversation to see it appear here
          </p>
        </div>
      </div>
    )
  }

  // If chats is still undefined (loading), don't render anything
  if (!chats) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile-style header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
          <Link
            to="/settings"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Settings size={20} className="text-gray-600" />
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {chats.map((chat) => {
          const chatTitle = getChatTitle(chat)
          const avatarInitials = getInitials(chatTitle)
          const avatarColor = getAvatarColor(chatTitle)

          return (
            <Link
              key={chat._id}
              to={getNavigationPath(chat)}
              className="block hover:bg-gray-50 transition-colors active:bg-gray-100"
            >
              <div className="flex items-center px-4 py-3">
                {/* Avatar */}
                <div className="flex-shrink-0 mr-3">
                  <div
                    className={`w-14 h-14 ${avatarColor} rounded-full flex items-center justify-center`}
                  >
                    <span className="text-white font-semibold text-lg">
                      {avatarInitials}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate pr-2">
                      {chatTitle}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatTimestamp(chat.lastMessageAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessagePreview || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
