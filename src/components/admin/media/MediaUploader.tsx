// Media Uploader Component - Drag & Drop with Bulk Upload

'use client'

import { useCallback, useState, type FormEvent, type KeyboardEvent, type MouseEvent } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import {
  Upload,
  Image as ImageIcon,
  Video,
  X,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UploadingFile } from './types'

interface MediaUploaderProps {
  yachtId: string
  onUploadComplete: (media: any) => void
  disabled?: boolean
  maxFiles?: number
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

const ACCEPTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/heic': ['.heic'],
}

const ACCEPTED_VIDEO_TYPES = {
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/webm': ['.webm'],
}

function getYoutubeVideoId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

export default function MediaUploader({
  yachtId,
  onUploadComplete,
  disabled = false,
  maxFiles = 50
}: MediaUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [showVideoInput, setShowVideoInput] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [addingVideo, setAddingVideo] = useState(false)

  const handleAddVideoUrl = async (e?: FormEvent | KeyboardEvent | MouseEvent) => {
    if (e) e.preventDefault()
    if (!videoUrl) return

    setAddingVideo(true)
    try {
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yachtId,
          type: 'VIDEO',
          videoUrl
        })
      })

      if (!response.ok) throw new Error('Failed to add video')

      const data = await response.json()
      onUploadComplete(data.media)
      setVideoUrl('')
      setShowVideoInput(false)
    } catch (error) {
      console.error('Error adding video:', error)
      alert('Failed to add video. Please check the URL and try again.')
    } finally {
      setAddingVideo(false)
    }
  }

  const uploadFile = async (uploadingFile: UploadingFile) => {
    const formData = new FormData()
    formData.append('file', uploadingFile.file)
    formData.append('yachtId', yachtId)
    formData.append('type', uploadingFile.type)

    try {
      // Update status to uploading
      setUploadingFiles(prev =>
        prev.map(f =>
          f.id === uploadingFile.id
            ? { ...f, status: 'uploading' as const, progress: 0 }
            : f
        )
      )

      // Use XMLHttpRequest for progress tracking
      const response = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setUploadingFiles(prev =>
              prev.map(f =>
                f.id === uploadingFile.id
                  ? { ...f, progress }
                  : f
              )
            )
          }
        })

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`))
          }
        }

        xhr.onerror = () => reject(new Error('Upload failed'))

        xhr.open('POST', '/api/admin/media')
        xhr.send(formData)
      })

      // Update status to complete
      setUploadingFiles(prev =>
        prev.map(f =>
          f.id === uploadingFile.id
            ? { ...f, status: 'complete' as const, progress: 100 }
            : f
        )
      )

      // Notify parent
      onUploadComplete(response.media)

      // Remove from list after a short delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id))
        URL.revokeObjectURL(uploadingFile.previewUrl)
      }, 1500)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadingFiles(prev =>
        prev.map(f =>
          f.id === uploadingFile.id
            ? {
              ...f,
              status: 'error' as const,
              error: error instanceof Error ? error.message : 'Upload failed'
            }
            : f
        )
      )
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      console.error('Rejected files:', rejectedFiles)
    }

    // Create uploading file objects
    const newUploadingFiles: UploadingFile[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      previewUrl: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : '',
      progress: 0,
      status: 'pending' as const,
      type: file.type.startsWith('video/') ? 'VIDEO' as const : 'IMAGE' as const,
    }))

    setUploadingFiles(prev => [...prev, ...newUploadingFiles])

    // Upload files sequentially to avoid overwhelming the server
    for (const uploadingFile of newUploadingFiles) {
      await uploadFile(uploadingFile)
    }
  }, [yachtId, onUploadComplete])

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      ...ACCEPTED_IMAGE_TYPES,
      ...ACCEPTED_VIDEO_TYPES,
    },
    maxSize: MAX_VIDEO_SIZE, // We'll validate per-file
    maxFiles,
    disabled: disabled || !yachtId,
    validator: (file) => {
      const isVideo = file.type.startsWith('video/')
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
      if (file.size > maxSize) {
        return {
          code: 'file-too-large',
          message: `File is too large. Max size is ${isVideo ? '100MB' : '10MB'}.`
        }
      }
      return null
    }
  })

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer',
          'hover:border-gold/50 hover:bg-gold/5',
          isDragActive && !isDragReject && 'border-gold bg-gold/10',
          isDragReject && 'border-red-500 bg-red-500/10',
          disabled && 'opacity-50 cursor-not-allowed',
          !yachtId && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center text-center">
          <div className={cn(
            'p-4 rounded-full mb-4',
            isDragActive ? 'bg-gold/20' : 'bg-white/5'
          )}>
            <Upload className={cn(
              'w-8 h-8',
              isDragActive ? 'text-gold' : 'text-white/40'
            )} />
          </div>

          {!yachtId ? (
            <p className="text-white/40">
              Save the yacht first to upload media
            </p>
          ) : isDragActive ? (
            <p className="text-gold font-medium">
              Drop files here...
            </p>
          ) : (
            <>
              <p className="text-white font-medium mb-1">
                Drag & drop files here, or click to select
              </p>
              <p className="text-white/40 text-sm">
                Images (JPG, PNG, WebP, HEIC) up to 10MB • Videos (MP4, MOV, WebM) up to 100MB
              </p>
            </>
          )}
        </div>
      </div>
      {/* Video URL Input */}
      {showVideoInput ? (
        <div className="flex gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddVideoUrl(e)
              }
            }}
            placeholder="Enter YouTube or Vimeo URL..."
            className="flex-1 bg-transparent border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-gold"
            autoFocus
          />
          <button
            type="submit"
            disabled={addingVideo}
            className="px-4 py-2 bg-gold text-black text-sm font-bold rounded-lg hover:bg-gold/90 disabled:opacity-50"
          >
            {addingVideo ? 'Adding...' : 'Add Video'}
          </button>
          <button
            type="button"
            onClick={() => setShowVideoInput(false)}
            className="p-2 text-white/40 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowVideoInput(true)}
          className="text-sm text-gold hover:text-gold/80 flex items-center gap-2"
        >
          <Video className="w-4 h-4" />
          Add Video from URL
        </button>
      )}

      {/* Upload Queue */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white/60">
            Uploading {uploadingFiles.length} file{uploadingFiles.length > 1 ? 's' : ''}
          </h4>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploadingFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
              >
                {/* Preview / Icon */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center">
                  {file.type === 'IMAGE' && file.previewUrl ? (
                    <img
                      src={file.previewUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : file.type === 'VIDEO' ? (
                    <Video className="w-6 h-6 text-white/40" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-white/40" />
                  )}
                </div>

                {/* File Info & Progress */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {file.file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {file.status === 'uploading' && (
                      <>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/60">{file.progress}%</span>
                      </>
                    )}
                    {file.status === 'pending' && (
                      <span className="text-xs text-white/40">Waiting...</span>
                    )}
                    {file.status === 'complete' && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Complete
                      </span>
                    )}
                    {file.status === 'error' && (
                      <span className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {file.error}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Icon / Remove */}
                <div className="flex-shrink-0">
                  {file.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 text-gold animate-spin" />
                  )}
                  {file.status === 'complete' && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  {(file.status === 'error' || file.status === 'pending') && (
                    <button
                      onClick={() => removeUploadingFile(file.id)}
                      className="p-1 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
