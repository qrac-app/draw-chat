import { mutation } from './_generated/server'

// Migration script to convert existing global chat to new chat system
export const migrateGlobalChat = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if migration has already been done
    const existingGlobalChat = await ctx.db
      .query('chats')
      .filter((q) => q.eq(q.field('type'), 'group'))
      .first()

    if (existingGlobalChat) {
      return { message: 'Migration already completed' }
    }

    // Get all existing messages
    const oldMessages = await ctx.db
      .query('messages')
      .withIndex('by_timestamp')
      .collect()

    if (oldMessages.length === 0) {
      return { message: 'No messages to migrate' }
    }

    // Get all profiles to add them to the global chat
    const profiles = await ctx.db.query('profiles').collect()

    if (profiles.length === 0) {
      return { message: 'No profiles found' }
    }

    const timestamp = Date.now()

    // Create a new group chat for the global chat
    const globalChatId = await ctx.db.insert('chats', {
      name: 'Global Chat',
      type: 'group',
      createdBy: profiles[0]._id, // First user as creator
      createdAt: timestamp,
      lastMessageAt: timestamp,
      lastMessagePreview:
        oldMessages.length > 0
          ? oldMessages[oldMessages.length - 1].content
          : undefined,
    })

    // Add all users to the global chat
    for (const profile of profiles) {
      await ctx.db.insert('chat_members', {
        chatId: globalChatId,
        userId: profile._id,
        joinedAt: timestamp,
      })
    }

    // Create a mapping of author names to profile IDs
    const authorNameToProfile = new Map()
    for (const profile of profiles) {
      authorNameToProfile.set(profile.displayName, profile._id)
    }

    // Migrate messages
    let migratedCount = 0
    for (const oldMessage of oldMessages) {
      const senderProfile = authorNameToProfile.get(oldMessage.author)
      if (senderProfile) {
        await ctx.db.insert('chat_messages', {
          chatId: globalChatId,
          senderId: senderProfile,
          content: oldMessage.content,
          type: oldMessage.type,
          timestamp: oldMessage.timestamp,
        })
        migratedCount++
      }
    }

    return {
      message: 'Migration completed successfully',
      migratedMessages: migratedCount,
      totalMessages: oldMessages.length,
      chatId: globalChatId,
    }
  },
})
