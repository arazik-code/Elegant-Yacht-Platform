// Blog Listing Page

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/db'
import { getMetadataAlternates } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Yacht Blog | News & Insights | Bimo Yacht',
  description: 'Stay updated with the latest yacht news, buying guides, luxury lifestyle articles, and industry insights from Bimo Yacht Dubai.',
  alternates: getMetadataAlternates('/blog'),
  openGraph: {
    title: 'Yacht Blog | News & Insights | Bimo Yacht',
    description: 'Stay updated with the latest yacht news, buying guides, luxury lifestyle articles, and industry insights from Bimo Yacht Dubai.',
    type: 'website',
  },
}

async function getBlogPosts(category?: string) {
  try {
    const where: any = { status: 'published' }
    if (category) {
      where.category = category
    }
    
    return await prisma.blogPost.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { publishedAt: 'desc' },
      ],
    })
  } catch {
    return []
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const posts = await getBlogPosts(category)
  
  const categories = [
    { slug: '', label: 'All Posts' },
    { slug: 'news', label: 'News' },
    { slug: 'guides', label: 'Buying Guides' },
    { slug: 'lifestyle', label: 'Lifestyle' },
    { slug: 'yachts', label: 'Featured Yachts' },
  ]
  
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Yacht Blog
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Industry insights, buying guides, and luxury lifestyle content from Dubai's premier yacht brokerage.
          </p>
        </div>
      </section>
      
      {/* Categories */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 py-4 overflow-x-auto">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.slug ? `/blog?category=${cat.slug}` : '/blog'}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  (category || '') === cat.slug
                    ? 'bg-gold text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Posts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold text-gray-600 mb-4">
                No posts yet
              </h2>
              <p className="text-gray-500">
                Check back soon for yacht news and insights.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <Link href={`/blog/${post.slug}`}>
                    {post.coverImage ? (
                      <div className="aspect-[16/9] relative">
                        <Image
                          src={post.coverImage}
                          alt={post.coverImageAlt || post.titleEn}
                          fill
                          className="object-cover"
                        />
                        {post.featured && (
                          <span className="absolute top-4 left-4 px-3 py-1 bg-gold text-white text-sm font-medium rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    
                    <div className="p-6">
                      {post.category && (
                        <span className="text-sm text-gold font-medium uppercase">
                          {post.category}
                        </span>
                      )}
                      
                      <h2 className="text-xl font-bold text-jet mt-2 mb-3 line-clamp-2">
                        {post.titleEn}
                      </h2>
                      
                      {post.excerptEn && (
                        <p className="text-gray-600 line-clamp-3 mb-4">
                          {post.excerptEn}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        {post.authorName && (
                          <span>By {post.authorName}</span>
                        )}
                        {post.publishedAt && (
                          <time dateTime={post.publishedAt.toISOString()}>
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </time>
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
