// AI Search Service
// Natural language yacht search using Google Gemini

import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { Yacht } from '@/lib/types'
import {
  yachtAmenities,
  siteConfig,
  yachtBrands,
  charterRoutes,
  trustBadges,
  navigationLinks
} from '@/lib/constants'

// Initialize Google Gemini only if API key is available
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

// Data extraction model (faster, cheaper)
const MODEL_NAME = 'gemini-2.5-flash'

// ============================================
// CACHING SYSTEM
// ============================================

interface CacheEntry<T> {
  data: T
  timestamp: number
  hits: number
}

// Multi-tier cache for AI results
const searchCache = new Map<string, CacheEntry<AISearchResult>>()
const similarityCache = new Map<string, CacheEntry<string[]>>()
const descriptionCache = new Map<string, CacheEntry<string>>()

const CACHE_TTL = {
  search: 1000 * 60 * 30,      // 30 minutes for search results
  similarity: 1000 * 60 * 60,   // 1 hour for similarity
  description: 1000 * 60 * 60 * 24, // 24 hours for descriptions
}

const MAX_CACHE_SIZE = 500

// Clean old cache entries periodically
function cleanCache<T>(cache: Map<string, CacheEntry<T>>, ttl: number) {
  const now = Date.now()
  for (const [key, entry] of cache) {
    if (now - entry.timestamp > ttl) {
      cache.delete(key)
    }
  }
  // If still too large, remove least hit entries
  if (cache.size > MAX_CACHE_SIZE) {
    const sorted = [...cache.entries()].sort((a, b) => a[1].hits - b[1].hits)
    const toRemove = sorted.slice(0, cache.size - MAX_CACHE_SIZE)
    toRemove.forEach(([key]) => cache.delete(key))
  }
}

// Run cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cleanCache(searchCache, CACHE_TTL.search)
    cleanCache(similarityCache, CACHE_TTL.similarity)
    cleanCache(descriptionCache, CACHE_TTL.description)
  }, 1000 * 60 * 10)
}

// ============================================
// ADMIN TUNING CONFIGURATION
// ============================================

export interface RecommendationSettings {
  weights: {
    sameType: number      // 0-10
    similarPrice: number  // 0-10 (within 30%)
    similarLength: number // 0-10 (within 20ft)
    sameBrand: number     // 0-10
    similarYear: number   // 0-10 (within 5 years)
    similarGuests: number // 0-10 (within 4)
  }
  minScore: number        // Minimum score to show as similar
  maxResults: number      // Max similar yachts to return
  prioritizeFeatured: boolean
  diversifyBrands: boolean
}

// Default recommendation settings (can be overridden by admin)
const defaultRecommendationSettings: RecommendationSettings = {
  weights: {
    sameType: 3,
    similarPrice: 2,
    similarLength: 2,
    sameBrand: 2,
    similarYear: 1,
    similarGuests: 1,
  },
  minScore: 3,
  maxResults: 6,
  prioritizeFeatured: true,
  diversifyBrands: true,
}

// In-memory settings (can be loaded from DB/env)
let currentSettings: RecommendationSettings = { ...defaultRecommendationSettings }

export function getRecommendationSettings(): RecommendationSettings {
  return currentSettings
}

export function updateRecommendationSettings(settings: Partial<RecommendationSettings>): RecommendationSettings {
  currentSettings = {
    ...currentSettings,
    ...settings,
    weights: {
      ...currentSettings.weights,
      ...(settings.weights || {}),
    },
  }
  // Clear similarity cache when settings change
  similarityCache.clear()
  return currentSettings
}

interface SearchFilters {
  type?: 'SALE' | 'CHARTER'
  minPrice?: number
  maxPrice?: number
  minLength?: number
  maxLength?: number
  brands?: string[]
  minYear?: number
  maxYear?: number
  minCabins?: number
  minGuests?: number
  features?: string[]
  textQuery?: string // For specific names like "Seawolf"
}

interface AISearchResult {
  filters: SearchFilters
  explanation: string
  suggestions?: string[]
}

/**
 * Build system context for the AI
 */
function buildSystemContext(): string {
  const brandList = yachtBrands.join(', ')
  const routeList = charterRoutes.join(', ')
  const amenityList = yachtAmenities.en.join(', ')

  return `
    You are an advanced AI Yacht Broker Assistant for "Bimo Yacht", the premier yachting platform in Dubai.
    
    Start of Business Context:
    - Company Name: ${siteConfig.name}
    - Location: ${siteConfig.address}
    - Contact: ${siteConfig.phone} (WhatsApp: ${siteConfig.whatsapp})
    - License: ${siteConfig.dedLicense} (DED Licensed)
    - Social Proof: ${siteConfig.instagramFollowers} Instagram followers
    - Key Services: Yacht Sales, Luxury Charters, Yacht Management
    
    Market Context:
    - Brands we sell: ${brandList}
    - Charter Routes: ${routeList}
    - Standard Amenities: ${amenityList}
    
    Currency: AED (Dirhams). If user says "$", assume USD and convert roughly (1 USD = 3.67 AED).
    Lengths are in Feet (ft).
    End of Business Context.

    Your Goal:
    1. Parse SEARCH queries into filters.
    2. Answer GENERAL questions using the context above.
    3. Guide users to the right page if no search is needed.
  `
}

/**
 * Parse natural language query into search filters using Google Gemini
 */
export async function parseNaturalLanguageQuery(query: string): Promise<AISearchResult> {
  // Check cache with new system
  const cacheKey = query.toLowerCase().trim()
  const cached = searchCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL.search) {
    cached.hits++
    return cached.data
  }

  // Fallback to keyword parsing if Gemini is not available
  if (!genAI) {
    console.log('Gemini API key not configured, using keyword parser')
    const result = fallbackParse(query)
    searchCache.set(cacheKey, { data: result, timestamp: Date.now(), hits: 1 })
    return result
  }

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            filters: {
              type: SchemaType.OBJECT,
              properties: {
                type: { type: SchemaType.STRING, format: "enum", enum: ["SALE", "CHARTER"] },
                minPrice: { type: SchemaType.NUMBER },
                maxPrice: { type: SchemaType.NUMBER },
                minLength: { type: SchemaType.NUMBER },
                maxLength: { type: SchemaType.NUMBER },
                brands: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                minYear: { type: SchemaType.NUMBER },
                maxYear: { type: SchemaType.NUMBER },
                minCabins: { type: SchemaType.NUMBER },
                minGuests: { type: SchemaType.NUMBER },
                features: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                textQuery: { type: SchemaType.STRING }
              }
            },
            explanation: { type: SchemaType.STRING },
            suggestions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
          },
          required: ["filters", "explanation"]
        }
      }
    })

    const systemContext = buildSystemContext()
    const prompt = `
    ${systemContext}
    
    User Query: "${query}"
    
    Instructions:
    - If the user asks a general question (e.g. "Where are you?", "How to sell?"), provide a helpful answer in 'explanation' and return empty filters.
    - If the user wants to Sell, suggest visiting '/sell-your-yacht' in 'suggestions'.
    - If the user wants to Charter, set type='CHARTER'.
    - If the user wants to Buy, set type='SALE'.
    - Map requested features to the 'Standard Amenities' list exactly.
    
    Implicit Rules:
    - "Fast" or "Speed" -> imply minSpeed > 25 knots (add to features only if 'High Speed' is an amenity, otherwise ignore)
    - "Family" -> imply minCabins: 3, minGuests: 6
    - "Superyacht" -> imply minLength: 80
    - "Newish" or "Modern" -> imply minYear: 2018
    - "Superyacht" -> imply minLength: 80
    - "Newish" or "Modern" -> imply minYear: 2018
    - "More than X ft" -> minLength: X
    - "Under X ft" -> maxLength: X
    - If user asks for a specific name (e.g. "Seawolf"), put it in 'textQuery'.
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Clean up response if it contains markdown code blocks (though responseMimeType usually parses it)
    const cleanJson = responseText.replace(/```json|```/g, '').trim()
    const parsedResult = JSON.parse(cleanJson) as AISearchResult

    // Cache result with new system
    searchCache.set(cacheKey, { data: parsedResult, timestamp: Date.now(), hits: 1 })

    return parsedResult
  } catch (error: any) {
    const isRateLimit = error?.message?.includes('429') || error?.status === 429

    if (isRateLimit) {
      console.warn('Gemini API Rate Limit (429) hit. Falling back to keyword search.')
    } else {
      console.error('Gemini AI search error:', error)
    }

    // Fallback to basic keyword matching
    const fallback = fallbackParse(query)
    searchCache.set(cacheKey, { data: fallback, timestamp: Date.now(), hits: 1 })
    return fallback
  }
}

/**
 * Fallback parser when AI is unavailable
 */
function fallbackParse(query: string): AISearchResult {
  const filters: SearchFilters = {}
  const lowerQuery = query.toLowerCase()

  // Type detection
  if (lowerQuery.includes('charter') || lowerQuery.includes('rent') || lowerQuery.includes('hire')) {
    filters.type = 'CHARTER'
  } else if (lowerQuery.includes('buy') || lowerQuery.includes('sale') || lowerQuery.includes('purchase')) {
    filters.type = 'SALE'
  }

  // Price detection
  const priceMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:m|million|mil)/i)
  if (priceMatch) {
    const price = parseFloat(priceMatch[1]) * 1000000
    filters.maxPrice = price * 1.2 // Add 20% buffer
    filters.minPrice = price * 0.5
  }

  const underMatch = query.match(/under\s*(\d+(?:\.\d+)?)\s*(?:m|million)?/i)
  if (underMatch) {
    filters.maxPrice = parseFloat(underMatch[1]) * (underMatch[0].includes('m') ? 1000000 : 1)
  }

  // Length detection
  const lengthMatch = query.match(/(?:over|more than|above|>)\s*(\d+)\s*(?:ft|feet|foot)/i)
  const lengthMatchUnder = query.match(/(?:under|less than|below|<)\s*(\d+)\s*(?:ft|feet|foot)/i)
  const exactLengthMatch = query.match(/(\d+)\s*(?:ft|feet|foot)/i)

  if (lengthMatch) {
    filters.minLength = parseInt(lengthMatch[1])
  } else if (lengthMatchUnder) {
    filters.maxLength = parseInt(lengthMatchUnder[1])
  } else if (exactLengthMatch) {
    const length = parseInt(exactLengthMatch[1])
    filters.minLength = length - 10
    filters.maxLength = length + 10
  }

  // Guest/family detection
  if (lowerQuery.includes('family') || lowerQuery.includes('families')) {
    filters.minGuests = 8
    filters.minCabins = 3
  }

  const guestMatch = query.match(/(\d+)\s*(?:guest|people|person)/i)
  if (guestMatch) {
    filters.minGuests = parseInt(guestMatch[1])
  }

  // Brand detection
  const brands = ['majesty', 'azimut', 'sunseeker', 'ferretti', 'pershing', 'riva', 'princess', 'benetti']
  const detectedBrands = brands.filter(b => lowerQuery.includes(b))
  if (detectedBrands.length > 0) {
    filters.brands = detectedBrands.map(b => b.charAt(0).toUpperCase() + b.slice(1))
  } else if (!lowerQuery.includes('yacht') && !lowerQuery.includes('price')) {
    // If no brand found and query is short, assume it's a name search
    filters.textQuery = query
  }

  return {
    filters,
    explanation: `Searching for yachts matching: ${query}`,
    suggestions: [
      'Try specifying a price range',
      'Add length requirements (e.g., 50ft)',
      'Mention specific features you need',
    ],
  }
}

/**
 * Get similar yacht recommendations using configurable weights
 */
export async function getSimilarYachts(yacht: Yacht, allYachts: Yacht[]): Promise<string[]> {
  // Check cache
  const cacheKey = `similar_${yacht.id}_${allYachts.length}`
  const cached = similarityCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL.similarity) {
    cached.hits++
    return cached.data
  }

  const settings = getRecommendationSettings()
  const { weights, minScore, maxResults, prioritizeFeatured, diversifyBrands } = settings

  // Calculate similarity scores
  const scored = allYachts
    .filter(y => y.id !== yacht.id && y.status === 'AVAILABLE')
    .map(y => {
      let score = 0

      // Same type (weighted)
      if (y.type === yacht.type) {
        score += weights.sameType
      }

      // Similar price (within 30%)
      if (yacht.price && y.price && !yacht.priceOnRequest && !y.priceOnRequest) {
        const priceDiff = Math.abs(y.price - yacht.price) / yacht.price
        if (priceDiff < 0.3) {
          score += weights.similarPrice * (1 - priceDiff / 0.3)
        }
      }

      // Similar length (within 20ft)
      if (yacht.lengthFeet && y.lengthFeet) {
        const lengthDiff = Math.abs(y.lengthFeet - yacht.lengthFeet)
        if (lengthDiff <= 20) {
          score += weights.similarLength * (1 - lengthDiff / 20)
        }
      }

      // Same brand
      if (y.brand && yacht.brand && y.brand.toLowerCase() === yacht.brand.toLowerCase()) {
        score += weights.sameBrand
      }

      // Similar year (within 5 years)
      if (yacht.year && y.year) {
        const yearDiff = Math.abs(y.year - yacht.year)
        if (yearDiff <= 5) {
          score += weights.similarYear * (1 - yearDiff / 5)
        }
      }

      // Similar guest capacity (within 4)
      if (yacht.guestCapacity && y.guestCapacity) {
        const guestDiff = Math.abs(y.guestCapacity - yacht.guestCapacity)
        if (guestDiff <= 4) {
          score += weights.similarGuests * (1 - guestDiff / 4)
        }
      }

      // Bonus for featured yachts
      if (prioritizeFeatured && y.featured) {
        score += 0.5
      }

      return { yacht: y, score }
    })
    .filter(s => s.score >= minScore)
    .sort((a, b) => b.score - a.score)

  // Optionally diversify brands
  let result: Yacht[]
  if (diversifyBrands && scored.length > maxResults) {
    const seenBrands = new Set<string>()
    result = []

    // First pass: one per brand
    for (const item of scored) {
      if (result.length >= maxResults) break
      const brand = item.yacht.brand?.toLowerCase() || 'unknown'
      if (!seenBrands.has(brand)) {
        seenBrands.add(brand)
        result.push(item.yacht)
      }
    }

    // Second pass: fill remaining slots
    for (const item of scored) {
      if (result.length >= maxResults) break
      if (!result.includes(item.yacht)) {
        result.push(item.yacht)
      }
    }
  } else {
    result = scored.slice(0, maxResults).map(s => s.yacht)
  }

  const ids = result.map(y => y.id)

  // Cache the result
  similarityCache.set(cacheKey, { data: ids, timestamp: Date.now(), hits: 1 })

  return ids
}

/**
 * Generate yacht description using Google Gemini
 */
export async function generateYachtDescription(yacht: Partial<Yacht>): Promise<string> {
  if (!genAI) {
    return ''
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })

    const prompt = `
    You are a luxury yacht copywriter. Write an elegant, compelling description for this yacht.
    
    Yacht Details:
    Brand: ${yacht.brand || 'Unknown'}
    Model: ${yacht.model || 'Unknown'}
    Year: ${yacht.year || 'Unknown'}
    Length: ${yacht.lengthFeet || 'Unknown'} ft
    Type: ${yacht.type === 'CHARTER' ? 'Charter' : 'Sale'}
    Cabins: ${yacht.cabins || 'Unknown'}
    Guests: ${yacht.guestCapacity || 'Unknown'}
    Features: ${yacht.highlightsEn?.join(', ') || 'Various luxury amenities'}
    
    Guidelines:
    - Professional yet inviting tone
    - Highlight key features and lifestyle benefits
    - Use sensory language
    - Keep it concise (2-3 paragraphs, ~150 words)
    - Focus on the experience, not just specs
    - Avoid clichés and superlatives
    `

    const result = await model.generateContent(prompt)
    const description = result.response.text()

    // Cache the description
    const cacheKey = `${yacht.brand}-${yacht.model}-${yacht.year}`
    descriptionCache.set(cacheKey, {
      data: description,
      timestamp: Date.now(),
      hits: 0
    })

    return description

  } catch (error: any) {
    const isRateLimit = error?.message?.includes('429') || error?.status === 429

    if (isRateLimit) {
      console.warn('Gemini API Rate Limit (429) hit checking description. Returning empty.')
    } else {
      console.error('Gemini AI description error:', error)
    }
    return ''
  }
}

/**
 * Get AI cache statistics for admin monitoring
 */
export function getAICacheStats() {
  return {
    search: {
      size: searchCache.size,
      maxSize: MAX_CACHE_SIZE,
      ttlMinutes: CACHE_TTL.search / 60000,
    },
    similarity: {
      size: similarityCache.size,
      maxSize: MAX_CACHE_SIZE,
      ttlMinutes: CACHE_TTL.similarity / 60000,
    },
    description: {
      size: descriptionCache.size,
      maxSize: MAX_CACHE_SIZE,
      ttlMinutes: CACHE_TTL.description / 60000,
    },
    total: searchCache.size + similarityCache.size + descriptionCache.size,
  }
}

/**
 * Clear all AI caches (for admin use)
 */
export function clearAICache(type?: 'search' | 'similarity' | 'description' | 'all') {
  switch (type) {
    case 'search':
      searchCache.clear()
      break
    case 'similarity':
      similarityCache.clear()
      break
    case 'description':
      descriptionCache.clear()
      break
    case 'all':
    default:
      searchCache.clear()
      similarityCache.clear()
      descriptionCache.clear()
  }
}
