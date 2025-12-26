// Media Manager Component - Full Media Management UI

'use client'

import { useState, useCallback, useEffect } from 'react'
import { Image as ImageIcon, Video, AlertCircle } from 'lucide-react'
import MediaUploader from './MediaUploader'
import MediaGallery from './MediaGallery'
import type { MediaItem } from './types'

interface MediaManagerProps {
  yachtId: string | null
  initialMedia?: MediaItem[]
  onMediaChange?: (media: MediaItem[]) => void
}

export default function MediaManager({
  yachtId,
  initialMedia = [],
  onMediaChange,
}: MediaManagerProps) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch media when yachtId changes
  useEffect(() => {
    if (yachtId && initialMedia.length === 0) {
      fetchMedia()
    }
  }, [yachtId])

  // Sync with parent
  useEffect(() => {
    onMediaChange?.(media)
  }, [media, onMediaChange])

  const fetchMedia = async () => {
    if (!yachtId) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/media?yachtId=${yachtId}`)
      if (response.ok) {
        const data = await response.json()
        setMedia(data.media || [])
      }
    } catch (err) {
      console.error('Error fetching media:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadComplete = useCallback((newMedia: MediaItem) => {
    setMedia(prev => {
      // If this is the first image, set it as cover
      if (prev.length === 0 && newMedia.type === 'IMAGE') {
        newMedia.isCover = true
      }
      return [...prev, newMedia].sort((a, b) => a.order - b.order)
    })
  }, [])

  const handleDelete = async (mediaId: string) => {
    const response = await fetch(`/api/admin/media?id=${mediaId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete media')
    }

    // Optimistic update
    setMedia(prev => prev.filter(m => m.id !== mediaId))
  }

  const handleSetCover = async (mediaId: string) => {
    const response = await fetch('/api/admin/media/cover', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaId }),
    })

    if (!response.ok) {
      throw new Error('Failed to set cover')
    }

    // Optimistic update
    setMedia(prev => prev.map(m => ({
      ...m,
      isCover: m.id === mediaId,
    })))
  }

  const handleUpdateMeta = async (mediaId: string, alt: string, caption: string) => {
    const response = await fetch('/api/admin/media/meta', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaId, alt, caption }),
    })

    if (!response.ok) {
      throw new Error('Failed to update media')
    }

    // Optimistic update
    setMedia(prev => prev.map(m => 
      m.id === mediaId ? { ...m, alt, caption } : m
    ))
  }

  const handleReplace = async (mediaId: string, file: File) => {
    if (!yachtId) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('mediaId', mediaId)
    formData.append('yachtId', yachtId)

    const response = await fetch('/api/admin/media/replace', {
      method: 'PUT',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to replace media')
    }

    const data = await response.json()
    
    // Update with new URL
    setMedia(prev => prev.map(m => 
      m.id === mediaId ? { ...m, ...data.media } : m
    ))
  }

  const handleCropCover = async (mediaId: string, croppedBlob: Blob) => {
    if (!yachtId) return

    const formData = new FormData()
    formData.append('file', croppedBlob, 'cover.jpg')
    formData.append('mediaId', mediaId)
    formData.append('yachtId', yachtId)
    formData.append('isCover', 'true')

    const response = await fetch('/api/admin/media/replace', {
      method: 'PUT',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload cropped cover')
    }

    const data = await response.json()
    
    // Update media and set as cover
    setMedia(prev => prev.map(m => ({
      ...m,
      isCover: m.id === mediaId,
      ...(m.id === mediaId ? data.media : {}),
    })))
  }

  const handleMediaChange = (newMedia: MediaItem[]) => {
    setMedia(newMedia)
  }

  const imageCount = media.filter(m => m.type === 'IMAGE').length
  const videoCount = media.filter(m => m.type === 'VIDEO').length
  const hasCover = media.some(m => m.isCover)

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-white/60">
          <ImageIcon className="w-4 h-4" />
          <span>{imageCount} image{imageCount !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <Video className="w-4 h-4" />
          <span>{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
        </div>
        {!hasCover && media.length > 0 && (
          <div className="flex items-center gap-2 text-amber-400">
            <AlertCircle className="w-4 h-4" />
            <span>No cover image selected</span>
          </div>
        )}
      </div>

      {/* Uploader */}
      <MediaUploader
        yachtId={yachtId || ''}
        onUploadComplete={handleUploadComplete}
        disabled={!yachtId}
      />

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Gallery */}
      {isLoading ? (
        <div className="text-center py-12 text-white/40">
          Loading media...
        </div>
      ) : (
        <MediaGallery
          media={media}
          onChange={handleMediaChange}
          onDelete={handleDelete}
          onSetCover={handleSetCover}
          onUpdateMeta={handleUpdateMeta}
          onReplace={handleReplace}
          onCropCover={handleCropCover}
          disabled={!yachtId}
        />
      )}

      {/* Tips */}
      {yachtId && media.length > 0 && (
        <div className="text-xs text-white/40 space-y-1">
          <p>💡 Drag and drop to reorder media. The cover image will be shown as the main listing image.</p>
          <p>💡 Click the star icon to set a different cover image. Click the pencil to add alt text for SEO.</p>
        </div>
      )}
    </div>
  )
}
