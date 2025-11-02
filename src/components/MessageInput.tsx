import { useState } from 'react'
import { Edit, Send, Type } from 'lucide-react'
import DrawingCanvas from './DrawingCanvas'

interface MessageInputProps {
  onSendMessage: (content: string, type: 'text' | 'drawing') => void
  disabled?: boolean
  defaultInputMethod?: 'keyboard' | 'canvas'
}

export default function MessageInput({
  onSendMessage,
  disabled = false,
  defaultInputMethod = 'keyboard',
}: MessageInputProps) {
  const [inputMode, setInputMode] = useState<'text' | 'drawing'>(
    defaultInputMethod === 'canvas' ? 'drawing' : 'text',
  )
  const [textMessage, setTextMessage] = useState('')
  const [drawingData, setDrawingData] = useState<string | null>(null)
  const [userExplicitlyChoseText, setUserExplicitlyChoseText] = useState(false)

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

  const handleDrawingComplete = (dataUrl: string) => {
    setDrawingData(dataUrl)
    setInputMode('text')
  }

  const handleSendDrawing = () => {
    if (drawingData) {
      onSendMessage(drawingData, 'drawing')
      setDrawingData(null)
    }
  }

  const switchToDrawingMode = () => {
    setInputMode('drawing')
    setDrawingData(null)
    setUserExplicitlyChoseText(false)
  }

  const switchToTextMode = () => {
    setInputMode('text')
    setUserExplicitlyChoseText(true)
  }

  if (inputMode === 'drawing') {
    return (
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Draw a message</h3>
          <button
            onClick={switchToTextMode}
            className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800"
          >
            <Type size={16} />
            Switch to text
          </button>
        </div>
        <DrawingCanvas onDrawingComplete={handleDrawingComplete} />
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
                onClick={handleSendDrawing}
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

      <form onSubmit={handleTextSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
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
