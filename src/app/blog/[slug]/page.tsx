// Single Blog Post Page

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import prisma from '@/lib/db'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  try {
    return await prisma.blogPost.findUnique({
      where: { slug },
    })
  } catch {
    return null
  }
}

async function getRelatedPosts(post: any) {
  try {
    return await prisma.blogPost.findMany({
      where: {
        id: { not: post.id },
        status: 'published',
        OR: [
          { category: post.category },
          { tags: { hasSome: post.tags } },
        ],
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
    })
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: post.metaTitleEn || `${post.titleEn} | Bimo Yacht Blog`,
    description: post.metaDescriptionEn || post.excerptEn || '',
    openGraph: {
      title: post.metaTitleEn || post.titleEn,
      description: post.metaDescriptionEn || post.excerptEn || '',
      type: 'article',
      images: post.coverImage ? [{ url: post.coverImage }] : [],
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.authorName ? [post.authorName] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitleEn || post.titleEn,
      description: post.metaDescriptionEn || post.excerptEn || '',
      images: post.coverImage ? [post.coverImage] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post || post.status !== 'published') {
    notFound()
  }

  const relatedPosts = await getRelatedPosts(post)

  // Generate structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.titleEn,
    description: post.excerptEn,
    image: post.coverImage,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: post.authorName || 'Bimo Yacht',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bimo Yacht',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bimoyacht.com/logo.png',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="min-h-screen bg-white text-jet">
        {/* Hero Image */}
        {post.coverImage && (
          <div className="relative h-[50vh] md:h-[60vh]">
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt || post.titleEn}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="container mx-auto">
                {post.category && (
                  <Link
                    href={`/blog?category=${post.category}`}
                    className="inline-block px-4 py-1 bg-gold text-white text-sm font-medium rounded-full mb-4"
                  >
                    {post.category}
                  </Link>
                )}
                <h1 className="text-3xl md:text-5xl font-bold text-white max-w-4xl">
                  {post.titleEn}
                </h1>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <article className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {/* Meta */}
              <div className="flex items-center gap-4 mb-8 text-gray-500">
                {post.authorName && (
                  <span className="font-medium">{post.authorName}</span>
                )}
                {post.publishedAt && (
                  <>
                    <span>•</span>
                    <time dateTime={post.publishedAt.toISOString()}>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </>
                )}
              </div>

              {/* Title (if no cover image) */}
              {!post.coverImage && (
                <h1 className="text-4xl font-bold text-jet mb-8">
                  {post.titleEn}
                </h1>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none prose-headings:text-jet prose-a:text-gold prose-img:rounded-xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.contentEn}
                </ReactMarkdown>
              </div>

              {/* Sources */}
              {post.sources && post.sources.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Sources & References</h3>
                  <ul className="space-y-2">
                    {post.sources.map((source: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-600 break-all">
                        <a
                          href={source}
                          target="_blank"
                          rel="nofollow noreferrer"
                          className="flex items-center gap-2 hover:text-gold transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                          {source}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${tag}`}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gold/20 hover:text-gold transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="mt-8 pt-8 border-t">
                <p className="text-sm text-gray-500 mb-4">Share this article</p>
                <div className="flex gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.titleEn)}&url=${encodeURIComponent(`https://bimoyacht.com/blog/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-100 rounded-full hover:bg-[#1DA1F2] hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://bimoyacht.com/blog/${post.slug}`)}&title=${encodeURIComponent(post.titleEn)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-100 rounded-full hover:bg-[#0A66C2] hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${post.titleEn} - https://bimoyacht.com/blog/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-100 rounded-full hover:bg-[#25D366] hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-jet mb-8">Related Articles</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((related: any) => (
                  <Link
                    key={related.id}
                    href={`/blog/${related.slug}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {related.coverImage ? (
                      <div className="aspect-[16/9] relative">
                        <Image
                          src={related.coverImage}
                          alt={related.titleEn}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-gray-200" />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-jet group-hover:text-gold transition-colors line-clamp-2">
                        {related.titleEn}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Back to Blog */}
        <section className="py-8 border-t">
          <div className="container mx-auto px-4 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gold hover:underline"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
