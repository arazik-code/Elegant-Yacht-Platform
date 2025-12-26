// Related Content Component for Internal Linking

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

interface RelatedYacht {
  id: string
  slug: string
  name: string
  images: string[]
  price?: number | null
  length?: number | null
  year?: number | null
}

interface RelatedPost {
  id: string
  slug: string
  titleEn: string
  coverImage?: string | null
  excerptEn?: string | null
  category?: string | null
  publishedAt?: Date | null
}

interface RelatedContentProps {
  currentType: 'yacht' | 'blog'
  currentId?: string
  relatedYachts?: RelatedYacht[]
  relatedPosts?: RelatedPost[]
  maxItems?: number
}

export function RelatedContent({
  currentType,
  currentId,
  relatedYachts = [],
  relatedPosts = [],
  maxItems = 3,
}: RelatedContentProps) {
  // Filter out current item and limit results
  const yachts = relatedYachts
    .filter(y => y.id !== currentId)
    .slice(0, maxItems)

  const posts = relatedPosts
    .filter(p => p.id !== currentId)
    .slice(0, maxItems)

  if (yachts.length === 0 && posts.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Related Yachts */}
        {yachts.length > 0 && currentType !== 'yacht' && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground">
                Featured Yachts
              </h2>
              <Link
                href="/yachts"
                className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {yachts.map((yacht) => (
                <Link
                  key={yacht.id}
                  href={`/yachts/${yacht.slug}`}
                  className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={yacht.images[0] || '/images/placeholder-yacht.jpg'}
                      alt={yacht.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors line-clamp-1">
                      {yacht.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {yacht.length && <span>{yacht.length}m</span>}
                      {yacht.year && <span>{yacht.year}</span>}
                    </div>
                    {yacht.price && (
                      <p className="mt-2 text-gold font-semibold">
                        AED {yacht.price.toLocaleString()}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Blog Posts */}
        {posts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-foreground">
                {currentType === 'blog' ? 'Related Articles' : 'From Our Blog'}
              </h2>
              <Link
                href="/blog"
                className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={post.coverImage || '/images/placeholder-blog.jpg'}
                      alt={post.titleEn}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {post.category && (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-gold text-navy-dark text-xs font-semibold rounded">
                        {post.category}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground group-hover:text-gold transition-colors line-clamp-2">
                      {post.titleEn}
                    </h3>
                    {post.excerptEn && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {post.excerptEn}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// Inline Links Component - Auto-link yacht/blog mentions in content
interface InlineLinkData {
  yachts: { id: string; slug: string; name: string }[]
  posts: { id: string; slug: string; titleEn: string }[]
}

export function processContentWithLinks(
  content: string,
  linkData: InlineLinkData,
  currentSlug?: string
): string {
  let processedContent = content

  // Link yacht names
  linkData.yachts.forEach(yacht => {
    if (yacht.slug !== currentSlug) {
      const regex = new RegExp(`\\b(${escapeRegex(yacht.name)})\\b`, 'gi')
      processedContent = processedContent.replace(
        regex,
        `<a href="/yachts/${yacht.slug}" class="text-gold hover:underline">$1</a>`
      )
    }
  })

  // Link blog post titles (exact match)
  linkData.posts.forEach(post => {
    if (post.slug !== currentSlug) {
      const regex = new RegExp(`\\b(${escapeRegex(post.titleEn)})\\b`, 'gi')
      processedContent = processedContent.replace(
        regex,
        `<a href="/blog/${post.slug}" class="text-gold hover:underline">$1</a>`
      )
    }
  })

  return processedContent
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Contextual CTA Component
interface ContextualCTAProps {
  type: 'yacht' | 'charter' | 'sell' | 'contact'
  className?: string
}

export function ContextualCTA({ type, className = '' }: ContextualCTAProps) {
  const ctas = {
    yacht: {
      title: 'Looking for the Perfect Yacht?',
      description: 'Browse our exclusive collection of luxury yachts for sale.',
      link: '/yachts',
      linkText: 'View All Yachts',
    },
    charter: {
      title: 'Experience Luxury Charter',
      description: 'Charter a yacht for an unforgettable experience on the water.',
      link: '/charter',
      linkText: 'Explore Charters',
    },
    sell: {
      title: 'Thinking of Selling?',
      description: 'Get a complimentary valuation from our expert team.',
      link: '/sell-your-yacht',
      linkText: 'Get Valuation',
    },
    contact: {
      title: 'Need Expert Advice?',
      description: 'Our yacht specialists are here to help you find your dream vessel.',
      link: '/contact',
      linkText: 'Contact Us',
    },
  }

  const cta = ctas[type]

  return (
    <div className={`bg-gradient-to-r from-gold/10 to-transparent border-l-4 border-gold p-6 rounded-r-xl ${className}`}>
      <h3 className="text-lg font-semibold text-foreground mb-2">{cta.title}</h3>
      <p className="text-muted-foreground mb-4">{cta.description}</p>
      <Link
        href={cta.link}
        className="inline-flex items-center gap-2 text-gold hover:text-gold-light font-medium transition-colors"
      >
        {cta.linkText} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}

// Internal linking suggestions based on content analysis
export function suggestInternalLinks(
  content: string,
  yachts: { slug: string; name: string; type?: string; manufacturer?: string }[],
  posts: { slug: string; titleEn: string; category?: string; tags?: string[] }[]
): { yachtLinks: string[]; postLinks: string[] } {
  const contentLower = content.toLowerCase()

  const yachtLinks = yachts
    .filter(yacht => {
      return (
        contentLower.includes(yacht.name.toLowerCase()) ||
        (yacht.manufacturer && contentLower.includes(yacht.manufacturer.toLowerCase())) ||
        (yacht.type && contentLower.includes(yacht.type.toLowerCase()))
      )
    })
    .map(y => y.slug)
    .slice(0, 5)

  const postLinks = posts
    .filter(post => {
      const titleWords = post.titleEn.toLowerCase().split(/\s+/)
      const matchesTitle = titleWords.some(word =>
        word.length > 4 && contentLower.includes(word)
      )
      const matchesTags = post.tags?.some(tag =>
        contentLower.includes(tag.toLowerCase())
      )
      return matchesTitle || matchesTags
    })
    .map(p => p.slug)
    .slice(0, 5)

  return { yachtLinks, postLinks }
}
