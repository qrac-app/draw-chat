import { defineSchema, defineTable } from 'convex/server'
import { authTables } from '@convex-dev/auth/server'
import { v } from 'convex/values'

export default defineSchema({
  ...authTables,
  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  // Legacy messages table - will be migrated
  messages: defineTable({
    content: v.string(),
    type: v.union(v.literal('text'), v.literal('drawing')),
    author: v.string(),
    timestamp: v.number(),
  }).index('by_timestamp', ['timestamp']),
  // New generic chat system
  chats: defineTable({
    name: v.optional(v.string()),
    type: v.union(v.literal('private'), v.literal('group')),
    createdBy: v.id('profiles'),
    createdAt: v.number(),
    lastMessageAt: v.number(),
    lastMessagePreview: v.optional(v.string()),
  })
    .index('by_createdBy', ['createdBy'])
    .index('by_lastMessageAt', ['lastMessageAt']),
  chat_members: defineTable({
    chatId: v.id('chats'),
    userId: v.id('profiles'),
    joinedAt: v.number(),
    lastReadAt: v.optional(v.number()),
  })
    .index('by_chatId', ['chatId'])
    .index('by_userId', ['userId'])
    .index('by_userId_chatId', ['userId', 'chatId']),
  chat_messages: defineTable({
    chatId: v.id('chats'),
    senderId: v.id('profiles'),
    content: v.string(),
    type: v.union(v.literal('text'), v.literal('drawing')),
    timestamp: v.number(),
  })
    .index('by_chatId_timestamp', ['chatId', 'timestamp'])
    .index('by_senderId', ['senderId']),
  profiles: defineTable({
    userId: v.string(),
    username: v.string(),
    displayName: v.string(),
    profilePicture: v.optional(v.string()),
    email: v.string(),
  })
    .index('by_userId', ['userId'])
    .index('by_username', ['username'])
    .index('by_email', ['email']),
})
