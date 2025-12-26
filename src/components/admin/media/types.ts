// Media Management Types

export interface MediaItem {
  id: string
  url: string
  publicId?: string | null
  type: 'IMAGE' | 'VIDEO'
  isCover: boolean
  order: number
  alt?: string | null
  caption?: string | null
  thumbnailUrl?: string | null
  duration?: number | null
  // For optimistic UI - local state only
  isUploading?: boolean
  uploadProgress?: number
  file?: File
  previewUrl?: string
  error?: string
}

export interface UploadingFile {
  id: string
  file: File
  previewUrl: string
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
  type: 'IMAGE' | 'VIDEO'
}

export interface MediaManagerProps {
  yachtId: string
  media: MediaItem[]
  onChange: (media: MediaItem[]) => void
  onUpload?: (files: File[]) => Promise<void>
  maxFiles?: number
  disabled?: boolean
}

export interface CropperProps {
  image: string
  onCropComplete: (croppedImage: Blob, croppedUrl: string) => void
  onCancel: () => void
  aspectRatio?: number
}
