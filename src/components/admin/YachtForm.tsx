// Admin Yacht Form Component

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { NativeSelect } from '@/components/ui/NativeSelect'
import { MediaManager } from '@/components/admin/media'
import { yachtSchema, type YachtFormData } from '@/lib/validations'
import { yachtBrands } from '@/lib/constants'
import type { MediaItem } from '@/components/admin/media/types'

interface YachtFormProps {
  yachtId?: string
  initialData?: Partial<YachtFormData> | null
  initialMedia?: MediaItem[]
}

const yearOptions = Array.from({ length: 50 }, (_, i) => {
  const year = new Date().getFullYear() - i
  return { value: year.toString(), label: year.toString() }
})

export default function YachtForm({ yachtId, initialData, initialMedia = [] }: YachtFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savedYachtId, setSavedYachtId] = useState<string | null>(yachtId || null)
  const [highlights, setHighlights] = useState<string[]>(initialData?.highlightsEn || [])
  const [charterRoutes, setCharterRoutes] = useState<string[]>(initialData?.charterRoutes || [])
  const [media, setMedia] = useState<MediaItem[]>(initialMedia)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<YachtFormData>({
    resolver: zodResolver(yachtSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      type: initialData?.type || 'SALE',
      status: initialData?.status || 'AVAILABLE',
      featured: initialData?.featured || false,
      showPrice: initialData?.showPrice ?? true,
      priceOnRequest: initialData?.priceOnRequest || false,
      brand: initialData?.brand || '',
      model: initialData?.model || '',
      year: initialData?.year || new Date().getFullYear(),
      lengthFeet: initialData?.lengthFeet || undefined,
      cabins: initialData?.cabins || undefined,
      bathrooms: initialData?.bathrooms || undefined,
      guestCapacity: initialData?.guestCapacity || undefined,
      crewCapacity: initialData?.crewCapacity || undefined,
      engines: initialData?.engines || '',
      engineMake: initialData?.engineMake || '',
      engineModel: initialData?.engineModel || '',
      engineHours: initialData?.engineHours || '',
      engineType: initialData?.engineType || '',
      driveType: initialData?.driveType || '',
      fuelType: initialData?.fuelType || '',
      maxSpeed: initialData?.maxSpeed || undefined,
      cruiseSpeed: initialData?.cruiseSpeed || undefined,
      range: initialData?.range || undefined,
      fuelCapacity: initialData?.fuelCapacity || undefined,
      beam: initialData?.beam || undefined,
      draft: initialData?.draft || undefined,
      currency: initialData?.currency || 'AED',
      price: initialData?.price || undefined,
      descriptionEn: initialData?.descriptionEn || '',
      descriptionAr: initialData?.descriptionAr || '',
      highlightsEn: initialData?.highlightsEn || [],
      highlightsAr: initialData?.highlightsAr || [],
      charterRoutes: initialData?.charterRoutes || [],
      priority: initialData?.priority || 0,
      charterPricePerWeek: initialData?.charterPricePerWeek || undefined,
      charterPricePerSeasonWinter: initialData?.charterPricePerSeasonWinter || undefined,
      charterPricePerSeasonSummer: initialData?.charterPricePerSeasonSummer || undefined,
    },
  })

  const type = watch('type')
  const title = watch('title')

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !initialData) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setValue('slug', slug)
    }
  }, [title, setValue, initialData])

  // Sync highlights with form
  useEffect(() => {
    setValue('highlightsEn', highlights)
  }, [highlights, setValue])

  // Sync charter routes with form
  useEffect(() => {
    setValue('charterRoutes', charterRoutes)
  }, [charterRoutes, setValue])

  const addHighlight = () => {
    setHighlights([...highlights, ''])
  }

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  const updateHighlight = (index: number, value: string) => {
    const updated = [...highlights]
    updated[index] = value
    setHighlights(updated)
  }

  const addCharterRoute = () => {
    setCharterRoutes([...charterRoutes, ''])
  }

  const removeCharterRoute = (index: number) => {
    setCharterRoutes(charterRoutes.filter((_, i) => i !== index))
  }

  const updateCharterRoute = (index: number, value: string) => {
    const updated = [...charterRoutes]
    updated[index] = value
    setCharterRoutes(updated)
  }

  const onSubmit = async (data: YachtFormData) => {
    setIsSubmitting(true)

    try {
      const url = savedYachtId
        ? `/api/admin/yachts/${savedYachtId}`
        : '/api/admin/yachts'

      const response = await fetch(url, {
        method: savedYachtId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`Failed to save yacht: ${response.status} ${response.statusText}\n${errorText}`)
      }

      const result = await response.json()

      // If this was a new yacht, update the savedYachtId for media uploads
      if (!savedYachtId && result.yacht?.id) {
        setSavedYachtId(result.yacht.id)
        // Don't redirect - allow user to upload media
        return
      }

      router.push('/admin/yachts')
      router.refresh()
    } catch (error) {
      console.error('Error saving yacht:', error)
      alert('Failed to save yacht. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {yachtId ? 'Edit Yacht' : 'Add New Yacht'}
            </h1>
            <p className="text-muted-foreground">
              {yachtId ? 'Update yacht details' : 'Create a new yacht listing'}
            </p>
          </div>
        </div>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Saving...' : 'Save Yacht'}
        </Button>
      </div>

      {/* Basic Info */}
      <section className="bg-card border border-border p-6 space-y-6">
        <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Yacht Title *"
            placeholder="e.g., Azimut 80 Flybridge"
            {...register('title')}
            error={errors.title?.message}
          />
          <Input
            label="URL Slug *"
            placeholder="azimut-80-flybridge"
            {...register('slug')}
            error={errors.slug?.message}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <NativeSelect
            label="Type *"
            {...register('type')}
            error={errors.type?.message}
          >
            <option value="SALE">For Sale</option>
            <option value="CHARTER">For Charter</option>
          </NativeSelect>

          <NativeSelect
            label="Status *"
            {...register('status')}
            error={errors.status?.message}
          >
            <option value="AVAILABLE">Available</option>
            <option value="SOLD">Sold</option>
            <option value="CHARTERED">Chartered</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </NativeSelect>

          <Input
            label="Priority"
            type="number"
            placeholder="0"
            {...register('priority', { valueAsNumber: true })}
            error={errors.priority?.message}
          />
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('featured')}
              className="w-5 h-5 rounded bg-muted/50 border-input text-gold focus:ring-gold"
            />
            <span className="text-foreground">Featured Yacht</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('showPrice')}
              className="w-5 h-5 rounded bg-white/10 border-white/20 text-gold focus:ring-gold"
            />
            <span className="text-white">Show Price</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('priceOnRequest')}
              className="w-5 h-5 rounded bg-white/10 border-white/20 text-gold focus:ring-gold"
            />
            <span className="text-white">Price On Request</span>
          </label>
        </div>
      </section>

      {/* Yacht Details */}
      <section className="bg-white/5 border border-white/10 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Yacht Details</h2>

        <div className="grid md:grid-cols-4 gap-4">
          <NativeSelect
            label="Brand"
            {...register('brand')}
            error={errors.brand?.message}
          >
            <option value="">Select Brand</option>
            {yachtBrands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </NativeSelect>

          <Input
            label="Model"
            placeholder="e.g., 80 Flybridge"
            {...register('model')}
            error={errors.model?.message}
          />

          <NativeSelect
            label="Year"
            {...register('year', { valueAsNumber: true })}
            error={errors.year?.message}
          >
            {yearOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </NativeSelect>

          <Input
            label="Length (ft)"
            type="number"
            {...register('lengthFeet', { valueAsNumber: true })}
            error={errors.lengthFeet?.message}
          />
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Input
            label="Cabins"
            type="number"
            {...register('cabins', { valueAsNumber: true })}
            error={errors.cabins?.message}
          />
          <Input
            label="Bathrooms"
            type="number"
            {...register('bathrooms', { valueAsNumber: true })}
            error={errors.bathrooms?.message}
          />
          <Input
            label="Guest Capacity"
            type="number"
            {...register('guestCapacity', { valueAsNumber: true })}
            error={errors.guestCapacity?.message}
          />
          <Input
            label="Crew Capacity"
            type="number"
            {...register('crewCapacity', { valueAsNumber: true })}
            error={errors.crewCapacity?.message}
          />
        </div>

        <Input
          label="Engines Summary"
          placeholder="e.g., Twin MTU 1800 HP"
          {...register('engines')}
          error={errors.engines?.message}
        />

        <div className="grid md:grid-cols-3 gap-4">
          <Input
            label="Engine Make"
            placeholder="e.g., MTU"
            {...register('engineMake')}
            error={errors.engineMake?.message}
          />
          <Input
            label="Engine Model"
            placeholder="e.g., 16V 2000 M96L"
            {...register('engineModel')}
            error={errors.engineModel?.message}
          />
          <Input
            label="Engine Hours"
            placeholder="e.g., 1200 (Port) / 1250 (Stbd)"
            {...register('engineHours')}
            error={errors.engineHours?.message}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Input
            label="Engine Type"
            placeholder="e.g., Inboard"
            {...register('engineType')}
            error={errors.engineType?.message}
          />
          <Input
            label="Drive Type"
            placeholder="e.g., Shaft Drive"
            {...register('driveType')}
            error={errors.driveType?.message}
          />
          <Input
            label="Fuel Type"
            placeholder="e.g., Diesel"
            {...register('fuelType')}
            error={errors.fuelType?.message}
          />
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Input
            label="Max Speed (kn)"
            type="number"
            {...register('maxSpeed', { valueAsNumber: true })}
            error={errors.maxSpeed?.message}
          />
          <Input
            label="Cruise Speed (kn)"
            type="number"
            {...register('cruiseSpeed', { valueAsNumber: true })}
            error={errors.cruiseSpeed?.message}
          />
          <Input
            label="Range (nm)"
            type="number"
            {...register('range', { valueAsNumber: true })}
            error={errors.range?.message}
          />
          <Input
            label="Fuel Capacity (L)"
            type="number"
            {...register('fuelCapacity', { valueAsNumber: true })}
            error={errors.fuelCapacity?.message}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Beam (m)"
            type="number"
            step="0.01"
            {...register('beam', { valueAsNumber: true })}
            error={errors.beam?.message}
          />
          <Input
            label="Draft (m)"
            type="number"
            step="0.01"
            {...register('draft', { valueAsNumber: true })}
            error={errors.draft?.message}
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white/5 border border-white/10 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Pricing</h2>

        <div className="grid md:grid-cols-4 gap-4">
          <NativeSelect
            label="Currency"
            {...register('currency')}
          >
            <option value="AED">AED</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </NativeSelect>

          {type === 'SALE' && (
            <Input
              label="Sale Price"
              type="number"
              placeholder="0"
              {...register('price', { valueAsNumber: true })}
              error={errors.price?.message}
            />
          )}

          {type === 'CHARTER' && (
            <>
              <Input
                label="Price / Week"
                type="number"
                placeholder="0"
                {...register('charterPricePerWeek', { valueAsNumber: true })}
                error={errors.charterPricePerWeek?.message}
              />
              <Input
                label="Price / Season (Winter)"
                type="number"
                placeholder="0"
                {...register('charterPricePerSeasonWinter', { valueAsNumber: true })}
                error={errors.charterPricePerSeasonWinter?.message}
              />
              <Input
                label="Price / Season (Summer)"
                type="number"
                placeholder="0"
                {...register('charterPricePerSeasonSummer', { valueAsNumber: true })}
                error={errors.charterPricePerSeasonSummer?.message}
              />
            </>
          )}
        </div>
      </section>

      {/* Descriptions */}
      <section className="bg-white/5 border border-white/10 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Description</h2>

        <Textarea
          label="Description (English)"
          placeholder="Detailed description of the yacht..."
          rows={6}
          {...register('descriptionEn')}
          error={errors.descriptionEn?.message}
        />

        <Textarea
          label="Description (Arabic)"
          placeholder="وصف اليخت بالتفصيل..."
          rows={6}
          dir="rtl"
          {...register('descriptionAr')}
          error={errors.descriptionAr?.message}
        />
      </section>

      {/* Highlights */}
      <section className="bg-white/5 border border-white/10 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Highlights</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addHighlight}
          >
            <Plus className="w-4 h-4" />
            Add Highlight
          </Button>
        </div>

        <div className="space-y-3">
          {highlights.map((highlight, index) => (
            <div key={index} className="flex items-center gap-3">
              <Input
                placeholder={`Highlight ${index + 1}`}
                value={highlight}
                onChange={(e) => updateHighlight(index, e.target.value)}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeHighlight(index)}
                className="p-2 text-white/50 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {highlights.length === 0 && (
            <p className="text-white/40 text-sm">No highlights added yet</p>
          )}
        </div>
      </section>

      {/* Charter Routes (only for charter yachts) */}
      {type === 'CHARTER' && (
        <section className="bg-white/5 border border-white/10 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Charter Routes</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addCharterRoute}
            >
              <Plus className="w-4 h-4" />
              Add Route
            </Button>
          </div>

          <div className="space-y-3">
            {charterRoutes.map((route, index) => (
              <div key={index} className="flex items-center gap-3">
                <Input
                  placeholder={`Route ${index + 1} (e.g., Dubai Marina)`}
                  value={route}
                  onChange={(e) => updateCharterRoute(index, e.target.value)}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeCharterRoute(index)}
                  className="p-2 text-white/50 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {charterRoutes.length === 0 && (
              <p className="text-white/40 text-sm">No charter routes added yet</p>
            )}
          </div>
        </section>
      )}

      {/* Media Section */}
      <section className="bg-white/5 border border-white/10 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Media Gallery
            </h2>
            <p className="text-sm text-white/60 mt-1">
              {savedYachtId
                ? 'Upload images and videos, drag to reorder, and select a cover image.'
                : 'Save the yacht first to enable media uploads.'}
            </p>
          </div>
        </div>

        <MediaManager
          yachtId={savedYachtId}
          initialMedia={media}
          onMediaChange={setMedia}
        />
      </section>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Saving...' : 'Save Yacht'}
        </Button>
      </div>
    </form>
  )
}
