// Yacht Grid - Server Component

import Link from 'next/link'
import { YachtCard } from '@/components/yacht/YachtCard'
import { Button } from '@/components/ui/Button'
import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'

type YachtOrderBy = {
  createdAt?: 'asc' | 'desc'
  price?: 'asc' | 'desc'
  lengthFeet?: 'asc' | 'desc'
}

interface YachtGridProps {
  searchParams: {
    type?: string
    brand?: string
    minLength?: string
    maxLength?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    page?: string
  }
}

const ITEMS_PER_PAGE = 12

async function getYachts(searchParams: YachtGridProps['searchParams']) {
  const page = parseInt(searchParams.page || '1')
  const skip = (page - 1) * ITEMS_PER_PAGE

  // Build where clause
  const where: Prisma.YachtWhereInput = {
    status: 'AVAILABLE',
  }

  if (searchParams.type && searchParams.type !== 'ALL') {
    where.type = searchParams.type as 'SALE' | 'CHARTER'
  }

  if (searchParams.brand && searchParams.brand !== 'ALL') {
    where.brand = searchParams.brand
  }

  if (searchParams.minLength || searchParams.maxLength) {
    where.lengthFeet = {}
    if (searchParams.minLength) {
      where.lengthFeet.gte = parseInt(searchParams.minLength)
    }
    if (searchParams.maxLength) {
      where.lengthFeet.lte = parseInt(searchParams.maxLength)
    }
  }

  // Build order by
  let orderBy: YachtOrderBy = { createdAt: 'desc' }

  switch (searchParams.sort) {
    case 'oldest':
      orderBy = { createdAt: 'asc' }
      break
    case 'price-asc':
      orderBy = { price: 'asc' }
      break
    case 'price-desc':
      orderBy = { price: 'desc' }
      break
    case 'length-asc':
      orderBy = { lengthFeet: 'asc' }
      break
    case 'length-desc':
      orderBy = { lengthFeet: 'desc' }
      break
  }

  try {
    const [yachts, total] = await Promise.all([
      prisma.yacht.findMany({
        where,
        include: {
          media: {
            orderBy: { order: 'asc' },
            take: 1,
          },
        },
        orderBy: [
          { featured: 'desc' },
          { priority: 'desc' },
          orderBy,
        ],
        skip,
        take: ITEMS_PER_PAGE,
      }),
      prisma.yacht.count({ where }),
    ])

    return {
      yachts,
      total,
      totalPages: Math.ceil(total / ITEMS_PER_PAGE),
      currentPage: page,
    }
  } catch (error) {
    console.error('Error fetching yachts:', error)
    return {
      yachts: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    }
  }
}

export async function YachtGrid({ searchParams }: YachtGridProps) {
  const { yachts, total, totalPages, currentPage } = await getYachts(searchParams)

  if (yachts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center
                     bg-muted rounded-full">
          <svg className="w-10 h-10 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-display font-semibold text-foreground mb-2">
          No Yachts Found
        </h3>
        <p className="text-muted-foreground mb-6">
          Try adjusting your filters to find what you're looking for.
        </p>
        <Button asChild variant="secondary">
          <Link href="/yachts">Clear Filters</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          Showing <span className="text-foreground">{yachts.length}</span> of{' '}
          <span className="text-foreground">{total}</span> yachts
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {yachts.map((yacht: any, index: number) => (
          <YachtCard
            key={yacht.id}
            yacht={{
              id: yacht.id,
              slug: yacht.slug,
              title: yacht.title,
              type: yacht.type,
              price: yacht.price ? Number(yacht.price) : null,
              priceOnRequest: yacht.priceOnRequest,
              charterPricePerWeek: yacht.charterPricePerWeek ? Number(yacht.charterPricePerWeek) : null,
              currency: yacht.currency,
              lengthFeet: yacht.lengthFeet,
              brand: yacht.brand,
              year: yacht.year,
              cabins: yacht.cabins,
              guestCapacity: yacht.guestCapacity,
              featured: yacht.featured,
              showPrice: yacht.showPrice,
              media: yacht.media.map((m: any) => ({
                url: m.url,
                type: m.type,
                isCover: m.isCover,
              })),
            }}
            index={index}
            priority={index < 3 && currentPage === 1}
            showFavorite
            showCompare
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          searchParams={searchParams}
        />
      )}
    </>
  )
}

function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | undefined>
}) {
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') params.set(key, value)
    })
    params.set('page', page.toString())
    return `/yachts?${params.toString()}`
  }

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-4 py-2 text-muted-foreground hover:text-gold transition-colors"
        >
          Previous
        </Link>
      )}

      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-muted-foreground/60">
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={getPageUrl(page as number)}
              className={`min-w-[40px] h-10 flex items-center justify-center
                       transition-all duration-300
                       ${currentPage === page
                  ? 'bg-gold text-jet font-semibold'
                  : 'text-muted-foreground hover:text-gold hover:bg-muted/10'
                }`}
            >
              {page}
            </Link>
          )
        )}
      </div>

      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-4 py-2 text-muted-foreground hover:text-gold transition-colors"
        >
          Next
        </Link>
      )}
    </nav>
  )
}
