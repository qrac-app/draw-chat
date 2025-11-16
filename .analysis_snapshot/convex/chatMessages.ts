import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getUserIdfromAuthIdentity } from './auth/utils'

export const getChatMessages = query({
  args: { chatId: v.id('chats') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    // Get current user's profile
    const currentUserProfile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) =>
        q.eq('userId', getUserIdfromAuthIdentity(identity)),
      )
      .first()

    if (!currentUserProfile) {
      return []
    }

    // Check if user is a member of this chat
    const membership = await ctx.db
      .query('chat_members')
      .withIndex('by_userId_chatId', (q) =>
        q.eq('userId', currentUserProfile._id).eq('chatId', args.chatId),
      )
      .first()

    if (!membership) {
      return [] // User is not a member of this chat
    }

    // Get all messages for this chat
    const messages = await ctx.db
      .query('chat_messages')
      .withIndex('by_chatId_timestamp', (q) => q.eq('chatId', args.chatId))
      .order('asc')
      .collect()

    // Get sender profiles and attachment data for each message
    const messagesWithSenders = []
    for (const message of messages) {
      const senderProfile = await ctx.db.get(message.senderId)

      let attachment = null
      let attachmentUrl = null

      if (message.type === 'attachment' && message.attachmentId) {
        attachment = await ctx.db.get(message.attachmentId)
        if (attachment) {
          attachmentUrl = await ctx.storage.getUrl(attachment.storageId)
        }
      }

      messagesWithSenders.push({
        ...message,
        sender: senderProfile,
        attachment,
        attachmentUrl,
      })
    }

    return messagesWithSenders
  },
})

export const getChatMessagesPaginated = query({
  args: {
    chatId: v.id('chats'),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return { messages: [], hasMore: false, nextCursor: null }
    }

    // Get current user's profile
    const currentUserProfile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) =>
        q.eq('userId', getUserIdfromAuthIdentity(identity)),
      )
      .first()

    if (!currentUserProfile) {
      return { messages: [], hasMore: false, nextCursor: null }
    }

    // Check if user is a member of this chat
    const membership = await ctx.db
      .query('chat_members')
      .withIndex('by_userId_chatId', (q) =>
        q.eq('userId', currentUserProfile._id).eq('chatId', args.chatId),
      )
      .first()

    if (!membership) {
      return { messages: [], hasMore: false, nextCursor: null }
    }

    const limit = args.limit || 10
    let messagesQuery = ctx.db
      .query('chat_messages')
      .withIndex('by_chatId_timestamp', (q) => q.eq('chatId', args.chatId))

    // If cursor is provided, get messages older than the cursor
    if (args.cursor) {
      messagesQuery = messagesQuery.filter((q) =>
        q.lt(q.field('timestamp'), args.cursor!),
      )
    }

    // Get messages in descending order (newest first) for pagination
    const messages = await messagesQuery.order('desc').take(limit + 1)

    const hasMore = messages.length > limit
    const paginatedMessages = hasMore ? messages.slice(0, -1) : messages

    // Get sender profiles and attachment data for each message
    const messagesWithSenders = []
    for (const message of paginatedMessages) {
      const senderProfile = await ctx.db.get(message.senderId)

      let attachment = null
      let attachmentUrl = null

      if (message.type === 'attachment' && message.attachmentId) {
        attachment = await ctx.db.get(message.attachmentId)
        if (attachment) {
          attachmentUrl = await ctx.storage.getUrl(attachment.storageId)
        }
      }

      messagesWithSenders.push({
        ...message,
        sender: senderProfile,
        attachment,
        attachmentUrl,
      })
    }

    // Sort messages back to ascending order (oldest first) for display
    messagesWithSenders.sort((a, b) => a.timestamp - b.timestamp)

    const nextCursor =
      hasMore && paginatedMessages.length > 0
        ? paginatedMessages[paginatedMessages.length - 1].timestamp
        : null

    return {
      messages: messagesWithSenders,
      hasMore,
      nextCursor,
    }
  },
})

export const getLatestMessagePreview = query({
  args: { chatId: v.id('chats') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    // Get current user's profile
    const currentUserProfile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) =>
        q.eq('userId', getUserIdfromAuthIdentity(identity)),
      )
      .first()

    if (!currentUserProfile) {
      return null
    }

    // Check if user is a member of this chat
    const membership = await ctx.db
      .query('chat_members')
      .withIndex('by_userId_chatId', (q) =>
        q.eq('userId', currentUserProfile._id).eq('chatId', args.chatId),
      )
      .first()

    if (!membership) {
      return null
    }

    // Get the most recent message for this chat
    const lastMessage = await ctx.db
      .query('chat_messages')
      .withIndex('by_chatId_timestamp', (q) => q.eq('chatId', args.chatId))
      .order('desc')
      .first()

    if (!lastMessage) {
      return null
    }

    const senderProfile = await ctx.db.get(lastMessage.senderId)

    // Generate appropriate preview based on message type
    let preview: string
    if (lastMessage.type === 'drawing') {
      preview = 'Drawing'
    } else if (lastMessage.type === 'attachment') {
      preview = 'Attachment'
    } else {
      preview = lastMessage.content.slice(0, 100)
    }

    return {
      content: preview,
      timestamp: lastMessage.timestamp,
      sender: senderProfile?.displayName || 'Unknown',
    }
  },
})

export const sendChatMessage = mutation({
  args: {
    chatId: v.id('chats'),
    content: v.string(),
    type: v.union(
      v.literal('text'),
      v.literal('drawing'),
      v.literal('attachment'),
    ),
    attachmentId: v.optional(v.id('attachments')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Get current user's profile
    const currentUserProfile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) =>
        q.eq('userId', getUserIdfromAuthIdentity(identity)),
      )
      .first()

    if (!currentUserProfile) {
      throw new Error('User profile not found')
    }

    // Check if user is a member of this chat
    const membership = await ctx.db
      .query('chat_members')
      .withIndex('by_userId_chatId', (q) =>
        q.eq('userId', currentUserProfile._id).eq('chatId', args.chatId),
      )
      .first()

    if (!membership) {
      throw new Error('User is not a member of this chat')
    }

    const timestamp = Date.now()

    // Validate attachment if provided
    if (args.type === 'attachment' && !args.attachmentId) {
      throw new Error('Attachment ID is required for attachment messages')
    }

    // Create the message
    const messageId = await ctx.db.insert('chat_messages', {
      chatId: args.chatId,
      senderId: currentUserProfile._id,
      content: args.content,
      type: args.type,
      attachmentId: args.attachmentId,
      timestamp,
    })

    // Update the chat's last message info
    const chat = await ctx.db.get(args.chatId)
    if (chat) {
      // Generate appropriate preview based on message type
      let preview: string
      if (args.type === 'drawing') {
        preview = 'Drawing'
      } else if (args.type === 'attachment') {
        preview = 'Attachment'
      } else {
        preview = args.content.slice(0, 100)
      }

      await ctx.db.patch(args.chatId, {
        lastMessageAt: timestamp,
        lastMessagePreview: preview,
      })

      // Update lastReadAt for the sender to prevent their own message from being counted as unread
      const senderMembership = await ctx.db
        .query('chat_members')
        .withIndex('by_userId_chatId', (q) =>
          q.eq('userId', currentUserProfile._id).eq('chatId', args.chatId),
        )
        .first()

      if (senderMembership) {
        await ctx.db.patch(senderMembership._id, {
          lastReadAt: timestamp,
        })
      }
    }

    return messageId
  },
})

export const fixMessagePreviews = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Get current user's profile
    const currentUserProfile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) =>
        q.eq('userId', getUserIdfromAuthIdentity(identity)),
      )
      .first()

    if (!currentUserProfile) {
      throw new Error('User profile not found')
    }

    // Get all chats the user is a member of
    const memberships = await ctx.db
      .query('chat_members')
      .withIndex('by_userId', (q) => q.eq('userId', currentUserProfile._id))
      .collect()

    for (const membership of memberships) {
      // Get the most recent message for this chat
      const lastMessage = await ctx.db
        .query('chat_messages')
        .withIndex('by_chatId_timestamp', (q) =>
          q.eq('chatId', membership.chatId),
        )
        .order('desc')
        .first()

      if (lastMessage) {
        // Generate appropriate preview based on message type
        let preview: string
        if (lastMessage.type === 'drawing') {
          preview = 'Drawing'
        } else if (lastMessage.type === 'attachment') {
          preview = 'Attachment'
        } else {
          preview = lastMessage.content.slice(0, 100)
        }

        // Update the chat's preview
        await ctx.db.patch(membership.chatId, {
          lastMessagePreview: preview,
        })
      }
    }

    return { success: true }
  },
})

export const getUnreadCount = query({
  args: {
    chatId: v.id('chats'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return 0
    }

    // Get current user's profile
    const currentUserProfile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) =>
        q.eq('userId', getUserIdfromAuthIdentity(identity)),
      )
      .first()

    if (!currentUserProfile) {
      return 0
    }

    // Check if user is a member of this chat
    const membership = await ctx.db
      .query('chat_members')
      .withIndex('by_userId_chatId', (q) =>
        q.eq('userId', currentUserProfile._id).eq('chatId', args.chatId),
      )
      .first()

    if (!membership) {
      return 0 // User is not a member of this chat
    }

    // Get all messages newer than the user's last read timestamp
    // If lastReadAt is undefined, treat all messages as unread (use 0 as timestamp)
    const lastReadAt = membership.lastReadAt ?? 0
    const unreadMessages = await ctx.db
      .query('chat_messages')
      .withIndex('by_chatId_timestamp', (q) => q.eq('chatId', args.chatId))
      .filter((q) => q.gt(q.field('timestamp'), lastReadAt))
      .collect()

    // Count only messages not sent by the current user
    const unreadCount = unreadMessages.filter(
      (message) => message.senderId !== currentUserProfile._id,
    ).length

    return unreadCount
  },
})

export const markMessagesAsRead = mutation({
  args: {
    chatId: v.id('chats'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Get current user's profile
    const currentUserProfile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) =>
        q.eq('userId', getUserIdfromAuthIdentity(identity)),
      )
      .first()

    if (!currentUserProfile) {
      throw new Error('User profile not found')
    }

    // Find the user's membership in this chat
    const membership = await ctx.db
      .query('chat_members')
      .withIndex('by_userId_chatId', (q) =>
        q.eq('userId', currentUserProfile._id).eq('chatId', args.chatId),
      )
      .first()

    if (!membership) {
      throw new Error('User is not a member of this chat')
    }

    // Update last read timestamp to current time
    // This will mark all existing messages as read for future unread count calculations
    await ctx.db.patch(membership._id, {
      lastReadAt: Date.now(),
    })
  },
})
