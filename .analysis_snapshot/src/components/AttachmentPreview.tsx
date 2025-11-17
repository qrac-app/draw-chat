import { useState } from 'react'
import { Download, Eye, FileText, Image, Music, Video, X } from 'lucide-react'
import {
  formatFileSize,
  isAudioFile,
  isImageFile,
  isVideoFile,
} from '../lib/fileValidation'

interface Attachment {
  _id: string
  storageId: string
  originalName: string
  mimeType: string
  size: number
  width?: number
  height?: number
  uploadedAt: number
  attachmentUrl?: string
}

interface AttachmentPreviewProps {
  attachment: Attachment
  onRemove?: () => void
  showRemoveButton?: boolean
  className?: string
}

export default function AttachmentPreview({
  attachment,
  onRemove,
  showRemoveButton = false,
  className = '',
}: AttachmentPreviewProps) {
  const [imageError, setImageError] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image size={20} />
    if (mimeType.startsWith('video/')) return <Video size={20} />
    if (mimeType.startsWith('audio/')) return <Music size={20} />
    return <FileText size={20} />
  }

  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'Image'
    if (mimeType.startsWith('video/')) return 'Video'
    if (mimeType.startsWith('audio/')) return 'Audio'
    if (mimeType.includes('pdf')) return 'PDF'
    if (mimeType.includes('document')) return 'Document'
    if (mimeType.includes('text')) return 'Text'
    return 'File'
  }

  const handleDownload = () => {
    if (attachment.attachmentUrl) {
      const link = document.createElement('a')
      link.href = attachment.attachmentUrl
      link.download = attachment.originalName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const renderPreviewContent = () => {
    if (!attachment.attachmentUrl) {
      return (
        <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              {getFileIcon(attachment.mimeType)}
            </div>
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      )
    }

    // Image preview
    if (isImageFile({ type: attachment.mimeType } as File) && !imageError) {
      return (
        <div className="relative group">
          <img
            src={attachment.attachmentUrl}
            alt={attachment.originalName}
            className="max-w-full h-auto rounded-lg cursor-pointer"
            onClick={() => setShowPreview(true)}
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Eye size={24} className="text-white" />
          </div>
        </div>
      )
    }

    // Video preview
    if (isVideoFile({ type: attachment.mimeType } as File)) {
      return (
        <video
          src={attachment.attachmentUrl}
          controls
          className="max-w-full h-auto rounded-lg"
        />
      )
    }

    // Audio preview
    if (isAudioFile({ type: attachment.mimeType } as File)) {
      return (
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <Music size={24} className="text-gray-600" />
          <audio src={attachment.attachmentUrl} controls className="flex-1" />
        </div>
      )
    }

    // Document preview
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <FileText size={24} className="text-gray-600" />
        <div className="flex-1">
          <p className="font-medium text-gray-900 truncate">
            {attachment.originalName}
          </p>
          <p className="text-sm text-gray-500">
            {getFileTypeLabel(attachment.mimeType)} •{' '}
            {formatFileSize(attachment.size)}
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          aria-label="Download file"
        >
          <Download size={20} />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className={`relative ${className}`}>
        {renderPreviewContent()}

        {showRemoveButton && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            aria-label="Remove attachment"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Full screen image preview modal */}
      {showPreview && isImageFile({ type: attachment.mimeType } as File) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={attachment.attachmentUrl}
              alt={attachment.originalName}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close preview"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
