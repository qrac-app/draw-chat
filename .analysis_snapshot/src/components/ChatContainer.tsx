import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { api } from '../../convex/_generated/api'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import MessagePagination from './MessagePagination'
import type { Id } from '../../convex/_generated/dataModel'
import { useAuth } from '@/hooks/useAuth'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useMessages } from '@/contexts/MessagesContext'

interface ChatContainerProps {
  chatId: Id<'chats'> | null | undefined
  username?: string
  chatType?: 'private' | 'group' | 'global'
}

export default function ChatContainer({
  chatId,
  username,
  chatType,
}: ChatContainerProps) {
  const { user } = useAuth()
  const { addMessage } = useMessages()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const { uploadFile, isUploading } = useFileUpload()

  // Use authenticated user data or fallback
  const currentUser = user

  // Get user settings for default input method
  const userSettings = useQuery(
    api.userSettings.getUserSettings,
    user?.userId ? { userId: user.userId } : 'skip',
  )

  const chat = useQuery(api.chats.getChatById, chatId ? { chatId } : 'skip')
  const markMessagesAsRead = useMutation(api.chatMessages.markMessagesAsRead)

  // Reset first load state when chatId changes
  useEffect(() => {
    setIsFirstLoad(true)
  }, [chatId])

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (chatId && chat) {
      markMessagesAsRead({ chatId })
    }
  }, [chatId, chat, markMessagesAsRead])

  const globalMessages = useQuery(api.messages.list)

  const sendMessage = useMutation(
    chatId ? api.chatMessages.sendChatMessage : api.messages.send,
  ).withOptimisticUpdate((localStore, args) => {
    if (chatId) {
      // Chat message optimistic update for paginated query
      const existingMessages = localStore.getQuery(
        api.chatMessages.getChatMessagesPaginated,
        {
          chatId,
          limit: 10,
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
        localStore.setQuery(
          api.chatMessages.getChatMessagesPaginated,
          {
            chatId,
            limit: 10,
          },
          {
            messages: [...existingMessages.messages, optimisticMessage],
            hasMore: existingMessages.hasMore,
            nextCursor: existingMessages.nextCursor,
          },
        )

        // Also add to MessagesContext for preloading
        addMessage(chatId, optimisticMessage)
        setTimeout(() => {
          scrollToBottom()
        }, 50)
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

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    scrollToBottom(isFirstLoad ? 'auto' : 'smooth')
    if (isFirstLoad) {
      setIsFirstLoad(false)
    }
  }, [globalMessages, isFirstLoad])

  const handleSendMessage = async (
    content: string,
    type: 'text' | 'drawing' | 'attachment',
    attachmentId?: Id<'attachments'>,
  ) => {
    if (!currentUser) return

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
    }
  }

  const getChatTitle = () => {
    // Use external data as fallback when chat data is not loaded
    if (username) {
      return username
    }

    if (!chatId && chatType === 'global') return 'Drawing Chat'
    if (!chatId && !chat) return 'Chat'

    if (!chat) {
      // Use chatType from props as fallback
      if (chatType === 'private') return 'Private Chat'
      if (chatType === 'group') return 'Group Chat'
      return 'Chat'
    }

    if (chat.type === 'private' && chat.members.length === 2) {
      const otherMember = chat.members.find(
        (member: any) => member.userId !== currentUser?.userId,
      )
      return otherMember?.displayName || otherMember?.username || 'Private Chat'
    }

    return chat.name || 'Group Chat'
  }

  const getChatSubtitle = () => {
    if (!chatId) {
      // Use chatType from props as fallback
      if (chatType === 'global') return 'Global chat room'
      if (chatType === 'private') return 'Private conversation'
      if (chatType === 'group') return 'Group chat'
      return 'Global chat room'
    }

    if (!chat) {
      // Use chatType from props as fallback
      if (chatType === 'private') return 'Private conversation'
      if (chatType === 'group') return 'Group chat'
      return ''
    }

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
        {chatId ? (
          <MessagePagination chatId={chatId}>
            {(messages, loadMore, hasMore, loadingMore) => (
              <div>
                {/* Load more button */}
                {hasMore && (
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
                    >
                      <RefreshCw
                        size={16}
                        className={loadingMore ? 'animate-spin' : ''}
                      />
                      {loadingMore ? 'Loading...' : 'Load more messages'}
                    </button>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <p className="text-lg mb-2">Start the conversation!</p>
                    <p className="text-sm">
                      Start by typing a message or drawing something.
                    </p>
                  </div>
                ) : (
                  <div>
                    {messages.map((message: any) => {
                      const isOwn =
                        message.sender?.userId === currentUser?.userId

                      return (
                        <MessageBubble
                          key={message._id}
                          message={{
                            ...message,
                            author: message.sender?.displayName || 'Unknown',
                          }}
                          isOwn={isOwn}
                        />
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            )}
          </MessagePagination>
        ) : (
          // Global chat (non-paginated)
          <div>
            {globalMessages && globalMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p className="text-lg mb-2">Welcome to Drawing Chat!</p>
                <p className="text-sm">
                  Start by typing a message or drawing something.
                </p>
              </div>
            ) : (
              <div>
                {globalMessages?.map((message: any) => {
                  const isOwn = message.author === currentUser?.displayName

                  return (
                    <MessageBubble
                      key={message._id}
                      message={message}
                      isOwn={isOwn}
                    />
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onFileUpload={uploadFile}
        disabled={isUploading}
        defaultInputMethod={userSettings?.defaultInputMethod || 'keyboard'}
        userId={user?.userId}
      />
    </div>
  )
}
