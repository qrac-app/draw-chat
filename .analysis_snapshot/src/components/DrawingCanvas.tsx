import { useEffect, useRef, useState } from 'react'
import {
  Circle,
  Text as KonvaText,
  Layer,
  Line,
  Rect,
  Stage,
} from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'

interface DrawingCanvasProps {
  onDrawingComplete: (dataUrl: string) => void
  className?: string
  sendOnPenUp?: boolean
  onPenUp?: (dataUrl: string) => void
  onSendDrawing?: (dataUrl: string) => void
}

interface DrawingElement {
  id: string
  type: 'line' | 'circle' | 'rect' | 'text'
  props: any
}

type Tool = 'pen' | 'eraser' | 'circle' | 'rect' | 'text'

export default function DrawingCanvas({
  onDrawingComplete,
  className = '',
  sendOnPenUp = false,
  onPenUp,
  onSendDrawing,
}: DrawingCanvasProps) {
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasWidth, setCanvasWidth] = useState(800)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(2)
  const [tool, setTool] = useState<Tool>('pen')
  const [elements, setElements] = useState<Array<DrawingElement>>([])
  const [currentLine, setCurrentLine] = useState<{
    points: Array<number>
  } | null>(null)
  const [history, setHistory] = useState<Array<Array<DrawingElement>>>([[]])
  const [historyStep, setHistoryStep] = useState(0)
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null,
  )
  const [textInput, setTextInput] = useState('')
  const [textPosition, setTextPosition] = useState<{
    x: number
    y: number
  } | null>(null)

  useEffect(() => {
    const updateCanvasWidth = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect()
        setCanvasWidth(Math.floor(width))
      }
    }

    updateCanvasWidth()

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasWidth()
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

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

  const saveToHistory = (newElements: Array<DrawingElement>) => {
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(newElements)
    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
  }

  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1
      setHistoryStep(newStep)
      setElements(history[newStep])
    }
  }

  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1
      setHistoryStep(newStep)
      setElements(history[newStep])
    }
  }

  const getPointerPos = () => {
    const stage = stageRef.current
    if (!stage) return { x: 0, y: 0 }
    const pos = stage.getPointerPosition()
    return pos || { x: 0, y: 0 }
  }

  const handleMouseDown = (_e: KonvaEventObject<MouseEvent>) => {
    const pos = getPointerPos()
    setIsDrawing(true)
    setHasDrawn(false)

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentLine({ points: [pos.x, pos.y] })
    } else if (tool === 'circle' || tool === 'rect') {
      setStartPos(pos)
    } else {
      setTextPosition(pos)
      setTextInput('')
    }
  }

  const handleMouseMove = (_e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return

    const pos = getPointerPos()

    if (tool === 'pen' || tool === 'eraser') {
      if (currentLine) {
        const newPoints = [...currentLine.points, pos.x, pos.y]
        setCurrentLine({ points: newPoints })
        setHasDrawn(true)
      }
    }
  }

  const handleMouseUp = () => {
    if (!isDrawing) return

    const pos = getPointerPos()
    let newElement: DrawingElement | null = null

    if (tool === 'pen' && currentLine && currentLine.points.length > 2) {
      newElement = {
        id: Date.now().toString(),
        type: 'line',
        props: {
          points: currentLine.points,
          stroke: color,
          strokeWidth: lineWidth,
          lineCap: 'round',
          lineJoin: 'round',
          globalCompositeOperation: 'source-over',
        },
      }
    } else if (
      tool === 'eraser' &&
      currentLine &&
      currentLine.points.length > 2
    ) {
      newElement = {
        id: Date.now().toString(),
        type: 'line',
        props: {
          points: currentLine.points,
          stroke: '#FFFFFF',
          strokeWidth: lineWidth * 3,
          lineCap: 'round',
          lineJoin: 'round',
          globalCompositeOperation: 'destination-out',
        },
      }
    } else if (tool === 'circle' && startPos) {
      const radius = Math.sqrt(
        Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2),
      )
      newElement = {
        id: Date.now().toString(),
        type: 'circle',
        props: {
          x: startPos.x,
          y: startPos.y,
          radius,
          stroke: color,
          strokeWidth: lineWidth,
          fill: undefined,
        },
      }
      setHasDrawn(true)
    } else if (tool === 'rect' && startPos) {
      newElement = {
        id: Date.now().toString(),
        type: 'rect',
        props: {
          x: Math.min(startPos.x, pos.x),
          y: Math.min(startPos.y, pos.y),
          width: Math.abs(pos.x - startPos.x),
          height: Math.abs(pos.y - startPos.y),
          stroke: color,
          strokeWidth: lineWidth,
          fill: undefined,
        },
      }
      setHasDrawn(true)
    }

    if (newElement) {
      const newElements = [...elements, newElement]
      setElements(newElements)
      saveToHistory(newElements)
    }

    setIsDrawing(false)
    setCurrentLine(null)
    setStartPos(null)

    // Auto-send on pen up if enabled, callback is provided, and user actually drew something
    if (sendOnPenUp && onPenUp && hasDrawn) {
      setTimeout(() => {
        const dataUrl = getCanvasData()
        if (dataUrl) {
          onPenUp(dataUrl)
        }
      }, 100)
    }

    setHasDrawn(false)
  }

  const handleTextSubmit = () => {
    if (textInput.trim() && textPosition) {
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'text',
        props: {
          x: textPosition.x,
          y: textPosition.y,
          text: textInput,
          fontSize: lineWidth * 8,
          fill: color,
        },
      }
      const newElements = [...elements, newElement]
      setElements(newElements)
      saveToHistory(newElements)
      setHasDrawn(true)
    }
    setTextPosition(null)
    setTextInput('')
  }

  const clearCanvas = () => {
    setElements([])
    saveToHistory([])
    setHasDrawn(false)
  }

  const getCanvasData = () => {
    const stage = stageRef.current
    if (!stage) return null
    return stage.toDataURL({ pixelRatio: 2 })
  }

  const handleUseDrawing = () => {
    const dataUrl = getCanvasData()
    if (dataUrl) {
      if (onSendDrawing && !sendOnPenUp) {
        onSendDrawing(dataUrl)
      } else {
        onDrawingComplete(dataUrl)
      }
    }
  }

  const renderElement = (element: DrawingElement) => {
    const { type, props } = element

    switch (type) {
      case 'line':
        return <Line key={element.id} {...props} />
      case 'circle':
        return <Circle key={element.id} {...props} />
      case 'rect':
        return <Rect key={element.id} {...props} />
      case 'text':
        return <KonvaText key={element.id} {...props} />
      default:
        return null
    }
  }

  return (
    <div
      className={`border-2 border-gray-300 rounded-lg overflow-hidden w-full ${className}`}
    >
      <div className="bg-gray-100 p-2 flex items-center gap-2 flex-wrap">
        {/* Tool Selection */}
        <div className="flex gap-1">
          <button
            onClick={() => setTool('pen')}
            className={`px-2 py-1 text-xs rounded ${
              tool === 'pen' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Pen
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`px-2 py-1 text-xs rounded ${
              tool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Eraser
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`px-2 py-1 text-xs rounded ${
              tool === 'circle' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Circle
          </button>
          <button
            onClick={() => setTool('rect')}
            className={`px-2 py-1 text-xs rounded ${
              tool === 'rect' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Rect
          </button>
          <button
            onClick={() => setTool('text')}
            className={`px-2 py-1 text-xs rounded ${
              tool === 'text' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Text
          </button>
        </div>

        {/* Color Selection */}
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

        {/* Line Width */}
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

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <button
            onClick={undo}
            disabled={historyStep <= 0}
            className="px-2 py-1 text-xs rounded bg-gray-200 disabled:opacity-50"
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            className="px-2 py-1 text-xs rounded bg-gray-200 disabled:opacity-50"
          >
            Redo
          </button>
        </div>

        {/* Clear */}
        <button
          onClick={clearCanvas}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Clear
        </button>
      </div>

      {/* Canvas */}
      <div
        className="relative bg-white"
        ref={containerRef}
        style={{ touchAction: 'none' }}
      >
        <Stage
          width={canvasWidth}
          height={256}
          ref={stageRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={(e) => {
            e.evt.preventDefault()
            const touch = e.evt.touches[0]
            handleMouseDown({
              e: { ...e.evt, clientX: touch.clientX, clientY: touch.clientY },
            } as any)
          }}
          onTouchMove={(e) => {
            e.evt.preventDefault()
            const touch = e.evt.touches[0]
            handleMouseMove({
              e: { ...e.evt, clientX: touch.clientX, clientY: touch.clientY },
            } as any)
          }}
          onTouchEnd={(e) => {
            e.evt.preventDefault()
            handleMouseUp()
          }}
          className="cursor-crosshair"
        >
          <Layer>
            {elements.map(renderElement)}
            {currentLine && (
              <Line
                points={currentLine.points}
                stroke={tool === 'eraser' ? '#FFFFFF' : color}
                strokeWidth={tool === 'eraser' ? lineWidth * 3 : lineWidth}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  tool === 'eraser' ? 'destination-out' : 'source-over'
                }
              />
            )}
            {startPos && tool === 'circle' && (
              <Circle
                x={startPos.x}
                y={startPos.y}
                radius={0}
                stroke={color}
                strokeWidth={lineWidth}
              />
            )}
            {startPos && tool === 'rect' && (
              <Rect
                x={startPos.x}
                y={startPos.y}
                width={0}
                height={0}
                stroke={color}
                strokeWidth={lineWidth}
              />
            )}
          </Layer>
        </Stage>

        {/* Text Input Modal */}
        {textPosition && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTextSubmit()
                  } else if (e.key === 'Escape') {
                    setTextPosition(null)
                    setTextInput('')
                  }
                }}
                placeholder="Enter text..."
                className="px-2 py-1 border rounded mr-2"
                autoFocus
              />
              <button
                onClick={handleTextSubmit}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setTextPosition(null)
                  setTextInput('')
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 ml-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-100 p-2 flex justify-end">
        <button
          onClick={handleUseDrawing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {sendOnPenUp ? 'Use Drawing' : 'Send Drawing'}
        </button>
      </div>
    </div>
  )
}
