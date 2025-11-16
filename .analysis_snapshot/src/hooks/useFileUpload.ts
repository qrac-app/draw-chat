import { useState } from 'react'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { getImageDimensions } from '../lib/imageCompression'

import type { Id } from '../../convex/_generated/dataModel'

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<Id<'attachments'> | null>
  isUploading: boolean
  error: string | null
}

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateUploadUrl = useConvexMutation(api.attachments.generateUploadUrl)
  const createAttachment = useConvexMutation(api.attachments.createAttachment)

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsUploading(true)
    setError(null)

    try {
      // Step 1: Get upload URL
      const uploadUrl = await generateUploadUrl()

      // Step 2: Upload file to storage
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!response.ok) {
        throw new Error('Failed to upload file')
      }

      const { storageId } = await response.json()

      // Step 3: Get image dimensions if it's an image
      let width: number | undefined
      let height: number | undefined

      if (file.type.startsWith('image/')) {
        try {
          const dimensions = await getImageDimensions(file)
          width = dimensions.width
          height = dimensions.height
        } catch (err) {
          console.warn('Failed to get image dimensions:', err)
        }
      }

      // Step 4: Create attachment record
      const attachmentId = await createAttachment({
        storageId,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        width,
        height,
      })

      return attachmentId
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to upload file'
      setError(errorMessage)
      console.error('File upload error:', err)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return {
    uploadFile,
    isUploading,
    error,
  }
}
