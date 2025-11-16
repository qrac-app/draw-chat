import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { ArrowLeft } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import type { Id } from '../../convex/_generated/dataModel'
import { useAuth } from '@/hooks/useAuth'
import { useFileUpload } from '@/hooks/useFileUpload'

interface ChatContainerProps {
  chatId: Id<'chats'> | null | undefined
}

export default function ChatContainer({ chatId }: ChatContainerProps) {
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isSending, setIsSending] = useState(false)
  const { uploadFile, isUploading } = useFileUpload()

  // Use authenticated user data or fallback
  const currentUser = user

  // Get user settings for default input method
  const userSettings = useQuery(
    api.userSettings.getUserSettings,
    user?.userId ? { userId: user.userId } : 'skip',
  )

  const chatMessages = useQuery(
    api.chatMessages.getChatMessages,
    chatId ? { chatId } : 'skip',
  )

  const chat = useQuery(api.chats.getChatById, chatId ? { chatId } : 'skip')

  const globalMessages = useQuery(api.messages.list)

  const messages = chatId ? (chatMessages ?? []) : (globalMessages ?? [])
  const isLoading = chatId
    ? chatMessages === undefined
    : globalMessages === undefined

  const sendMessage = useMutation(
    chatId ? api.chatMessages.sendChatMessage : api.messages.send,
  ).withOptimisticUpdate((localStore, args) => {
    if (chatId) {
      // Chat message optimistic update
      const existingMessages = localStore.getQuery(
        api.chatMessages.getChatMessages,
        {
          chatId,
        },
      )
      if (existingMessages !== undefined) {
        const now = Date.now()
        const optimisticMessage = {
          _id: crypto.randomUUID() as Id<'chat_messages'>,
          chatId,
          senderId: currentUser?.userId
            ? ('temp' as Id<'profiles'>)
            : ('temp' as Id<'profiles'>),
          content: args.content,
          type: args.type,
          attachmentId: (args as any).attachmentId,
          timestamp: now,
          _creationTime: now,
          sender: {
            _id: currentUser?.userId
              ? ('temp' as Id<'profiles'>)
              : ('temp' as Id<'profiles'>),
            userId: currentUser?.userId || ('temp' as Id<'users'>),
            displayName: currentUser?.displayName || 'Unknown',
            username: currentUser?.username || 'unknown',
            email: currentUser?.email || '',
            _creationTime: now,
          },
          attachment: null,
          attachmentUrl: null,
        }
        localStore.setQuery(api.chatMessages.getChatMessages, { chatId }, [
          ...existingMessages,
          optimisticMessage,
        ])
      }
    } else {
      // Global message optimistic update
      const existingMessages = localStore.getQuery(api.messages.list)
      if (existingMessages !== undefined) {
        const now = Date.now()
        const optimisticMessage = {
          _id: crypto.randomUUID() as Id<'messages'>,
          content: args.content,
          type: args.type === 'attachment' ? 'text' : args.type,
          author: currentUser?.displayName || 'Unknown',
          timestamp: now,
          _creationTime: now,
        }
        localStore.setQuery(
          api.messages.list,
          [],
          [...existingMessages, optimisticMessage],
        )
      }
    }
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (
    content: string,
    type: 'text' | 'drawing' | 'attachment',
    attachmentId?: Id<'attachments'>,
  ) => {
    if (isSending || !currentUser) return

    setIsSending(true)

    try {
      if (type === 'attachment') {
        // Handle file upload
        if (!attachmentId) {
          console.error('Attachment ID is required for attachment messages')
          return
        }

        if (chatId) {
          await sendMessage({
            chatId,
            content,
            type,
            attachmentId,
          })
        }
      } else {
        // Handle text and drawing messages
        if (chatId) {
          await sendMessage({
            chatId,
            content,
            type,
          })
        } else {
          await sendMessage({
            content,
            type,
            author: currentUser.displayName,
          })
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const getChatTitle = () => {
    if (!chatId) return 'Drawing Chat'
    if (!chat) return 'Chat'

    if (chat.type === 'private' && chat.members.length === 2) {
      const otherMember = chat.members.find(
        (member: any) => member.userId !== currentUser?.userId,
      )
      return otherMember?.displayName || otherMember?.username || 'Private Chat'
    }

    return chat.name || 'Group Chat'
  }

  const getChatSubtitle = () => {
    if (!chatId) return 'Global chat room'
    if (!chat) return ''

    if (chat.type === 'group') {
      return `${chat.members.length} members`
    }

    return 'Private conversation'
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mobile-style Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center">
          <button
            onClick={() => window.history.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-800">
              {getChatTitle()}
            </h1>
            <p className="text-sm text-gray-500">{getChatSubtitle()}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          // Spinner for loading messages
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">
              {chatId ? 'Start the conversation!' : 'Welcome to Drawing Chat!'}
            </p>
            <p className="text-sm">
              Start by typing a message or drawing something.
            </p>
          </div>
        ) : (
          <div>
            {messages.map((message: any) => {
              const isOwn = chatId
                ? message.sender?.userId === currentUser?.userId
                : message.author === currentUser?.displayName

              return (
                <MessageBubble
                  key={message._id}
                  message={
                    chatId
                      ? {
                          ...message,
                          author: message.sender?.displayName || 'Unknown',
                        }
                      : message
                  }
                  isOwn={isOwn}
                />
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onFileUpload={uploadFile}
        disabled={isSending || isUploading}
        defaultInputMethod={userSettings?.defaultInputMethod || 'keyboard'}
        userId={user?.userId}
      />
    </div>
  )
}
