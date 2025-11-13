import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, TouchEvent } from 'react'

interface DrawingCanvasProps {
  onDrawingComplete: (dataUrl: string) => void
  className?: string
  sendOnPenUp?: boolean
  onPenUp?: (dataUrl: string) => void
}

export default function DrawingCanvas({
  onDrawingComplete,
  className = '',
  sendOnPenUp = false,
  onPenUp,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(2)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Set initial drawing styles
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const startDrawing = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setHasDrawn(false) // Reset hasDrawn when starting new drawing

    const rect = canvas.getBoundingClientRect()
    let x, y

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    let x, y

    if ('touches' in e) {
      e.preventDefault()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineTo(x, y)
    ctx.stroke()

    // Mark that user has actually drawn something
    setHasDrawn(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)

    // Auto-send on pen up if enabled, callback is provided, and user actually drew something
    if (sendOnPenUp && onPenUp && hasDrawn) {
      const canvas = canvasRef.current
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png')
        onPenUp(dataUrl)
      }
    }

    // Reset hasDrawn after checking
    setHasDrawn(false)
  }

  const handleMouseLeave = () => {
    // Stop drawing but don't auto-send when mouse leaves canvas
    setIsDrawing(false)
    setHasDrawn(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false) // Reset drawing state when clearing
  }

  const getCanvasData = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    onDrawingComplete(dataUrl)
  }

  const colors = [
    '#000000',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FFFF00',
    '#FF00FF',
    '#00FFFF',
    '#FFA500',
  ]

  return (
    <div
      className={`border-2 border-gray-300 rounded-lg overflow-hidden ${className}`}
    >
      <div className="bg-gray-100 p-2 flex items-center gap-2 flex-wrap">
        <div className="flex gap-1">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded border-2 ${
                color === c ? 'border-gray-800' : 'border-gray-300'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="lineWidth" className="text-sm font-medium">
            Width:
          </label>
          <input
            id="lineWidth"
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm">{lineWidth}px</span>
        </div>

        <button
          onClick={clearCanvas}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Clear
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-64 bg-white cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={handleMouseLeave}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      <div className="bg-gray-100 p-2 flex justify-end">
        <button
          onClick={getCanvasData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Use Drawing
        </button>
      </div>
    </div>
  )
}
