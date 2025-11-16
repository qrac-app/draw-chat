import { query } from './_generated/server'
import { getUserIdfromAuthIdentity } from './auth/utils'

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      return null
    }

    const userId = getUserIdfromAuthIdentity(identity)

    // Get user profile
    const userProfile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first()

    // Return both identity and profile info
    return {
      isAuthenticated: true,
      userId: userId,
      email: identity.email || '',
      name: identity.name || '',
      profilePictureUrl: identity.pictureUrl,
      profile: userProfile,
    }
  },
})

/*
 
   from log: jh74hr1wq7qr4n74516f6grt5h7tk441|k576grngj27cp80mf748t9hqv97tjyvg
   from db:  jh74hr1wq7qr4n74516f6grt5h7tk441|k578pvjv03gtsqndv908yapv7n7tjdq3

 * */
