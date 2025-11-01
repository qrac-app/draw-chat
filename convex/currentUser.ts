import { query } from './_generated/server'
import { auth } from './auth'

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      return null
    }

    // Get user profile
    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
      .first()

    return userProfile
  },
})
