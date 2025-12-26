// Yacht Detail Page

import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import prisma from '@/lib/db'
import { YachtGallery } from '@/components/yacht/YachtGallery'
import { YachtSpecs } from '@/components/yacht/YachtSpecs'
import { YachtDescription } from '@/components/yacht/YachtDescription'
import { YachtInquiry } from '@/components/yacht/YachtInquiry'
import { RelatedYachts } from '@/components/yacht/RelatedYachts'
import { siteConfig } from '@/lib/constants'

// Revalidate every 5 minutes for fresh data
export const revalidate = 300

interface YachtPageProps {
  params: Promise<{ slug: string }>
}

async function getYacht(slug: string) {
  // Check for mock slugs first
  if (slug === 'majesty-100-mock') {
    return {
      id: 'mock-1',
      title: 'Majesty 100 (Mock)',
      slug: 'majesty-100-mock',
      type: 'SALE',
      price: 5500000,
      priceOnRequest: false,
      currency: 'USD',
      lengthFeet: 100,
      brand: 'Majesty',
      model: '100',
      year: 2024,
      cabins: 5,
      guestCapacity: 12,
      crewCapacity: 4,
      bathrooms: 6,
      descriptionEn: 'This is a mock listing for demonstration purposes while the database connection is being established. The Majesty 100 is a masterpiece of design and engineering.',
      descriptionAr: 'هذا عرض تجريبي لأغراض التوضيح بينما يتم إنشاء اتصال قاعدة البيانات. ماجستي 100 هي تحفة في التصميم والهندسة.',
      highlightsEn: ['Panoramic Sky Lounge', 'Folding Balconies', 'Floor-to-ceiling Windows'],
      highlightsAr: ['صالة بانورامية', 'شرفات قابلة للطي', 'نوافذ من الأرض إلى السقف'],
      amenitiesEn: ['Jacuzzi', 'Beach Club', 'Stabilizers'],
      amenitiesAr: ['جاكوزي', 'نادي شاطئي', 'مثبتات توازن'],
      featured: true,
      showPrice: true,
      status: 'AVAILABLE',
      lengthMeters: 31.7,
      beam: 7.1,
      draft: 1.6,
      builder: 'Gulf Craft',
      engines: '2x MAN V12 1900 HP',
      engineMake: 'MAN',
      engineModel: 'V12 1900',
      engineHours: '450',
      engineType: 'Inboard',
      driveType: 'Shaft Drive',
      fuelType: 'Diesel',
      maxSpeed: 23,
      cruiseSpeed: 17,
      fuelCapacity: 15000,
      range: 1500,
      charterRoutes: ['Dubai Marina', 'Palm Jumeirah', 'World Islands'],
      charterPricePerWeek: 280000,
      charterPricePerSeasonWinter: 1000000,
      charterPricePerSeasonSummer: 800000,
      media: [{ id: 'm1', url: 'https://res.cloudinary.com/demo/image/upload/v1652345767/docs/demo_image2.jpg', type: 'IMAGE', isCover: true, order: 0 }]
    } as any
  }

  if (slug === 'azimut-grande-mock') {
    return {
      id: 'mock-2',
      title: 'Azimut Grande (Mock)',
      slug: 'azimut-grande-mock',
      type: 'SALE',
      price: 4200000,
      priceOnRequest: false,
      currency: 'USD',
      lengthFeet: 88,
      brand: 'Azimut',
      model: 'Grande',
      year: 2023,
      cabins: 4,
      guestCapacity: 10,
      crewCapacity: 3,
      bathrooms: 5,
      descriptionEn: 'This is a mock listing for demonstration purposes. The Azimut Grande represents the pinnacle of Italian luxury yachting.',
      descriptionAr: 'هذا عرض تجريبي لأغراض التوضيح. أزيموت جراند تمثل قمة اليخوت الإيطالية الفاخرة.',
      highlightsEn: ['Carbon Fiber Construction', 'Raised Pilot House', 'Spacious Flybridge'],
      highlightsAr: ['بناء من ألياف الكربون', 'غرفة قيادة مرتفعة', 'جسر علوي واسع'],
      amenitiesEn: ['Zero Speed Stabilizers', 'Hydraulic Platform', 'BBQ'],
      amenitiesAr: ['مثبتات سرعة صفرية', 'منصة هيدروليكية', 'شواية'],
      featured: true,
      showPrice: true,
      status: 'AVAILABLE',
      lengthMeters: 26.78,
      beam: 6.9,
      draft: 1.85,
      builder: 'Azimut Yachts',
      engines: '2x MTU 2000 M86',
      engineMake: 'MTU',
      engineModel: '2000 M86',
      engineHours: '850',
      engineType: 'Inboard',
      driveType: 'Shaft Drive',
      fuelType: 'Diesel',
      maxSpeed: 28,
      cruiseSpeed: 24,
      fuelCapacity: 9000,
      range: 800,
      charterRoutes: ['Dubai Coastline'],
      charterPricePerWeek: 220000,
      charterPricePerSeasonWinter: 850000,
      charterPricePerSeasonSummer: 650000,
      media: [{ id: 'm2', url: 'https://res.cloudinary.com/demo/image/upload/v1652366602/docs/demo_image5.jpg', type: 'IMAGE', isCover: true, order: 0 }]
    } as any
  }

  try {
    const yacht = await prisma.yacht.findUnique({
      where: { slug },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
      },
    })
    return yacht
  } catch (error) {
    console.warn('Error fetching yacht (likely network restriction):', error)
    return null
  }
}

export async function generateMetadata({ params }: YachtPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const yacht = await getYacht(resolvedParams.slug)

  if (!yacht) {
    return {
      title: 'Yacht Not Found',
    }
  }

  const coverImage = yacht.media.find((m: { isCover: boolean }) => m.isCover)?.url || yacht.media[0]?.url

  return {
    title: `${yacht.title} | ${yacht.type === 'SALE' ? 'For Sale' : 'For Charter'}`,
    description: yacht.descriptionEn?.slice(0, 160) || `${yacht.title} - ${yacht.brand} ${yacht.model} ${yacht.year}`,
    openGraph: {
      title: `${yacht.title} | Bimo Yacht`,
      description: yacht.descriptionEn?.slice(0, 160) || '',
      images: coverImage ? [{ url: coverImage, width: 1200, height: 630 }] : undefined,
    },
  }
}

// Generate enhanced JSON-LD schema for SEO
function generateYachtSchema(yacht: NonNullable<Awaited<ReturnType<typeof getYacht>>>) {
  const coverImage = yacht.media.find((m: { isCover: boolean }) => m.isCover)?.url || yacht.media[0]?.url
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bimoyacht.com'

  // Main Product schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${siteUrl}/yachts/${yacht.slug}#product`,
    name: yacht.title,
    description: yacht.descriptionEn?.slice(0, 500),
    url: `${siteUrl}/yachts/${yacht.slug}`,
    image: yacht.media.map((m: { url: string }) => m.url),
    brand: {
      '@type': 'Brand',
      name: yacht.brand || 'Luxury Yacht',
    },
    manufacturer: yacht.builder ? {
      '@type': 'Organization',
      name: yacht.builder,
    } : undefined,
    model: yacht.model,
    productionDate: yacht.year?.toString(),
    category: yacht.type === 'CHARTER' ? 'Yacht Charter' : 'Yacht for Sale',
    offers: yacht.priceOnRequest
      ? {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        priceCurrency: yacht.currency || 'AED',
        priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        url: `${siteUrl}/yachts/${yacht.slug}`,
        seller: {
          '@type': 'Organization',
          name: 'Bimo Yacht',
          url: siteUrl,
        },
      }
      : {
        '@type': 'Offer',
        availability: yacht.status === 'AVAILABLE'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
        priceCurrency: yacht.currency || 'AED',
        price: yacht.price ? Number(yacht.price) : undefined,
        priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        url: `${siteUrl}/yachts/${yacht.slug}`,
        seller: {
          '@type': 'Organization',
          name: 'Bimo Yacht',
          url: siteUrl,
        },
      },
    additionalProperty: [
      yacht.lengthFeet && { '@type': 'PropertyValue', name: 'Length', value: `${yacht.lengthFeet} ft`, unitCode: 'FOT' },
      yacht.lengthMeters && { '@type': 'PropertyValue', name: 'Length (Meters)', value: `${yacht.lengthMeters} m`, unitCode: 'MTR' },
      yacht.beam && { '@type': 'PropertyValue', name: 'Beam', value: `${yacht.beam} m`, unitCode: 'MTR' },
      yacht.year && { '@type': 'PropertyValue', name: 'Year Built', value: yacht.year.toString() },
      yacht.cabins && { '@type': 'PropertyValue', name: 'Cabins', value: yacht.cabins.toString() },
      yacht.guestCapacity && { '@type': 'PropertyValue', name: 'Guest Capacity', value: yacht.guestCapacity.toString() },
      yacht.crewCapacity && { '@type': 'PropertyValue', name: 'Crew Capacity', value: yacht.crewCapacity.toString() },
      yacht.maxSpeed && { '@type': 'PropertyValue', name: 'Max Speed', value: `${yacht.maxSpeed} knots` },
      yacht.cruiseSpeed && { '@type': 'PropertyValue', name: 'Cruise Speed', value: `${yacht.cruiseSpeed} knots` },
      yacht.range && { '@type': 'PropertyValue', name: 'Range', value: `${yacht.range} nm` },
      yacht.engines && { '@type': 'PropertyValue', name: 'Engines', value: yacht.engines },
    ].filter(Boolean),
  }

  // Vehicle schema for better yacht representation
  const vehicleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    '@id': `${siteUrl}/yachts/${yacht.slug}#vehicle`,
    name: yacht.title,
    description: yacht.descriptionEn?.slice(0, 300),
    image: coverImage,
    brand: {
      '@type': 'Brand',
      name: yacht.brand || 'Luxury Yacht',
    },
    manufacturer: yacht.builder,
    model: yacht.model,
    vehicleModelDate: yacht.year?.toString(),
    numberOfPassengers: yacht.guestCapacity,
    vehicleConfiguration: yacht.type === 'CHARTER' ? 'Charter' : 'Sale',
    fuelType: yacht.fuelType,
    speed: yacht.maxSpeed ? {
      '@type': 'QuantitativeValue',
      value: yacht.maxSpeed,
      unitText: 'knots',
    } : undefined,
  }

  // BreadcrumbList for navigation
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: yacht.type === 'CHARTER' ? 'Charter' : 'Yachts for Sale',
        item: yacht.type === 'CHARTER' ? `${siteUrl}/charter` : `${siteUrl}/yachts`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: yacht.title,
        item: `${siteUrl}/yachts/${yacht.slug}`,
      },
    ],
  }

  return [productSchema, vehicleSchema, breadcrumbSchema]
}

import { getLocale } from 'next-intl/server'

const translations = {
  en: {
    forSale: 'For Sale',
    forCharter: 'For Charter',
    featured: 'Featured',
    length: 'Length',
    cabins: 'Cabins',
    guests: 'Guests',
    crew: 'Crew'
  },
  ar: {
    forSale: 'للبيع',
    forCharter: 'للإيجار',
    featured: 'مميز',
    length: 'الطول',
    cabins: 'الكبائن',
    guests: 'الضيوف',
    crew: 'الطاقم'
  }
}

export default async function YachtPage({ params }: YachtPageProps) {
  const resolvedParams = await params
  const yacht = await getYacht(resolvedParams.slug)
  const locale = await getLocale()

  const t = translations[locale as 'en' | 'ar'] || translations.en
  const isRtl = locale === 'ar'

  if (!yacht) {
    notFound()
  }

  const schema = generateYachtSchema(yacht)

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="min-h-screen bg-background pt-20">
        {/* Gallery Section */}
        <YachtGallery
          media={yacht.media.map((m: any) => ({
            id: m.id,
            url: m.url,
            type: m.type as 'IMAGE' | 'VIDEO',
            alt: m.alt || yacht.title,
            isCover: m.isCover,
          }))}
          title={yacht.title}
          locale={locale}
        />

        {/* Main Content */}
        <div className="container-luxury py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Info */}
            <div className="lg:col-span-2 space-y-12">
              {/* Header */}
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold 
                               uppercase tracking-wider
                               ${yacht.type === 'SALE'
                      ? 'bg-gold/90 text-jet'
                      : 'bg-muted text-foreground'
                    }`}>
                    {yacht.type === 'SALE' ? t.forSale : t.forCharter}
                  </span>
                  {yacht.featured && (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 
                                  bg-background border border-gold/30 text-gold text-xs font-medium ${isRtl ? 'flex-row-reverse' : ''}`}>
                      ★ {t.featured}
                    </span>
                  )}
                  {yacht.brand && yacht.year && (
                    <span className="text-muted-foreground text-sm">
                      {yacht.brand} • {yacht.year}
                    </span>
                  )}
                </div>

                <h1 className="text-display-sm md:text-display-md font-display font-bold text-foreground mb-4">
                  {yacht.title}
                </h1>

                {/* Quick specs bar */}
                <div className={`flex flex-wrap gap-6 text-muted-foreground ${isRtl ? 'flex-row-reverse' : ''}`}>
                  {yacht.lengthFeet && (
                    <div className={isRtl ? 'text-right' : ''}>
                      <span className="text-gold font-semibold ml-1">{yacht.lengthFeet}ft</span>
                      <span className="text-muted-foreground/60">{t.length}</span>
                    </div>
                  )}
                  {yacht.cabins && (
                    <div className={isRtl ? 'text-right' : ''}>
                      <span className="text-gold font-semibold ml-1">{yacht.cabins}</span>
                      <span className="text-muted-foreground/60">{t.cabins}</span>
                    </div>
                  )}
                  {yacht.guestCapacity && (
                    <div className={isRtl ? 'text-right' : ''}>
                      <span className="text-gold font-semibold ml-1">{yacht.guestCapacity}</span>
                      <span className="text-muted-foreground/60">{t.guests}</span>
                    </div>
                  )}
                  {yacht.crewCapacity && (
                    <div className={isRtl ? 'text-right' : ''}>
                      <span className="text-gold font-semibold ml-1">{yacht.crewCapacity}</span>
                      <span className="text-muted-foreground/60">{t.crew}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <YachtDescription
                descriptionEn={yacht.descriptionEn}
                descriptionAr={yacht.descriptionAr}
                highlightsEn={yacht.highlightsEn}
                highlightsAr={yacht.highlightsAr}
                amenitiesEn={yacht.amenitiesEn}
                amenitiesAr={yacht.amenitiesAr}
                locale={locale}
              />

              {/* Specifications Table */}
              <YachtSpecs
                yacht={{
                  lengthFeet: yacht.lengthFeet,
                  lengthMeters: yacht.lengthMeters ? Number(yacht.lengthMeters) : null,
                  beam: yacht.beam ? Number(yacht.beam) : null,
                  draft: yacht.draft ? Number(yacht.draft) : null,
                  brand: yacht.brand,
                  model: yacht.model,
                  year: yacht.year,
                  builder: yacht.builder,
                  cabins: yacht.cabins,
                  bathrooms: yacht.bathrooms,
                  guestCapacity: yacht.guestCapacity,
                  crewCapacity: yacht.crewCapacity,
                  engines: yacht.engines,
                  maxSpeed: yacht.maxSpeed,
                  cruiseSpeed: yacht.cruiseSpeed,
                  fuelCapacity: yacht.fuelCapacity,
                  range: yacht.range,
                  engineMake: yacht.engineMake,
                  engineModel: yacht.engineModel,
                  engineHours: yacht.engineHours,
                  engineType: yacht.engineType,
                  driveType: yacht.driveType,
                  fuelType: yacht.fuelType,
                  charterPricePerWeek: yacht.charterPricePerWeek,
                  charterPricePerSeasonWinter: yacht.charterPricePerSeasonWinter,
                  charterPricePerSeasonSummer: yacht.charterPricePerSeasonSummer,
                }}
                type={yacht.type}
                charterRoutes={yacht.charterRoutes}
                minimumHours={yacht.minimumHours}
                locale={locale}
              />
            </div>

            {/* Right Column - Inquiry */}
            <div className="lg:col-span-1">
              <YachtInquiry
                yacht={{
                  id: yacht.id,
                  title: yacht.title,
                  type: yacht.type,
                  price: yacht.price ? Number(yacht.price) : null,
                  priceOnRequest: yacht.priceOnRequest,
                  showPrice: yacht.showPrice,
                  charterPricePerWeek: yacht.charterPricePerWeek ? Number(yacht.charterPricePerWeek) : null,
                  charterPricePerSeasonWinter: yacht.charterPricePerSeasonWinter ? Number(yacht.charterPricePerSeasonWinter) : null,
                  charterPricePerSeasonSummer: yacht.charterPricePerSeasonSummer ? Number(yacht.charterPricePerSeasonSummer) : null,
                  currency: yacht.currency,
                }}
                locale={locale}
              />
            </div>
          </div>
        </div>

        {/* Related Yachts */}
        <RelatedYachts
          currentYachtId={yacht.id}
          type={yacht.type}
          brand={yacht.brand}
          locale={locale}
        />
      </main>
    </>
  )
}
