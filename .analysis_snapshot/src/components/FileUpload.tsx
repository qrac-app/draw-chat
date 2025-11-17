import { useCallback, useRef, useState } from 'react'
import {
  FileText,
  Image,
  Music,
  Paperclip,
  Upload,
  Video,
  X,
} from 'lucide-react'
import {
  formatFileSize,
  isAudioFile,
  isDocumentFile,
  isImageFile,
  isVideoFile,
  validateFile,
} from '../lib/fileValidation'
import { compressImage, shouldCompressImage } from '../lib/imageCompression'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  selectedFile: File | null
  disabled?: boolean
  maxSize?: number // in bytes
}

export default function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  disabled = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (file: File) => {
    if (isImageFile(file)) return <Image size={16} />
    if (isVideoFile(file)) return <Video size={16} />
    if (isAudioFile(file)) return <Music size={16} />
    if (isDocumentFile(file)) return <FileText size={16} />
    return <Paperclip size={16} />
  }

  const processFile = async (file: File): Promise<File> => {
    // Validate file
    const validation = validateFile(file)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    // Check custom size limit
    if (file.size > maxSize) {
      throw new Error(
        `File too large. Maximum size is ${formatFileSize(maxSize)}`,
      )
    }

    // Compress images if needed
    if (isImageFile(file) && shouldCompressImage(file)) {
      try {
        const compressed = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8,
        })
        console.log(
          `Compressed image from ${formatFileSize(file.size)} to ${formatFileSize(compressed.size)}`,
        )
        return compressed
      } catch (err) {
        console.warn('Failed to compress image, using original:', err)
      }
    }

    return file
  }

  const handleFile = async (file: File) => {
    setError(null)
    setUploadProgress(0)

    try {
      setUploadProgress(25)
      const processedFile = await processFile(file)
      setUploadProgress(75)
      onFileSelect(processedFile)
      setUploadProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file')
      setUploadProgress(0)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [disabled],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) {
        setIsDragging(true)
      }
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleRemoveFile = () => {
    setError(null)
    setUploadProgress(0)
    onFileRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (selectedFile) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="text-gray-500 flex-shrink-0">
            {getFileIcon(selectedFile)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <button
          onClick={handleRemoveFile}
          disabled={disabled}
          className="p-1 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
          aria-label="Remove file"
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx"
        />

        <div className="flex flex-col items-center gap-2">
          <Upload size={24} className="text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium">Click to upload</span> or drag and
            drop
          </div>
          <div className="text-xs text-gray-500">
            Images, videos, audio, documents (max {formatFileSize(maxSize)})
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  )
}
