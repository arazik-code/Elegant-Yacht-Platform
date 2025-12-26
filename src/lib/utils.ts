// Utility Functions for Bimo Yacht Platform

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency with proper locale
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'AED',
  locale: string = 'en-AE'
): string {
  if (amount === null || amount === undefined) return 'Price on Request'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format price for display (abbreviated for large amounts)
 */
export function formatPriceShort(amount: number | null | undefined, currency: string = 'AED'): string {
  if (amount === null || amount === undefined) return 'POA'

  if (amount >= 1000000) {
    return `${currency} ${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `${currency} ${(amount / 1000).toFixed(0)}K`
  }
  return `${currency} ${amount}`
}

/**
 * Generate WhatsApp chat link
 */
export function getWhatsAppLink(
  phone: string,
  message?: string,
  yachtTitle?: string
): string {
  const cleanPhone = phone.replace(/\D/g, '')

  let text = message || process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE || ''

  if (yachtTitle) {
    text = `Hello! I'm interested in the ${yachtTitle}. Please provide more information.`
  }

  const encodedMessage = encodeURIComponent(text)
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`
}

/**
 * Get WhatsApp phone number from env
 */
export function getWhatsAppNumber(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '971501566633'
}

/**
 * Convert feet to meters
 */
export function feetToMeters(feet: number): number {
  return feet * 0.3048
}

/**
 * Convert meters to feet
 */
export function metersToFeet(meters: number): number {
  return meters / 0.3048
}

/**
 * Format length with unit
 */
export function formatLength(feet: number | null | undefined, showMeters: boolean = true): string {
  if (!feet) return '-'
  if (showMeters) {
    return `${feet}ft (${(feet * 0.3048).toFixed(1)}m)`
  }
  return `${feet}ft`
}

/**
 * Generate yacht slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, locale: string = 'en-AE'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return formatDate(d)
}

/**
 * Check if value is valid
 */
export function isValidValue(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string' && value.trim() === '') return false
  if (typeof value === 'number' && isNaN(value)) return false
  return true
}

/**
 * Delay execution (for animations)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), ms)
  }
}

/**
 * Get Cloudinary optimized image URL
 */
export function getOptimizedImageUrl(
  url: string,
  width?: number,
  quality?: number
): string {
  if (!url.includes('cloudinary.com')) return url

  const transformations = []
  if (width) transformations.push(`w_${width}`)
  if (quality) transformations.push(`q_${quality}`)
  transformations.push('f_auto')

  const transformation = transformations.join(',')

  // Insert transformation into Cloudinary URL
  return url.replace('/upload/', `/upload/${transformation}/`)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '')
  return cleanPhone.length >= 9 && cleanPhone.length <= 15
}

/**
 * Get yacht type label
 */
export function getYachtTypeLabel(type: 'SALE' | 'CHARTER'): string {
  return type === 'SALE' ? 'For Sale' : 'For Charter'
}

/**
 * Get yacht status label and color
 */
export function getYachtStatusInfo(status: string): { label: string; color: string } {
  const statusMap: Record<string, { label: string; color: string }> = {
    AVAILABLE: { label: 'Available', color: 'text-green-500' },
    SOLD: { label: 'Sold', color: 'text-red-500' },
    CHARTERED: { label: 'Chartered', color: 'text-blue-500' },
    UNAVAILABLE: { label: 'Unavailable', color: 'text-gray-500' },
  }
  return statusMap[status] || { label: status, color: 'text-gray-500' }
}
