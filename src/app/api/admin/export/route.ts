// Admin Export API
// Export yachts or inquiries to CSV

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { createAuditLog } from '@/lib/audit'

// GET /api/admin/export - Export data to CSV
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'yachts'
    const format = searchParams.get('format') || 'csv'
    
    let data: any[] = []
    let headers: string[] = []
    let filename = ''
    
    if (type === 'yachts') {
      const yachts = await prisma.yacht.findMany({
        include: {
          media: { where: { isCover: true }, take: 1 },
          _count: { select: { inquiries: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      
      headers = [
        'ID', 'Title', 'Slug', 'Type', 'Status', 'Brand', 'Model', 'Year',
        'Length (ft)', 'Price', 'Currency', 'Cabins', 'Guests', 'Featured',
        'Priority', 'Inquiries', 'Created At', 'Published At'
      ]
      
      data = yachts.map(y => [
        y.id,
        y.title,
        y.slug,
        y.type,
        y.status,
        y.brand || '',
        y.model || '',
        y.year || '',
        y.lengthFeet || '',
        y.priceOnRequest ? 'POA' : y.price || '',
        y.currency,
        y.cabins || '',
        y.guestCapacity || '',
        y.featured ? 'Yes' : 'No',
        y.priority,
        y._count.inquiries,
        y.createdAt.toISOString(),
        y.publishedAt?.toISOString() || '',
      ])
      
      filename = `yachts-export-${new Date().toISOString().split('T')[0]}.csv`
      
    } else if (type === 'inquiries') {
      const inquiries = await prisma.inquiry.findMany({
        include: {
          yacht: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      
      headers = [
        'ID', 'Name', 'Phone', 'Email', 'Source', 'Status',
        'Yacht', 'Message', 'Notes', 'Assigned To',
        'Created At', 'Contacted At'
      ]
      
      data = inquiries.map(i => [
        i.id,
        i.name,
        i.phone,
        i.email || '',
        i.source,
        i.status,
        i.yacht?.title || '',
        (i.message || '').replace(/"/g, '""'),
        (i.notes || '').replace(/"/g, '""'),
        i.assignedTo || '',
        i.createdAt.toISOString(),
        i.contactedAt?.toISOString() || '',
      ])
      
      filename = `inquiries-export-${new Date().toISOString().split('T')[0]}.csv`
      
    } else {
      return NextResponse.json(
        { error: 'Invalid export type' },
        { status: 400 }
      )
    }
    
    // Build CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        row.map((cell: any) => {
          const str = String(cell)
          // Escape quotes and wrap in quotes if contains comma or newline
          if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        }).join(',')
      ),
    ].join('\n')
    
    // Log export
    await createAuditLog({
      action: 'EXPORT',
      entityType: type === 'yachts' ? 'Yacht' : 'Inquiry',
      metadata: { type, format, count: data.length },
      clerkId: userId,
    })
    
    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
    
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}
