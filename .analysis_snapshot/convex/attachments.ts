import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getUserIdfromAuthIdentity } from './auth/utils'

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    return await ctx.storage.generateUploadUrl()
  },
})

export const createAttachment = mutation({
  args: {
    storageId: v.id('_storage'),
    originalName: v.string(),
    mimeType: v.string(),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
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

    const attachmentId = await ctx.db.insert('attachments', {
      storageId: args.storageId,
      originalName: args.originalName,
      mimeType: args.mimeType,
      size: args.size,
      width: args.width,
      height: args.height,
      uploadedBy: currentUserProfile._id,
      uploadedAt: Date.now(),
    })

    return attachmentId
  },
})

export const getAttachment = query({
  args: { attachmentId: v.id('attachments') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    const attachment = await ctx.db.get(args.attachmentId)
    if (!attachment) {
      return null
    }

    // Get uploader profile
    const uploaderProfile = await ctx.db.get(attachment.uploadedBy)

    return {
      ...attachment,
      uploader: uploaderProfile,
    }
  },
})

export const getAttachmentUrl = query({
  args: { attachmentId: v.id('attachments') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Not authenticated')
    }

    const attachment = await ctx.db.get(args.attachmentId)
    if (!attachment) {
      throw new Error('Attachment not found')
    }

    return await ctx.storage.getUrl(attachment.storageId)
  },
})

export const deleteAttachment = mutation({
  args: { attachmentId: v.id('attachments') },
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

    const attachment = await ctx.db.get(args.attachmentId)
    if (!attachment) {
      throw new Error('Attachment not found')
    }

    // Check if user owns the attachment
    if (attachment.uploadedBy !== currentUserProfile._id) {
      throw new Error('Not authorized to delete this attachment')
    }

    // Delete from storage
    await ctx.storage.delete(attachment.storageId)

    // Delete from database
    await ctx.db.delete(args.attachmentId)

    return args.attachmentId
  },
})

export const getUserAttachments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return []
    }

    const currentUserProfile = await ctx.db
      .query('profiles')
      .withIndex('by_userId', (q) =>
        q.eq('userId', getUserIdfromAuthIdentity(identity)),
      )
      .first()

    if (!currentUserProfile) {
      return []
    }

    const attachments = await ctx.db
      .query('attachments')
      .withIndex('by_uploadedBy', (q) =>
        q.eq('uploadedBy', currentUserProfile._id),
      )
      .order('desc')
      .collect()

    return attachments
  },
})
