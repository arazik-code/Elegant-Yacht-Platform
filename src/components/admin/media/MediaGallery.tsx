// Media Gallery Component with Drag Reordering

'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import MediaItem from './MediaItem'
import MediaEditModal from './MediaEditModal'
import ImageCropper from './ImageCropper'
import type { MediaItem as MediaItemType } from './types'

interface MediaGalleryProps {
  media: MediaItemType[]
  onChange: (media: MediaItemType[]) => void
  onDelete: (mediaId: string) => Promise<void>
  onSetCover: (mediaId: string) => Promise<void>
  onUpdateMeta: (mediaId: string, alt: string, caption: string) => Promise<void>
  onReplace: (mediaId: string, file: File) => Promise<void>
  onCropCover?: (mediaId: string, croppedBlob: Blob) => Promise<void>
  disabled?: boolean
}

export default function MediaGallery({
  media,
  onChange,
  onDelete,
  onSetCover,
  onUpdateMeta,
  onReplace,
  onCropCover,
  disabled = false,
}: MediaGalleryProps) {
  const [editingMedia, setEditingMedia] = useState<MediaItemType | null>(null)
  const [croppingMedia, setCroppingMedia] = useState<MediaItemType | null>(null)
  const [showCropChoice, setShowCropChoice] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = media.findIndex((item) => item.id === active.id)
      const newIndex = media.findIndex((item) => item.id === over.id)

      const newMedia = arrayMove(media, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index,
      }))

      onChange(newMedia)
      
      // Persist order change
      fetch('/api/admin/media/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: newMedia.map((m) => ({ id: m.id, order: m.order })),
        }),
      }).catch(console.error)
    }
  }, [media, onChange])

  const handleDelete = async (mediaId: string) => {
    if (deletingId) return
    
    if (!confirm('Are you sure you want to delete this media?')) return

    setDeletingId(mediaId)
    try {
      await onDelete(mediaId)
    } finally {
      setDeletingId(null)
    }
  }

  const handleSetCover = async (mediaItem: MediaItemType) => {
    if (mediaItem.type === 'VIDEO') {
      // For videos, just set as cover directly
      await onSetCover(mediaItem.id)
    } else if (onCropCover) {
      // For images, show crop choice
      setCroppingMedia(mediaItem)
      setShowCropChoice(true)
    } else {
      // No cropping available, set directly
      await onSetCover(mediaItem.id)
    }
  }

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!croppingMedia || !onCropCover) return
    
    try {
      await onCropCover(croppingMedia.id, croppedBlob)
    } finally {
      setCroppingMedia(null)
      setShowCropChoice(false)
    }
  }

  const handleSkipCrop = async () => {
    if (!croppingMedia) return
    await onSetCover(croppingMedia.id)
    setCroppingMedia(null)
    setShowCropChoice(false)
  }

  const handleStartCrop = () => {
    setShowCropChoice(false)
  }

  const handleCancelCrop = () => {
    setCroppingMedia(null)
    setShowCropChoice(false)
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-12 text-white/40">
        <p>No media uploaded yet</p>
        <p className="text-sm mt-1">Upload images and videos above</p>
      </div>
    )
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={media.map(m => m.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {media.map((item) => (
              <MediaItem
                key={item.id}
                item={item}
                onEdit={() => setEditingMedia(item)}
                onDelete={() => handleDelete(item.id)}
                onSetCover={() => handleSetCover(item)}
                isDeleting={deletingId === item.id}
                disabled={disabled}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Edit Modal */}
      {editingMedia && (
        <MediaEditModal
          media={editingMedia}
          onSave={async (alt, caption) => {
            await onUpdateMeta(editingMedia.id, alt, caption)
            setEditingMedia(null)
          }}
          onReplace={async (file) => {
            await onReplace(editingMedia.id, file)
            setEditingMedia(null)
          }}
          onClose={() => setEditingMedia(null)}
        />
      )}

      {/* Crop Choice Modal */}
      {croppingMedia && showCropChoice && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-navy-800 rounded-2xl p-6 max-w-md text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Set as Cover Image</h3>
            <p className="text-white/60 mb-6">Would you like to crop the image for optimal display?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCancelCrop}
                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSkipCrop}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Skip Cropping
              </button>
              <button
                onClick={handleStartCrop}
                className="px-4 py-2 bg-gold text-navy-900 rounded-lg hover:bg-gold-light transition-colors"
              >
                Crop Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper */}
      {croppingMedia && !showCropChoice && (
        <ImageCropper
          image={croppingMedia.url}
          onCropComplete={handleCropComplete}
          onCancel={handleCancelCrop}
          aspectRatio={16 / 9}
        />
      )}
    </>
  )
}
