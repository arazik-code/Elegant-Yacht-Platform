// Media Edit Modal - Alt Text, Caption, Replace

'use client'

import { useState, useRef } from 'react'
import { X, Upload, Image as ImageIcon, Video } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { MediaItem } from './types'

interface MediaEditModalProps {
  media: MediaItem
  onSave: (alt: string, caption: string) => Promise<void>
  onReplace: (file: File) => Promise<void>
  onClose: () => void
}

export default function MediaEditModal({
  media,
  onSave,
  onReplace,
  onClose,
}: MediaEditModalProps) {
  const [alt, setAlt] = useState(media.alt || '')
  const [caption, setCaption] = useState(media.caption || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isReplacing, setIsReplacing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(alt, caption)
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsReplacing(true)
    try {
      await onReplace(file)
    } finally {
      setIsReplacing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-navy-800 rounded-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            Edit Media Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="flex gap-6">
            <div className="w-48 h-32 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
              {media.type === 'VIDEO' ? (
                <div className="w-full h-full flex items-center justify-center">
                  {media.thumbnailUrl ? (
                    <img
                      src={media.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Video className="w-8 h-8 text-white/40" />
                  )}
                </div>
              ) : (
                <img
                  src={media.url}
                  alt={media.alt || ''}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="text-sm text-white/60">
                <p>Type: {media.type}</p>
                <p className="truncate">URL: {media.url}</p>
                {media.isCover && (
                  <p className="text-gold font-medium mt-1">★ Cover Image</p>
                )}
              </div>

              {/* Replace button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={media.type === 'VIDEO' ? 'video/*' : 'image/*'}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isReplacing}
                >
                  <Upload className="w-4 h-4" />
                  {isReplacing ? 'Replacing...' : 'Replace File'}
                </Button>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Input
                label="Alt Text"
                placeholder="Describe the image for accessibility..."
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
              />
              <p className="text-xs text-white/40 mt-1">Important for SEO and accessibility</p>
            </div>

            <Textarea
              label="Caption"
              placeholder="Optional caption to display with the media..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-white/10">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
