// Admin Yachts List Page

import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import prisma from '@/lib/db'
import { formatCurrency } from '@/lib/utils'

interface PageProps {
  searchParams: Promise<{
    filter?: string
    search?: string
    page?: string
  }>
}

async function getYachts(filter?: string, search?: string, page = 1) {
  const perPage = 10
  
  const where: any = {}
  
  if (filter === 'featured') {
    where.featured = true
  } else if (filter === 'sale') {
    where.type = 'SALE'
  } else if (filter === 'charter') {
    where.type = 'CHARTER'
  } else if (filter === 'sold') {
    where.status = 'SOLD'
  }
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
    ]
  }
  
  try {
    const [yachts, total] = await Promise.all([
      prisma.yacht.findMany({
        where,
        include: {
          media: {
            where: { isCover: true },
            take: 1,
          },
          _count: {
            select: { inquiries: true },
          },
        },
        orderBy: [
          { featured: 'desc' },
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.yacht.count({ where }),
    ])
    
    return { yachts, total, pages: Math.ceil(total / perPage) }
  } catch (error) {
    console.error('Error fetching yachts:', error)
    return { yachts: [], total: 0, pages: 0 }
  }
}

export default async function AdminYachtsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const page = parseInt(resolvedParams.page || '1')
  const { yachts, total, pages } = await getYachts(
    resolvedParams.filter,
    resolvedParams.search,
    page
  )
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Yachts</h1>
          <p className="text-white/60">{total} yachts total</p>
        </div>
        <Button asChild variant="primary">
          <Link href="/admin/yachts/new">
            <Plus className="w-4 h-4" />
            Add Yacht
          </Link>
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: '', label: 'All' },
          { value: 'featured', label: 'Featured' },
          { value: 'sale', label: 'For Sale' },
          { value: 'charter', label: 'For Charter' },
          { value: 'sold', label: 'Sold' },
        ].map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/yachts${filter.value ? `?filter=${filter.value}` : ''}`}
            className={`px-4 py-2 text-sm transition-colors
              ${resolvedParams.filter === filter.value || (!resolvedParams.filter && !filter.value)
                ? 'bg-gold text-jet'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>
      
      {/* Yachts Table */}
      <div className="bg-white/5 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Yacht</th>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Type</th>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Price</th>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Status</th>
                <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Inquiries</th>
                <th className="text-right px-4 py-3 text-white/60 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {yachts.map((yacht: any) => (
                <tr key={yacht.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 relative bg-white/10 flex-shrink-0">
                        {yacht.media[0] ? (
                          <Image
                            src={yacht.media[0].url}
                            alt={yacht.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            No Image
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{yacht.title}</span>
                          {yacht.featured && (
                            <Star className="w-4 h-4 text-gold fill-gold" />
                          )}
                        </div>
                        <p className="text-white/50 text-sm">{yacht.brand} • {yacht.year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium
                      ${yacht.type === 'SALE' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      {yacht.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">
                    {yacht.showPrice ? (
                      yacht.type === 'SALE' ? (
                        yacht.salePrice ? formatCurrency(Number(yacht.salePrice), yacht.currency) : '-'
                      ) : (
                        yacht.charterPricePerHour ? `${formatCurrency(Number(yacht.charterPricePerHour), yacht.currency)}/hr` : '-'
                      )
                    ) : (
                      <span className="text-white/50">Hidden</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium
                      ${yacht.status === 'AVAILABLE' 
                        ? 'bg-green-500/20 text-green-400' 
                        : yacht.status === 'SOLD'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {yacht.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">
                    {yacht._count.inquiries}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/yachts/${yacht.slug}`}
                        target="_blank"
                        className="p-2 text-white/50 hover:text-white transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/yachts/${yacht.id}`}
                        className="p-2 text-white/50 hover:text-gold transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-2 text-white/50 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {yachts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-white/50">
                    No yachts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <p className="text-white/50 text-sm">
              Page {page} of {pages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/yachts?page=${page - 1}${resolvedParams.filter ? `&filter=${resolvedParams.filter}` : ''}`}
                  className="px-3 py-1 text-sm bg-white/5 text-white hover:bg-white/10"
                >
                  Previous
                </Link>
              )}
              {page < pages && (
                <Link
                  href={`/admin/yachts?page=${page + 1}${resolvedParams.filter ? `&filter=${resolvedParams.filter}` : ''}`}
                  className="px-3 py-1 text-sm bg-white/5 text-white hover:bg-white/10"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
