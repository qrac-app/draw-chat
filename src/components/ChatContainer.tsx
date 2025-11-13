import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
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
  const { data: userSettings } = useQuery({
    ...convexQuery(
      api.userSettings.getUserSettings,
      user?.userId ? { userId: user.userId } : 'skip',
    ),
  })

  const { data: chatMessages = [] } = useQuery({
    ...convexQuery(
      api.chatMessages.getChatMessages,
      chatId ? { chatId } : 'skip',
    ),
    initialData: [],
  })

  const { data: chat } = useQuery({
    ...convexQuery(api.chats.getChatById, chatId ? { chatId } : 'skip'),
  })

  const messages = chatMessages
  const { mutate: sendMessage, isPending: isSendingMutation } = useMutation({
    mutationFn: useConvexMutation(
      chatId ? api.chatMessages.sendChatMessage : api.messages.send,
    ),
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (
    content: string,
    type: 'text' | 'drawing' | 'attachment',
    attachmentId?: Id<'attachments'>,
  ) => {
    if (isSending || isSendingMutation || !currentUser) return

    setIsSending(true)
    try {
      if (type === 'attachment') {
        // Handle file upload
        if (!attachmentId) {
          console.error('Attachment ID is required for attachment messages')
          return
        }

        if (chatId) {
          sendMessage({
            chatId,
            content,
            type,
            attachmentId,
          })
        }
      } else {
        // Handle text and drawing messages
        if (chatId) {
          sendMessage({
            chatId,
            content,
            type,
          })
        } else {
          sendMessage({
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              {getChatTitle()}
            </h1>
            <p className="text-sm text-gray-500">{getChatSubtitle()}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Logged in as:</span>
            <span className="text-sm font-medium text-blue-600">
              {currentUser?.displayName || 'Anonymous User'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
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
        disabled={isSending || isSendingMutation || isUploading}
        defaultInputMethod={userSettings?.defaultInputMethod || 'keyboard'}
      />
    </div>
  )
}
