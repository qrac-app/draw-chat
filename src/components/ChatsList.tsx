import { useQuery } from 'convex/react'
import { Link } from '@tanstack/react-router'
import { Clock, MessageSquare, Users } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '@/hooks/useAuth'

export default function ChatsList() {
  const { user } = useAuth()
  const chats = useQuery(api.chats.getUserChats) || []

  const getChatTitle = (chat: any) => {
    if (chat.type === 'private' && chat.members.length === 2) {
      const otherMember = chat.members.find(
        (member: any) => member.userId !== user?.userId,
      )
      return otherMember?.displayName || otherMember?.username || 'Private Chat'
    }
    return chat.name || 'Group Chat'
  }

  const getChatSubtitle = (chat: any) => {
    if (chat.type === 'group') {
      return `${chat.members.length} members`
    }
    return 'Private conversation'
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

  if (chats.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Chats</h1>

        <div className="space-y-2">
          {chats.map((chat) => (
            <Link
              key={chat._id}
              to={getNavigationPath(chat)}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all duration-200"
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      {chat.type === 'private' ? (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {getChatTitle(chat)}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTimestamp(chat.lastMessageAt)}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-1">
                        {getChatSubtitle(chat)}
                      </p>

                      {chat.lastMessagePreview && (
                        <p className="text-sm text-gray-500 truncate">
                          {chat.lastMessagePreview}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
