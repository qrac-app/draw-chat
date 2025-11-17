import React, { createContext, useCallback, useContext, useState } from 'react'
import type { Id } from '../../convex/_generated/dataModel'

interface ChatMessage {
  _id: Id<'chat_messages'>
  chatId: Id<'chats'>
  senderId: Id<'profiles'>
  content: string
  type: 'text' | 'drawing' | 'attachment'
  attachmentId?: Id<'attachments'>
  timestamp: number
  _creationTime: number
  sender?: {
    _id: Id<'profiles'>
    userId: Id<'users'>
    displayName: string
    username: string
    email: string
  } | null
  attachment?: any
  attachmentUrl?: string | null
}

interface MessagesContextType {
  messages: Record<string, Array<ChatMessage>>
  setMessages: (chatId: string, messages: Array<ChatMessage>) => void
  addMessage: (chatId: string, message: ChatMessage) => void
  getMessages: (chatId: string) => Array<ChatMessage> | undefined
  clearMessages: (chatId: string) => void
  hasMessages: (chatId: string) => boolean
}

const MessagesContext = createContext<MessagesContextType | undefined>(
  undefined,
)

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessagesState] = useState<
    Record<string, Array<ChatMessage>>
  >({})

  const setMessages = useCallback(
    (chatId: string, newMessages: Array<ChatMessage>) => {
      setMessagesState((prev) => ({
        ...prev,
        [chatId]: newMessages,
      }))
    },
    [],
  )

  const addMessage = useCallback((chatId: string, message: ChatMessage) => {
    setMessagesState((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] ?? []), message],
    }))
  }, [])

  const getMessages = useCallback(
    (chatId: string) => {
      return messages[chatId]
    },
    [messages],
  )

  const clearMessages = useCallback((chatId: string) => {
    setMessagesState((prev) => {
      const newMessages = { ...prev }
      delete newMessages[chatId]
      return newMessages
    })
  }, [])

  const hasMessages = useCallback(
    (chatId: string) => {
      const chatMessages = messages[chatId]
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      return Boolean(chatMessages && chatMessages.length > 0)
    },
    [messages],
  )

  const value: MessagesContextType = {
    messages,
    setMessages,
    addMessage,
    getMessages,
    clearMessages,
    hasMessages,
  }

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessagesContext)
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider')
  }
  return context
}
