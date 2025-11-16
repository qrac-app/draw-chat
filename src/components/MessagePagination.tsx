import { useCallback, useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { useMessages } from '@/contexts/MessagesContext'

interface MessagePaginationProps {
  chatId: Id<'chats'>
  children: (
    messages: Array<any>,
    loadMore: () => void,
    hasMore: boolean,
    loadingMore: boolean,
  ) => React.ReactNode
}

export default function MessagePagination({
  chatId,
  children,
}: MessagePaginationProps) {
  const { getMessages, setMessages } = useMessages()
  const [allMessages, setAllMessages] = useState<Array<any>>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Check for preloaded messages
  const preloadedMessages = getMessages(chatId)
  const hasPreloaded = preloadedMessages && preloadedMessages.length > 0
  console.log({ preloadedMessages });

  // Initial load query (only if no preloaded messages and not initialized)
  const initialMessages = useQuery(
    api.chatMessages.getChatMessagesPaginated,
    !initialized && !hasPreloaded ? { chatId, limit: 10 } : 'skip',
  )

  // Load more messages query
  const olderMessages = useQuery(
    api.chatMessages.getChatMessagesPaginated,
    nextCursor && loadingMore
      ? { chatId, limit: 10, cursor: nextCursor }
      : 'skip',
  )

  // Initialize or reset when chatId changes
  useEffect(() => {
    if (hasPreloaded) {
      console.log('has preloaded messages', preloadedMessages.length);
      // Use preloaded messages
      setAllMessages(preloadedMessages)
      setHasMore(false)
      setNextCursor(null)
      setInitialized(true)
    } else if (!initialized) {
      // Will fetch fresh messages
      setAllMessages([])
      setHasMore(true)
      setNextCursor(null)
    }
  }, [chatId, hasPreloaded, preloadedMessages, initialized])

  // Handle initial load from fresh fetch
  useEffect(() => {
    if (initialMessages && !hasPreloaded && !initialized) {
      setAllMessages(initialMessages.messages)
      setHasMore(initialMessages.hasMore)
      setNextCursor(initialMessages.nextCursor)
      setInitialized(true)
      setMessages(chatId, initialMessages.messages)
    }
  }, [initialMessages, hasPreloaded, initialized, chatId, setMessages])

  // Handle loading more messages
  useEffect(() => {
    if (olderMessages && loadingMore) {
      setAllMessages((prev) => [...olderMessages.messages, ...prev])
      setHasMore(olderMessages.hasMore)
      setNextCursor(olderMessages.nextCursor)
      setLoadingMore(false)
    }
  }, [olderMessages, loadingMore])

  const loadMore = useCallback(() => {
    if (hasMore && nextCursor && !loadingMore) {
      setLoadingMore(true)
    }
  }, [hasMore, nextCursor, loadingMore])

  const isLoading =
    !initialized && !hasPreloaded && initialMessages === undefined

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading messages...</p>
        </div>
      </div>
    )
  }

  return <>{children(allMessages, loadMore, hasMore, loadingMore)}</>
}
