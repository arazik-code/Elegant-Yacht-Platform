// Sortable Media Item Component

'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Star,
  Pencil,
  Trash2,
  Video as VideoIcon,
  Play,
  Loader2,
  Move
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MediaItem as MediaItemType } from './types'

interface MediaItemProps {
  item: MediaItemType
  onEdit: () => void
  onDelete: () => void
  onSetCover: () => void
  isDeleting: boolean
  disabled: boolean
}

export default function MediaItem({
  item,
  onEdit,
  onDelete,
  onSetCover,
  isDeleting,
  disabled,
}: MediaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    active,
  } = useSortable({
    id: item.id,
    disabled,
  })

  const [isPlaying, setIsPlaying] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 100 : 'auto',
  }

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)
      const id = (match && match[2].length === 11) ? match[2] : null
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null
    }
    if (url.includes('vimeo.com')) {
      // Simple vimeo parsing
      const id = url.split('/').pop()
      return `https://player.vimeo.com/video/${id}?autoplay=1`
    }
    return null
  }

  const renderVideo = () => {
    const embedUrl = getEmbedUrl(item.url)

    if (embedUrl) {
      return (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }

    return (
      <video
        src={item.url}
        className="w-full h-full object-cover"
        controls
        autoPlay
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative aspect-video rounded-xl overflow-hidden bg-white/5',
        'border-2 transition-all',
        item.isCover ? 'border-gold' : 'border-transparent hover:border-white/20',
        isDragging && 'shadow-2xl scale-[1.02] ring-2 ring-gold/50',
        isDeleting && 'opacity-50 pointer-events-none',
        !disabled && 'cursor-grab active:cursor-grabbing'
      )}
      {...attributes}
      {...listeners}
    >
      {/* Media Preview */}
      {item.type === 'VIDEO' ? (
        <div className="relative w-full h-full bg-black">
          {isPlaying ? (
            renderVideo()
          ) : (
            <>
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt={item.alt || 'Video thumbnail'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5">
                  <VideoIcon className="w-8 h-8 text-white/40" />
                </div>
              )}
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center group/play cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center group-hover/play:bg-gold group-hover/play:text-black transition-colors">
                  <Play className="w-5 h-5 text-white ml-1 group-hover/play:text-black" />
                </div>
              </button>
              {item.duration && (
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white pointer-events-none">
                  {formatDuration(item.duration)}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <img
          src={item.url}
          alt={item.alt || 'Yacht image'}
          className="w-full h-full object-cover"
        />
      )}

      {/* Uploading Overlay */}
      {item.isUploading && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin mb-2" />
          {item.uploadProgress !== undefined && (
            <div className="w-3/4">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold transition-all"
                  style={{ width: `${item.uploadProgress}%` }}
                />
              </div>
              <p className="text-white text-xs text-center mt-1">
                {item.uploadProgress}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Cover Badge */}
      {item.isCover && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-gold text-navy-900 rounded text-xs font-medium flex items-center gap-1">
          <Star className="w-3 h-3" fill="currentColor" />
          Cover
        </div>
      )}

      {/* Drag Indicator (visual only - entire card is draggable) */}
      <div
        className={cn(
          'absolute top-2 right-2 p-1.5 rounded bg-black/60 pointer-events-none',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          disabled && 'hidden'
        )}
      >
        <GripVertical className="w-4 h-4 text-white" />
      </div>

      {/* Actions Overlay */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent',
        'opacity-0 group-hover:opacity-100 transition-opacity',
        'flex items-end justify-center pb-3 gap-2',
        disabled && 'hidden'
      )}>
        {!item.isCover && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSetCover()
            }}
            className="p-2 bg-gold text-navy-900 rounded-lg hover:bg-gold-light transition-colors"
            title="Set as cover"
          >
            <Star className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          title="Edit details"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors"
          title="Delete"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Alt Text Indicator */}
      {
        item.alt && (
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="px-2 py-1 bg-black/60 rounded text-xs text-white/80 max-w-[150px] truncate">
              {item.alt}
            </div>
          </div>
        )
      }
    </div >
  )
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
