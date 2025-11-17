import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_timestamp')
      .order('asc')
      .collect()
  },
})

export const send = mutation({
  args: {
    content: v.string(),
    type: v.union(v.literal('text'), v.literal('drawing')),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now()
    return await ctx.db.insert('messages', {
      content: args.content,
      type: args.type,
      author: args.author,
      timestamp,
    })
  },
})
