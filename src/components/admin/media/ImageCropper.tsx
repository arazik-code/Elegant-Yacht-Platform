// Image Cropper Component for Cover Images

'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { X, Check, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ImageCropperProps {
  image: string
  onCropComplete: (croppedBlob: Blob) => void
  onCancel: () => void
  aspectRatio?: number
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

export default function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  aspectRatio = 16 / 9
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [scale, setScale] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, aspectRatio))
  }, [aspectRatio])

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return

    setIsProcessing(true)

    try {
      const image = imgRef.current
      const canvas = previewCanvasRef.current
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('No 2d context')
      }

      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      // Set canvas size to crop size
      const cropX = completedCrop.x * scaleX
      const cropY = completedCrop.y * scaleY
      const cropWidth = completedCrop.width * scaleX
      const cropHeight = completedCrop.height * scaleY

      // Set desired output size (max 1920px wide for cover)
      const outputWidth = Math.min(cropWidth, 1920)
      const outputHeight = (outputWidth / cropWidth) * cropHeight

      canvas.width = outputWidth
      canvas.height = outputHeight

      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        outputWidth,
        outputHeight
      )

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            onCropComplete(blob)
          }
          setIsProcessing(false)
        },
        'image/jpeg',
        0.9
      )
    } catch (error) {
      console.error('Error cropping image:', error)
      setIsProcessing(false)
    }
  }

  const resetCrop = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current
      setCrop(centerAspectCrop(width, height, aspectRatio))
    }
    setScale(1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-navy-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">
            Crop Cover Image
          </h3>
          <button
            onClick={onCancel}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/50">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            className="max-h-[60vh]"
          >
            <img
              ref={imgRef}
              src={image}
              alt="Crop preview"
              onLoad={onImageLoad}
              style={{ transform: `scale(${scale})` }}
              className="max-h-[60vh] transition-transform"
            />
          </ReactCrop>
        </div>

        {/* Controls */}
        <div className="p-4 border-t border-white/10 space-y-4">
          {/* Zoom controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              className="p-2 text-white/60 hover:text-white transition-colors"
              disabled={scale <= 0.5}
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-32 accent-gold"
            />
            <button
              onClick={() => setScale(Math.min(3, scale + 0.1))}
              className="p-2 text-white/60 hover:text-white transition-colors"
              disabled={scale >= 3}
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={resetCrop}
              className="p-2 text-white/60 hover:text-white transition-colors ml-4"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCropComplete}
              disabled={isProcessing || !completedCrop}
            >
              <Check className="w-4 h-4" />
              {isProcessing ? 'Processing...' : 'Apply Crop'}
            </Button>
          </div>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={previewCanvasRef} className="hidden" />
      </div>
    </div>
  )
}
