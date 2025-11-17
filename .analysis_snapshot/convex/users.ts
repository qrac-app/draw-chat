import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const getUserProfile = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()
    return user
  },
})

export const getUserProfileByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first()
    return user
  },
})

export const createOrUpdateProfile = mutation({
  args: {
    userId: v.id('users'),
    username: v.string(),
    displayName: v.string(),
    profilePicture: v.optional(v.string()),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first()

    if (existingUser) {
      return await ctx.db.patch(existingUser._id, {
        username: args.username,
        displayName: args.displayName,
        profilePicture: args.profilePicture,
      })
    } else {
      return await ctx.db.insert('profiles', {
        userId: args.userId,
        username: args.username,
        displayName: args.displayName,
        profilePicture: args.profilePicture,
        email: args.email,
      })
    }
  },
})

export const isUsernameAvailable = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first()
    return !user
  },
})
