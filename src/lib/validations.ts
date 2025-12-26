// Zod Validation Schemas for Bimo Yacht Platform

import { z } from 'zod'

/**
 * Inquiry Form Schema
 */
export const inquirySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  phone: z
    .string()
    .min(9, 'Please enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[\d\s\+\-\(\)]+$/, 'Please enter a valid phone number'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .max(2000, 'Message is too long')
    .optional(),
  yachtId: z.string().optional(),
  source: z.enum(['WEBSITE', 'INSTAGRAM', 'WHATSAPP', 'REFERRAL']).default('WEBSITE'),
  context: z.any().optional(),
})

export type InquiryFormData = z.infer<typeof inquirySchema>

/**
 * Sell Your Yacht Form Schema
 */
export const sellYachtSchema = z.object({
  // Contact Info
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(9, 'Valid phone is required'),
  email: z.string().email('Valid email is required'),

  // Yacht Info
  yachtBrand: z.string().min(1, 'Brand is required'),
  yachtModel: z.string().min(1, 'Model is required'),
  yachtYear: z.number().min(1950).max(new Date().getFullYear() + 1),
  yachtLength: z.number().min(20).max(500),

  // Pricing
  askingPrice: z.number().optional(),
  priceNegotiable: z.boolean().default(true),

  // Additional
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR']).default('GOOD'),
  location: z.string().optional(),
  notes: z.string().max(5000).optional(),
})

export type SellYachtFormData = z.infer<typeof sellYachtSchema>

/**
 * Admin Yacht Schema
 */
export const yachtSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  slug: z.string().min(3, 'Slug is required'),
  type: z.enum(['SALE', 'CHARTER']),
  status: z.enum(['AVAILABLE', 'SOLD', 'CHARTERED', 'UNAVAILABLE']).default('AVAILABLE'),

  // Pricing
  price: z.number().positive().optional().nullable(),
  priceOnRequest: z.boolean().default(false),
  currency: z.string().default('AED'),
  charterPricePerWeek: z.number().positive().optional().nullable(),
  charterPricePerSeasonWinter: z.number().positive().optional().nullable(),
  charterPricePerSeasonSummer: z.number().positive().optional().nullable(),

  // Specs
  lengthFeet: z.number().min(20).max(500).optional().nullable(),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  year: z.number().min(1950).max(new Date().getFullYear() + 2).optional().nullable(),
  cabins: z.number().min(0).max(50).optional().nullable(),
  bathrooms: z.number().min(0).max(50).optional().nullable(),
  guestCapacity: z.number().min(1).max(200).optional().nullable(),
  crewCapacity: z.number().min(0).max(50).optional().nullable(),
  engines: z.string().optional().nullable(),
  engineMake: z.string().optional().nullable(),
  engineModel: z.string().optional().nullable(),
  engineHours: z.string().optional().nullable(),
  engineType: z.string().optional().nullable(),
  driveType: z.string().optional().nullable(),
  fuelType: z.string().optional().nullable(),
  beam: z.number().optional().nullable(),
  draft: z.number().optional().nullable(),
  maxSpeed: z.number().optional().nullable(),
  cruiseSpeed: z.number().optional().nullable(),
  fuelCapacity: z.number().optional().nullable(),
  range: z.number().optional().nullable(),

  // Content
  descriptionEn: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  highlightsEn: z.array(z.string()).default([]),
  highlightsAr: z.array(z.string()).default([]),

  // Charter specific
  charterRoutes: z.array(z.string()).default([]),


  // Display
  featured: z.boolean().default(false),
  showPrice: z.boolean().default(true),
  priority: z.number().min(0).max(1000).default(0),
})

export type YachtFormData = z.infer<typeof yachtSchema>

/**
 * Contact Form Schema
 */
export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(9, 'Valid phone is required').optional(),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Please enter a message'),
})

export type ContactFormData = z.infer<typeof contactSchema>

/**
 * Yacht Filter Schema
 */
export const yachtFilterSchema = z.object({
  type: z.enum(['SALE', 'CHARTER', 'ALL']).default('ALL'),
  brand: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minYear: z.number().optional(),
  maxYear: z.number().optional(),
  featured: z.boolean().optional(),
  sort: z.enum(['newest', 'oldest', 'price-asc', 'price-desc', 'length-asc', 'length-desc']).default('newest'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
})

export type YachtFilterData = z.infer<typeof yachtFilterSchema>
