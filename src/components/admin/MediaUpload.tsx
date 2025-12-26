'use client'

// Admin Media Upload Component
// Drag & drop, bulk upload, progress, reordering, cover selection

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  Upload,
  X,
  Image as ImageIcon,
  Video,
  Star,
  StarOff,
  Trash2,
  GripVertical,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Edit2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface MediaItem {
  id: string
  url: string
  publicId?: string | null
  type: 'IMAGE' | 'VIDEO'
  isCover: boolean
  order: number
  alt?: string | null
  caption?: string | null
  thumbnailUrl?: string | null
}

interface UploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  mediaId?: string
}

interface MediaUploadProps {
  yachtId: string
  media: MediaItem[]
  onMediaChange: (media: MediaItem[]) => void
  maxFiles?: number
  className?: string
}

export function MediaUpload({
  yachtId,
  media,
  onMediaChange,
  maxFiles = 50,
  className,
}: MediaUploadProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [editingMedia, setEditingMedia] = useState<string | null>(null)
  const [editAlt, setEditAlt] = useState('')
  const [editCaption, setEditCaption] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])
  
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      const maxSize = isVideo ? 500 * 1024 * 1024 : 20 * 1024 * 1024 // 500MB video, 20MB image
      return (isImage || isVideo) && file.size <= maxSize
    })
    
    if (validFiles.length === 0) return
    
    // Check max files limit
    if (media.length + validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed. You can add ${maxFiles - media.length} more.`)
      return
    }
    
    // Initialize upload progress
    const newUploads: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending',
    }))
    
    setUploads(prev => [...prev, ...newUploads])
    
    // Upload files sequentially
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      const uploadIndex = uploads.length + i
      
      try {
        // Update status to uploading
        setUploads(prev => prev.map((u, idx) => 
          idx === uploadIndex ? { ...u, status: 'uploading', progress: 10 } : u
        ))
        
        const formData = new FormData()
        formData.append('file', file)
        formData.append('yachtId', yachtId)
        formData.append('type', file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE')
        formData.append('isCover', (media.length === 0 && i === 0).toString())
        
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploads(prev => prev.map((u, idx) => 
            idx === uploadIndex && u.status === 'uploading' && u.progress < 90
              ? { ...u, progress: u.progress + 10 }
              : u
          ))
        }, 200)
        
        const response = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        })
        
        clearInterval(progressInterval)
        
        if (!response.ok) {
          throw new Error('Upload failed')
        }
        
        const { media: newMedia } = await response.json()
        
        // Update upload status
        setUploads(prev => prev.map((u, idx) => 
          idx === uploadIndex 
            ? { ...u, status: 'success', progress: 100, mediaId: newMedia.id }
            : u
        ))
        
        // Add to media list
        onMediaChange([...media, newMedia])
        
      } catch (error) {
        setUploads(prev => prev.map((u, idx) => 
          idx === uploadIndex 
            ? { ...u, status: 'error', error: 'Upload failed' }
            : u
        ))
      }
    }
    
    // Clear completed uploads after 3 seconds
    setTimeout(() => {
      setUploads(prev => prev.filter(u => u.status === 'uploading'))
    }, 3000)
  }, [yachtId, media, maxFiles, onMediaChange, uploads.length])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }, [processFiles])
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [processFiles])
  
  const handleSetCover = useCallback(async (mediaId: string) => {
    try {
      const response = await fetch('/api/admin/media/cover', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yachtId, mediaId }),
      })
      
      if (response.ok) {
        onMediaChange(media.map(m => ({
          ...m,
          isCover: m.id === mediaId,
        })))
      }
    } catch (error) {
      console.error('Error setting cover:', error)
    }
  }, [yachtId, media, onMediaChange])
  
  const handleDelete = useCallback(async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return
    
    try {
      const response = await fetch(`/api/admin/media?id=${mediaId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        const deletedMedia = media.find(m => m.id === mediaId)
        const remainingMedia = media.filter(m => m.id !== mediaId)
        
        // If deleted media was cover, set first remaining as cover
        if (deletedMedia?.isCover && remainingMedia.length > 0) {
          remainingMedia[0].isCover = true
        }
        
        onMediaChange(remainingMedia)
      }
    } catch (error) {
      console.error('Error deleting media:', error)
    }
  }, [media, onMediaChange])
  
  const handleReorder = useCallback((newOrder: MediaItem[]) => {
    const reorderedMedia = newOrder.map((item, index) => ({
      ...item,
      order: index,
    }))
    onMediaChange(reorderedMedia)
  }, [onMediaChange])
  
  const handleSaveReorder = useCallback(async () => {
    try {
      await fetch('/api/admin/media/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yachtId,
          mediaOrder: media.map((m, i) => ({ id: m.id, order: i })),
        }),
      })
      setIsReordering(false)
    } catch (error) {
      console.error('Error saving order:', error)
    }
  }, [yachtId, media])
  
  const handleEditMedia = useCallback((item: MediaItem) => {
    setEditingMedia(item.id)
    setEditAlt(item.alt || '')
    setEditCaption(item.caption || '')
  }, [])
  
  const handleSaveEdit = useCallback(async () => {
    if (!editingMedia) return
    
    try {
      await fetch('/api/admin/media/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId: editingMedia,
          alt: editAlt,
          caption: editCaption,
        }),
      })
      
      onMediaChange(media.map(m => 
        m.id === editingMedia 
          ? { ...m, alt: editAlt, caption: editCaption }
          : m
      ))
      
      setEditingMedia(null)
    } catch (error) {
      console.error('Error updating media:', error)
    }
  }, [editingMedia, editAlt, editCaption, media, onMediaChange])
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 transition-all duration-200',
          'flex flex-col items-center justify-center text-center',
          isDragging
            ? 'border-gold bg-gold/10'
            : 'border-white/20 hover:border-white/40 bg-white/5'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <Upload className={cn(
          'w-10 h-10 mb-3 transition-colors',
          isDragging ? 'text-gold' : 'text-white/50'
        )} />
        
        <p className="text-white font-medium mb-1">
          {isDragging ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-white/50 text-sm mb-3">
          or click to browse
        </p>
        <p className="text-white/30 text-xs">
          Images (JPG, PNG, WEBP) up to 20MB • Videos (MP4, MOV) up to 500MB
        </p>
      </div>
      
      {/* Upload Progress */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {uploads.map((upload, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg',
                  upload.status === 'success' && 'bg-green-500/10',
                  upload.status === 'error' && 'bg-red-500/10',
                  upload.status === 'uploading' && 'bg-white/5',
                  upload.status === 'pending' && 'bg-white/5'
                )}
              >
                {upload.status === 'uploading' && (
                  <Loader2 className="w-5 h-5 text-gold animate-spin" />
                )}
                {upload.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {upload.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                {upload.status === 'pending' && (
                  <Loader2 className="w-5 h-5 text-white/30" />
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{upload.file.name}</p>
                  {upload.status === 'uploading' && (
                    <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gold transition-all duration-200"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  )}
                  {upload.status === 'error' && (
                    <p className="text-xs text-red-500 mt-1">{upload.error}</p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Media Grid */}
      {media.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-white/70">
              Uploaded Media ({media.length})
            </h4>
            <div className="flex items-center gap-2">
              {isReordering ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsReordering(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveReorder}
                  >
                    Save Order
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsReordering(true)}
                >
                  <GripVertical className="w-4 h-4 mr-1" />
                  Reorder
                </Button>
              )}
            </div>
          </div>
          
          <Reorder.Group
            axis="x"
            values={media}
            onReorder={handleReorder}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {media.map((item) => (
              <Reorder.Item
                key={item.id}
                value={item}
                drag={isReordering ? "x" : false}
                className={cn(
                  'relative group rounded-lg overflow-hidden bg-white/5',
                  'aspect-[4/3]',
                  isReordering && 'cursor-grab active:cursor-grabbing'
                )}
              >
                {/* Media Preview */}
                {item.type === 'IMAGE' ? (
                  <Image
                    src={item.url}
                    alt={item.alt || 'Yacht image'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    {item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt="Video thumbnail"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-navy flex items-center justify-center">
                        <Video className="w-8 h-8 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Cover Badge */}
                {item.isCover && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-gold text-jet text-xs font-semibold rounded">
                    Cover
                  </div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-2 right-2 p-1.5 bg-black/50 rounded">
                  {item.type === 'VIDEO' ? (
                    <Video className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                
                {/* Hover Actions */}
                {!isReordering && (
                  <div className={cn(
                    'absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100',
                    'transition-opacity duration-200 flex items-center justify-center gap-2'
                  )}>
                    <button
                      onClick={() => handleSetCover(item.id)}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        item.isCover 
                          ? 'bg-gold text-jet'
                          : 'bg-white/20 text-white hover:bg-gold hover:text-jet'
                      )}
                      title={item.isCover ? 'Current cover' : 'Set as cover'}
                    >
                      {item.isCover ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleEditMedia(item)}
                      className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
                      title="Edit alt text & caption"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* Reorder Grip */}
                {isReordering && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <GripVertical className="w-8 h-8 text-white" />
                  </div>
                )}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
      
      {/* Empty State */}
      {media.length === 0 && uploads.length === 0 && (
        <div className="text-center py-8 text-white/40">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No media uploaded yet</p>
          <p className="text-sm">Upload images and videos for this yacht</p>
        </div>
      )}
      
      {/* Edit Modal */}
      <AnimatePresence>
        {editingMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setEditingMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-navy rounded-xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Edit Media Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Alt Text (for SEO & accessibility)
                  </label>
                  <Input
                    value={editAlt}
                    onChange={(e) => setEditAlt(e.target.value)}
                    placeholder="Describe the image..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">
                    Caption (optional)
                  </label>
                  <Input
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Add a caption..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={() => setEditingMedia(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
