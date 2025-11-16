export interface FileValidationResult {
  isValid: boolean
  error?: string
  fileType?: 'image' | 'document' | 'video' | 'audio'
}

export interface FileLimits {
  maxSize: number // in bytes
  allowedTypes: Array<string>
  allowedExtensions: Array<string>
}

const FILE_LIMITS: Record<string, FileLimits> = {
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  },
  document: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    allowedExtensions: ['.pdf', '.txt', '.doc', '.docx'],
  },
  video: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
    allowedExtensions: ['.mp4', '.mov', '.webm'],
  },
  audio: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    allowedExtensions: ['.mp3', '.wav', '.ogg'],
  },
}

function getFileType(
  mimeType: string,
): 'image' | 'document' | 'video' | 'audio' | null {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (FILE_LIMITS.document.allowedTypes.includes(mimeType)) return 'document'
  return null
}

function getFileExtension(filename: string): string {
  return filename.toLowerCase().slice(filename.lastIndexOf('.'))
}

export function validateFile(file: File): FileValidationResult {
  // Check if file is empty
  if (file.size === 0) {
    return { isValid: false, error: 'File is empty' }
  }

  const fileType = getFileType(file.type)
  if (!fileType) {
    return {
      isValid: false,
      error:
        'Unsupported file type. Allowed types: images, documents, videos, and audio files',
    }
  }

  const limits = FILE_LIMITS[fileType]

  // Check MIME type
  if (!limits.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Unsupported ${fileType} format: ${file.type}`,
    }
  }

  // Check file extension
  const extension = getFileExtension(file.name)
  if (!limits.allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `Unsupported file extension: ${extension}`,
    }
  }

  // Check file size
  if (file.size > limits.maxSize) {
    const maxSizeMB = Math.round(limits.maxSize / (1024 * 1024))
    return {
      isValid: false,
      error: `File too large. Maximum size for ${fileType}s is ${maxSizeMB}MB`,
    }
  }

  return { isValid: true, fileType }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}

export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/')
}

export function isDocumentFile(file: File): boolean {
  return FILE_LIMITS.document.allowedTypes.includes(file.type)
}
