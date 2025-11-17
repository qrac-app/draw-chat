import React, { createContext, useCallback, useContext, useState } from 'react'
import type { Id } from '../../convex/_generated/dataModel'

interface Chat {
  _id: Id<'chats'>
  name?: string
  type: 'private' | 'group'
  members: Array<{
    userId: Id<'users'>
    displayName: string
    username: string
  }>
  lastMessagePreview?: string
  lastMessageAt: number
  _creationTime: number
}

interface ChatCacheContextType {
  usernameToChatId: Record<string, Id<'chats'>>
  chats: Record<string, Chat>
  setChatCache: (chats: Array<Chat>) => void
  getChatIdByUsername: (username: string) => Id<'chats'> | undefined
  addChat: (chat: Chat) => void
  updateChat: (chatId: Id<'chats'>, updates: Partial<Chat>) => void
  clearCache: () => void
}

const ChatCacheContext = createContext<ChatCacheContextType | undefined>(
  undefined,
)

export function ChatCacheProvider({ children }: { children: React.ReactNode }) {
  const [usernameToChatId, setUsernameToChatId] = useState<
    Record<string, Id<'chats'>>
  >({})
  const [chats, setChats] = useState<Record<string, Chat>>({})

  const setChatCache = useCallback((newChats: Array<Chat>) => {
    const usernameMap: Record<string, Id<'chats'>> = {}
    const chatMap: Record<string, Chat> = {}

    newChats.forEach((chat) => {
      chatMap[chat._id] = chat

      // For private chats, create username -> chatId mapping
      if (chat.type === 'private' && chat.members.length === 2) {
        chat.members.forEach((member) => {
          usernameMap[member.username] = chat._id
        })
      }
    })

    setUsernameToChatId(usernameMap)
    setChats(chatMap)
  }, [])

  const getChatIdByUsername = useCallback(
    (username: string): Id<'chats'> | undefined => {
      return usernameToChatId[username]
    },
    [usernameToChatId],
  )

  const addChat = useCallback((chat: Chat) => {
    setChats((prev) => ({
      ...prev,
      [chat._id]: chat,
    }))

    // Add username mapping for private chats
    if (chat.type === 'private' && chat.members.length === 2) {
      setUsernameToChatId((prev) => {
        const newMap = { ...prev }
        chat.members.forEach((member) => {
          newMap[member.username] = chat._id
        })
        return newMap
      })
    }
  }, [])

  const updateChat = useCallback(
    (chatId: Id<'chats'>, updates: Partial<Chat>) => {
      setChats((prev) => ({
        ...prev,
        [chatId]: {
          ...prev[chatId],
          ...updates,
        },
      }))
    },
    [],
  )

  const clearCache = useCallback(() => {
    setUsernameToChatId({})
    setChats({})
  }, [])

  const value: ChatCacheContextType = {
    usernameToChatId,
    chats,
    setChatCache,
    getChatIdByUsername,
    addChat,
    updateChat,
    clearCache,
  }

  return (
    <ChatCacheContext.Provider value={value}>
      {children}
    </ChatCacheContext.Provider>
  )
}

export function useChatCache() {
  const context = useContext(ChatCacheContext)
  if (context === undefined) {
    throw new Error('useChatCache must be used within a ChatCacheProvider')
  }
  return context
}
