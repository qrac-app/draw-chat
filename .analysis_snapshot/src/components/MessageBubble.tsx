import AttachmentPreview from './AttachmentPreview'
import type { Id } from '../../convex/_generated/dataModel'

interface MessageBubbleProps {
  message: {
    _id: Id<'messages'>
    content: string
    type: 'text' | 'drawing' | 'attachment'
    author: string
    timestamp: number
    attachment?: {
      _id: Id<'attachments'>
      storageId: string
      originalName: string
      mimeType: string
      size: number
      width?: number
      height?: number
      uploadedAt: number
    }
    attachmentUrl?: string
  }
  isOwn?: boolean
}

export default function MessageBubble({
  message,
  isOwn = false,
}: MessageBubbleProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const bubbleClass = isOwn
    ? 'bg-blue-500 text-white ml-auto'
    : 'bg-gray-200 text-gray-800 mr-auto'

  const containerClass = isOwn ? 'flex justify-end' : 'flex justify-start'

  return (
    <div className={`mb-4 ${containerClass}`}>
      <div
        className={`max-w-xs lg:max-w-md ${bubbleClass} rounded-lg px-4 py-2 shadow-md`}
      >
        {!isOwn && (
          <div className="font-semibold text-sm mb-1 opacity-75">
            {message.author}
          </div>
        )}

        {message.type === 'text' ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : message.type === 'drawing' ? (
          <div className="mt-1">
            <img
              src={message.content}
              alt="Drawing message"
              className="rounded border border-white/20 max-w-full h-auto"
              style={{ maxHeight: '200px' }}
            />
          </div>
        ) : (
          <div className="mt-1">
            {message.attachment && (
              <AttachmentPreview
                attachment={{
                  ...message.attachment,
                  attachmentUrl: message.attachmentUrl,
                }}
                className="max-w-full"
              />
            )}
          </div>
        )}

        <div
          className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  )
}
