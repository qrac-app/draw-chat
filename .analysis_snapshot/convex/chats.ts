import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getUserIdfromAuthIdentity } from './auth/utils'

export const createChat = mutation({
  args: {
    name: v.optional(v.string()),
    type: v.union(v.literal('private'), v.literal('group')),
    memberIds: v.array(v.id('profiles')),
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

    const timestamp = Date.now()

    // Create the chat
    const chatId = await ctx.db.insert('chats', {
      name: args.name,
      type: args.type,
      createdBy: currentUserProfile._id,
      createdAt: timestamp,
      lastMessageAt: timestamp,
    })

    // Add all members to the chat
    for (const memberId of args.memberIds) {
      await ctx.db.insert('chat_members', {
        chatId,
        userId: memberId,
        joinedAt: timestamp,
      })
    }

    return chatId
  },
})

export const getPrivateChatWithUser = query({
  args: {
    otherUsername: v.string(),
  },
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

    // Find the other user's profile
    const otherUserProfile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', args.otherUsername))
      .first()

    if (!otherUserProfile) {
      return null
    }

    // Check if private chat already exists between these users
    const userChats = await ctx.db
      .query('chat_members')
      .withIndex('by_userId', (q) => q.eq('userId', currentUserProfile._id))
      .collect()

    for (const membership of userChats) {
      const chat = await ctx.db.get(membership.chatId)
      if (chat && chat.type === 'private') {
        // Check if this private chat includes the other user
        const otherMembership = await ctx.db
          .query('chat_members')
          .withIndex('by_chatId', (q) => q.eq('chatId', chat._id))
          .filter((q) => q.eq(q.field('userId'), otherUserProfile._id))
          .first()

        if (otherMembership) {
          return chat._id // Private chat already exists
        }
      }
    }

    return null // No private chat found
  },
})

export const createPrivateChat = mutation({
  args: {
    otherUsername: v.string(),
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

    // Find the other user's profile
    const otherUserProfile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', args.otherUsername))
      .first()

    if (!otherUserProfile) {
      throw new Error('User not found')
    }

    // Create new private chat
    const timestamp = Date.now()
    const chatId = await ctx.db.insert('chats', {
      type: 'private',
      createdBy: currentUserProfile._id,
      createdAt: timestamp,
      lastMessageAt: timestamp,
    })

    // Add both users to the chat
    await ctx.db.insert('chat_members', {
      chatId,
      userId: currentUserProfile._id,
      joinedAt: timestamp,
    })

    await ctx.db.insert('chat_members', {
      chatId,
      userId: otherUserProfile._id,
      joinedAt: timestamp,
    })

    return chatId
  },
})

export const getOrCreatePrivateChat = mutation({
  args: {
    otherUsername: v.string(),
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

    // Find the other user's profile
    const otherUserProfile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', args.otherUsername))
      .first()

    if (!otherUserProfile) {
      throw new Error('User not found')
    }

    // Check if private chat already exists between these users
    const userChats = await ctx.db
      .query('chat_members')
      .withIndex('by_userId', (q) => q.eq('userId', currentUserProfile._id))
      .collect()

    for (const membership of userChats) {
      const chat = await ctx.db.get(membership.chatId)
      if (chat && chat.type === 'private') {
        // Check if this private chat includes the other user
        const otherMembership = await ctx.db
          .query('chat_members')
          .withIndex('by_chatId', (q) => q.eq('chatId', chat._id))
          .filter((q) => q.eq(q.field('userId'), otherUserProfile._id))
          .first()

        if (otherMembership) {
          return chat._id // Private chat already exists
        }
      }
    }

    // Create new private chat
    const timestamp = Date.now()
    const chatId = await ctx.db.insert('chats', {
      type: 'private',
      createdBy: currentUserProfile._id,
      createdAt: timestamp,
      lastMessageAt: timestamp,
    })

    // Add both users to the chat
    await ctx.db.insert('chat_members', {
      chatId,
      userId: currentUserProfile._id,
      joinedAt: timestamp,
    })

    await ctx.db.insert('chat_members', {
      chatId,
      userId: otherUserProfile._id,
      joinedAt: timestamp,
    })

    return chatId
  },
})

export const getUserChats = query({
  args: {},
  handler: async (ctx) => {
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

    // Get all chat memberships for the user
    const memberships = await ctx.db
      .query('chat_members')
      .withIndex('by_userId', (q) => q.eq('userId', currentUserProfile._id))
      .collect()

    // Get chat details and other members for each chat
    const chats = []
    for (const membership of memberships) {
      const chat = await ctx.db.get(membership.chatId)
      if (!chat) continue

      // Get all members of this chat
      const members = await ctx.db
        .query('chat_members')
        .withIndex('by_chatId', (q) => q.eq('chatId', chat._id))
        .collect()

      const memberProfiles = []
      for (const member of members) {
        const profile = await ctx.db.get(member.userId)
        if (profile) {
          memberProfiles.push({
            ...profile,
            joinedAt: member.joinedAt,
            lastReadAt: member.lastReadAt,
          })
        }
      }

      chats.push({
        ...chat,
        members: memberProfiles,
        lastReadAt: membership.lastReadAt,
      })
    }

    // Sort by last message time
    return chats.sort((a, b) => b.lastMessageAt - a.lastMessageAt)
  },
})

export const getChatById = query({
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

    // Get the chat
    const chat = await ctx.db.get(args.chatId)
    if (!chat) {
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
      return null // User is not a member of this chat
    }

    // Get all members
    const members = await ctx.db
      .query('chat_members')
      .withIndex('by_chatId', (q) => q.eq('chatId', args.chatId))
      .collect()

    const memberProfiles = []
    for (const member of members) {
      const profile = await ctx.db.get(member.userId)
      if (profile) {
        memberProfiles.push({
          ...profile,
          joinedAt: member.joinedAt,
          lastReadAt: member.lastReadAt,
        })
      }
    }

    return {
      ...chat,
      members: memberProfiles,
      lastReadAt: membership.lastReadAt,
    }
  },
})
