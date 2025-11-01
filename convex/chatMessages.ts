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
      .withIndex('by_userId', (q) => q.eq('userId', getUserIdfromAuthIdentity(identity)))
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

    // Get sender profiles for each message
    const messagesWithSenders = []
    for (const message of messages) {
      const senderProfile = await ctx.db.get(message.senderId)
      messagesWithSenders.push({
        ...message,
        sender: senderProfile,
      })
    }

    return messagesWithSenders
  },
})

export const sendChatMessage = mutation({
  args: {
    chatId: v.id('chats'),
    content: v.string(),
    type: v.union(v.literal('text'), v.literal('drawing')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Get current user's profile
    const currentUserProfile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', getUserIdfromAuthIdentity(identity)))
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

    // Create the message
    const messageId = await ctx.db.insert('chat_messages', {
      chatId: args.chatId,
      senderId: currentUserProfile._id,
      content: args.content,
      type: args.type,
      timestamp,
    })

    // Update the chat's last message info
    const chat = await ctx.db.get(args.chatId)
    if (chat) {
      await ctx.db.patch(args.chatId, {
        lastMessageAt: timestamp,
        lastMessagePreview: args.content.slice(0, 100), // Preview for chat list
      })
    }

    return messageId
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
      .withIndex('by_userId', (q) => q.eq('userId', getUserIdfromAuthIdentity(identity)))
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

    // Update last read timestamp
    await ctx.db.patch(membership._id, {
      lastReadAt: Date.now(),
    })
  },
})
