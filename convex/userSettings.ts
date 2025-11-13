import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const getUserSettings = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query('userSettings')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()

    // Return default settings if none exist
    return (
      settings || { defaultInputMethod: 'keyboard' as const, sendOnPenUp: true }
    )
  },
})

export const updateUserSettings = mutation({
  args: {
    userId: v.id('users'),
    defaultInputMethod: v.union(v.literal('keyboard'), v.literal('canvas')),
    sendOnPenUp: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query('userSettings')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()

    if (existingSettings) {
      return await ctx.db.patch(existingSettings._id, {
        defaultInputMethod: args.defaultInputMethod,
        sendOnPenUp: args.sendOnPenUp,
      })
    } else {
      return await ctx.db.insert('userSettings', {
        userId: args.userId,
        defaultInputMethod: args.defaultInputMethod,
        sendOnPenUp: args.sendOnPenUp,
      })
    }
  },
})
