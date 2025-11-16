import { useCallback, useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

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
  const [allMessages, setAllMessages] = useState<Array<any>>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Initial load query (always query to get optimistic updates)
  const initialMessages = useQuery(api.chatMessages.getChatMessagesPaginated, {
    chatId,
    limit: 10,
  })

  // Load more messages query
  const olderMessages = useQuery(
    api.chatMessages.getChatMessagesPaginated,
    nextCursor && loadingMore
      ? { chatId, limit: 10, cursor: nextCursor }
      : 'skip',
  )

  // Initialize or reset when chatId changes
  useEffect(() => {
    if (!initialized) {
      // Will fetch fresh messages
      setAllMessages([])
      setHasMore(true)
      setNextCursor(null)
    }
  }, [chatId, initialized])

  // Handle initial load from fresh fetch
  useEffect(() => {
    if (initialMessages && !initialized) {
      setAllMessages(initialMessages.messages)
      setHasMore(initialMessages.hasMore)
      setNextCursor(initialMessages.nextCursor)
      setInitialized(true)
    } else if (initialMessages && initialized) {
      // Update with latest data (includes optimistic updates)
      setAllMessages(initialMessages.messages)
      setHasMore(initialMessages.hasMore)
      setNextCursor(initialMessages.nextCursor)
    }
  }, [initialMessages, initialized, chatId])

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

  const isLoading = !initialized && initialMessages === undefined

  // Use the messages from state
  const displayMessages = allMessages

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

  return <>{children(displayMessages, loadMore, hasMore, loadingMore)}</>
}
