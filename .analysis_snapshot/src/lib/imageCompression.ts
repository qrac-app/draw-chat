export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0.1 to 1.0
  format?: 'jpeg' | 'png' | 'webp'
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  format: 'jpeg',
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {},
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      const { width, height } = calculateDimensions(
        img.width,
        img.height,
        opts.maxWidth!,
        opts.maxHeight!,
      )

      canvas.width = width
      canvas.height = height

      // Draw and compress image
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'))
            return
          }

          const compressedFile = new File([blob], file.name, {
            type: `image/${opts.format}`,
            lastModified: Date.now(),
          })

          resolve(compressedFile)
        },
        `image/${opts.format}`,
        opts.quality,
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  let { width, height } = { width: originalWidth, height: originalHeight }

  // If image is already within bounds, return original dimensions
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height }
  }

  // Calculate aspect ratio
  const aspectRatio = width / height

  // Resize based on the limiting dimension
  if (width > maxWidth) {
    width = maxWidth
    height = width / aspectRatio
  }

  if (height > maxHeight) {
    height = maxHeight
    width = height * aspectRatio
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  }
}

export async function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

export function shouldCompressImage(file: File): boolean {
  // Don't compress very small images or already compressed formats
  const isSmall = file.size < 100 * 1024 // 100KB
  const isAlreadyCompressed =
    file.type === 'image/jpeg' || file.type === 'image/webp'

  return !isSmall || !isAlreadyCompressed
}
