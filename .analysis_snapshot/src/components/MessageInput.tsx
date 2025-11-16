import { useEffect, useRef, useState } from 'react'
import { Edit, Paperclip, Send, Type } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Switch } from './ui/switch'
import DrawingCanvas from './DrawingCanvas'
import FileUpload from './FileUpload'
import type { Id } from '../../convex/_generated/dataModel'

interface MessageInputProps {
  onSendMessage: (
    content: string,
    type: 'text' | 'drawing' | 'attachment',
    attachmentId?: Id<'attachments'>,
  ) => void
  onFileUpload?: (file: File) => Promise<Id<'attachments'> | null>
  disabled?: boolean
  defaultInputMethod?: 'keyboard' | 'canvas'
  userId?: string
}

export default function MessageInput({
  onSendMessage,
  onFileUpload,
  disabled = false,
  defaultInputMethod = 'keyboard',
  userId,
}: MessageInputProps) {
  const [inputMode, setInputMode] = useState<'text' | 'drawing'>(
    defaultInputMethod === 'canvas' ? 'drawing' : 'text',
  )
  const [textMessage, setTextMessage] = useState('')
  const [drawingData, setDrawingData] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [userExplicitlyChoseText, setUserExplicitlyChoseText] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [tempSendOnPenUp, setTempSendOnPenUp] = useState<boolean | null>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    if (inputMode === 'text') {
      textInputRef.current?.focus()
    }
  }, [])

  // Get user settings for sendOnPenUp
  const userSettings = useQuery(
    api.userSettings.getUserSettings,
    userId ? { userId: userId as Id<'users'> } : 'skip',
  )
  const effectiveSendOnPenUp =
    tempSendOnPenUp ?? userSettings?.sendOnPenUp ?? true

  // Auto-switch to canvas mode when input is focused and default is canvas
  // Only auto-switch if user hasn't explicitly chosen text mode
  const handleInputFocus = () => {
    if (
      defaultInputMethod === 'canvas' &&
      inputMode === 'text' &&
      !userExplicitlyChoseText
    ) {
      setInputMode('drawing')
    }
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (textMessage.trim()) {
      onSendMessage(textMessage.trim(), 'text')
      setTextMessage('')
      // Reset explicit text choice after sending a message
      setUserExplicitlyChoseText(false)
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
  }

  const handleSendAttachment = async () => {
    if (!selectedFile || !onFileUpload) return

    setIsUploading(true)
    try {
      const attachmentId = await onFileUpload(selectedFile)
      if (attachmentId) {
        onSendMessage(selectedFile.name, 'attachment', attachmentId)
        setSelectedFile(null)
        setShowFileUpload(false)
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrawingComplete = (dataUrl: string) => {
    setDrawingData(dataUrl)
    setInputMode('text')
    // Reset temporary sendOnPenUp state after drawing is complete
    setTempSendOnPenUp(null)
  }

  const handleAutoSendDrawing = (dataUrl: string) => {
    // Optimistic update: immediately close canvas and reset state
    setTempSendOnPenUp(null)
    setInputMode('text')
    setDrawingData(null)

    // Send the drawing (fire and forget for optimistic update)
    onSendMessage(dataUrl, 'drawing')
  }

  const handleSendDrawing = (dataUrl?: string) => {
    const drawingToSend = dataUrl || drawingData
    if (drawingToSend) {
      onSendMessage(drawingToSend, 'drawing')
      setDrawingData(null)
      setInputMode('text')
    }
  }

  const switchToDrawingMode = () => {
    setInputMode('drawing')
    setDrawingData(null)
    setUserExplicitlyChoseText(false)
    // Reset temporary state when entering drawing mode
    setTempSendOnPenUp(null)
  }

  const switchToTextMode = () => {
    setInputMode('text')
    setUserExplicitlyChoseText(true)
    // Auto-focus the text input when switching to text mode
    setTimeout(() => {
      textInputRef.current?.focus()
    }, 0)
  }

  const toggleFileUpload = () => {
    setShowFileUpload(!showFileUpload)
  }

  const toggleSendOnPenUp = () => {
    setTempSendOnPenUp(!effectiveSendOnPenUp)
  }

  if (inputMode === 'drawing') {
    return (
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Draw a message</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={effectiveSendOnPenUp}
                onCheckedChange={toggleSendOnPenUp}
                title={
                  effectiveSendOnPenUp
                    ? 'Send on pen up is ON'
                    : 'Send on pen up is OFF'
                }
              />
              <span className="text-sm text-gray-600">
                {effectiveSendOnPenUp ? 'Auto-send ON' : 'Auto-send OFF'}
              </span>
            </div>
            <button
              onClick={switchToTextMode}
              className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              <Type size={16} />
              Switch to text
            </button>
          </div>
        </div>
        <DrawingCanvas
          onDrawingComplete={handleDrawingComplete}
          sendOnPenUp={effectiveSendOnPenUp}
          onPenUp={effectiveSendOnPenUp ? handleAutoSendDrawing : undefined}
          onSendDrawing={!effectiveSendOnPenUp ? handleSendDrawing : undefined}
        />
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 p-4">
      {drawingData && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Drawing ready to send</span>
            <div className="flex gap-2">
              <button
                onClick={() => setDrawingData(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendDrawing()}
                disabled={disabled}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Send Drawing
              </button>
            </div>
          </div>
          <img
            src={drawingData}
            alt="Drawing preview"
            className="mt-2 max-h-20 rounded border border-gray-300"
          />
        </div>
      )}

      {selectedFile && (
        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">File ready to send</span>
            <div className="flex gap-2">
              <button
                onClick={handleFileRemove}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSendAttachment}
                disabled={disabled || isUploading}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Send File'}
              </button>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-700 truncate">
            {selectedFile.name}
          </div>
        </div>
      )}

      {showFileUpload && (
        <div className="mb-3">
          <FileUpload
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            selectedFile={null}
            disabled={disabled}
          />
        </div>
      )}

      <form onSubmit={handleTextSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            ref={textInputRef}
            type="text"
            value={textMessage}
            onChange={(e) => setTextMessage(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="Type a message..."
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <button
          type="button"
          onClick={toggleFileUpload}
          disabled={disabled}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Attach file"
        >
          <Paperclip size={20} />
        </button>

        <button
          type="button"
          onClick={switchToDrawingMode}
          disabled={disabled}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Switch to drawing mode"
        >
          <Edit size={20} />
        </button>

        <button
          type="submit"
          disabled={disabled || !textMessage.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}
