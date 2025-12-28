// Admin Edit Yacht Page

import { notFound } from 'next/navigation'
import YachtForm from '@/components/admin/YachtForm'
import prisma from '@/lib/db'
import type { YachtMedia } from '@/lib/types'
import type { MediaItem } from '@/components/admin/media/types'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getYacht(id: string) {
  try {
    const yacht = await prisma.yacht.findUnique({
      where: { id },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!yacht) return null

    // Transform media to MediaItem format
    const media: MediaItem[] = yacht.media.map((m: YachtMedia) => ({
      id: m.id,
      url: m.url,
      publicId: m.publicId || null,
      type: m.type,
      isCover: m.isCover,
      order: m.order,
      alt: (m as any).alt || null,
      caption: (m as any).caption || null,
      thumbnailUrl: (m as any).thumbnailUrl || null,
      duration: (m as any).duration || null,
    }))

    // Transform to form data format matching yachtSchema
    const formData = {
      title: yacht.title,
      slug: yacht.slug,
      type: yacht.type,
      status: yacht.status,
      featured: yacht.featured,
      showPrice: yacht.showPrice,
      priceOnRequest: yacht.priceOnRequest,
      brand: yacht.brand || '',
      model: yacht.model || '',
      year: yacht.year || new Date().getFullYear(),
      lengthFeet: yacht.lengthFeet || 0,
      cabins: yacht.cabins || 0,
      bathrooms: yacht.bathrooms || 0,
      guestCapacity: yacht.guestCapacity || 0,
      crewCapacity: yacht.crewCapacity || 0,
      engines: yacht.engines || '',
      engineMake: yacht.engineMake || '',
      engineModel: yacht.engineModel || '',
      engineHours: yacht.engineHours || '',
      engineType: yacht.engineType || '',
      driveType: yacht.driveType || '',
      fuelType: yacht.fuelType || '',
      beam: yacht.beam || 0,
      draft: yacht.draft || 0,
      fuelCapacity: yacht.fuelCapacity || 0,
      maxSpeed: yacht.maxSpeed || 0,
      cruiseSpeed: yacht.cruiseSpeed || 0,
      range: yacht.range || 0,
      currency: yacht.currency,
      price: yacht.price ? Number(yacht.price) : 0,
      highlightsEn: yacht.highlightsEn || [],
      highlightsAr: yacht.highlightsAr || [],
      charterRoutes: yacht.charterRoutes || [],
      priority: yacht.priority,
    }

    return { formData, media }
  } catch (error) {
    console.error('Error fetching yacht:', error)
    return null
  }
}

export default async function EditYachtPage({ params }: PageProps) {
  const resolvedParams = await params
  const yacht = await getYacht(resolvedParams.id)

  if (!yacht) {
    notFound()
  }

  return (
    <YachtForm
      yachtId={resolvedParams.id}
      initialData={yacht.formData}
      initialMedia={yacht.media}
    />
  )
}
