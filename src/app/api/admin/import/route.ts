// Admin Import API
// Import yachts from CSV

import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { createAuditLog } from '@/lib/audit'
import { generateSlug } from '@/lib/utils'

// POST /api/admin/import - Import data from CSV
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = await currentUser()
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string || 'yachts'
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    const content = await file.text()
    const lines = content.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must have headers and at least one data row' },
        { status: 400 }
      )
    }
    
    // Parse CSV
    const headers = parseCSVLine(lines[0])
    const rows = lines.slice(1).map(line => parseCSVLine(line))
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }
    
    if (type === 'yachts') {
      for (let i = 0; i < rows.length; i++) {
        try {
          const row = rows[i]
          const data = mapRowToObject(headers, row)
          
          // Validate required fields
          if (!data.title) {
            results.errors.push(`Row ${i + 2}: Title is required`)
            results.failed++
            continue
          }
          
          // Generate slug if not provided
          const slug = data.slug || generateSlug(data.title)
          
          // Check for existing slug
          const existing = await prisma.yacht.findUnique({
            where: { slug },
          })
          
          if (existing) {
            // Update existing yacht
            await prisma.yacht.update({
              where: { id: existing.id },
              data: transformYachtData(data),
            })
          } else {
            // Create new yacht
            await prisma.yacht.create({
              data: {
                ...transformYachtData(data),
                slug,
              },
            })
          }
          
          results.success++
        } catch (error) {
          results.errors.push(`Row ${i + 2}: ${(error as Error).message}`)
          results.failed++
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Only yacht import is supported currently' },
        { status: 400 }
      )
    }
    
    // Log import
    await createAuditLog({
      action: 'IMPORT',
      entityType: 'Yacht',
      metadata: {
        filename: file.name,
        totalRows: rows.length,
        success: results.success,
        failed: results.failed,
      },
      clerkId: userId,
      adminEmail: user?.emailAddresses[0]?.emailAddress,
      adminName: user?.fullName,
    })
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Import failed' },
      { status: 500 }
    )
  }
}

// Parse a CSV line, handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

// Map headers and row values to object
function mapRowToObject(headers: string[], row: string[]): Record<string, string> {
  const obj: Record<string, string> = {}
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase().replace(/[^a-z0-9]/g, '_')
    obj[header] = row[i] || ''
  }
  return obj
}

// Transform CSV data to Prisma yacht data
function transformYachtData(data: Record<string, string>) {
  return {
    title: data.title,
    type: (data.type?.toUpperCase() === 'CHARTER' ? 'CHARTER' : 'SALE') as 'SALE' | 'CHARTER',
    status: mapStatus(data.status),
    brand: data.brand || null,
    model: data.model || null,
    year: data.year ? parseInt(data.year) : null,
    lengthFeet: data.length_ft_ || data.length ? parseInt(data.length_ft_ || data.length) : null,
    price: data.price && data.price !== 'POA' ? parseFloat(data.price) : null,
    priceOnRequest: data.price === 'POA' || data.price_on_request === 'Yes',
    currency: data.currency || 'AED',
    cabins: data.cabins ? parseInt(data.cabins) : null,
    guestCapacity: data.guests || data.guest_capacity ? parseInt(data.guests || data.guest_capacity) : null,
    featured: data.featured?.toLowerCase() === 'yes' || data.featured === 'true',
    priority: data.priority ? parseInt(data.priority) : 0,
    descriptionEn: data.description_en || data.description || null,
    descriptionAr: data.description_ar || null,
  }
}

function mapStatus(status: string): 'AVAILABLE' | 'SOLD' | 'CHARTERED' | 'UNAVAILABLE' {
  const upper = status?.toUpperCase()
  if (upper === 'SOLD') return 'SOLD'
  if (upper === 'CHARTERED') return 'CHARTERED'
  if (upper === 'UNAVAILABLE') return 'UNAVAILABLE'
  return 'AVAILABLE'
}
