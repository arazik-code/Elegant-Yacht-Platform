// Admin Blog Management Page

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  Calendar,
  FileText,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface BlogPost {
  id: string
  slug: string
  titleEn: string
  titleAr?: string
  excerptEn?: string
  coverImage?: string
  category?: string
  tags: string[]
  status: string
  featured: boolean
  authorName?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [filter])

  const fetchPosts = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/admin/blog'
        : `/api/admin/blog?status=${filter}`
      const res = await fetch(url)
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    } finally {
      setDeleting(null)
    }
  }

  const handlePublish = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setPosts(posts.map(p => 
          p.id === id ? { ...p, status: newStatus } : p
        ))
      }
    } catch (error) {
      console.error('Failed to update post:', error)
    }
  }

  const handleFeature = async (id: string, featured: boolean) => {
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !featured }),
      })
      if (res.ok) {
        setPosts(posts.map(p => 
          p.id === id ? { ...p, featured: !featured } : p
        ))
      }
    } catch (error) {
      console.error('Failed to update post:', error)
    }
  }

  const filteredPosts = posts.filter(post =>
    post.titleEn.toLowerCase().includes(search.toLowerCase()) ||
    post.category?.toLowerCase().includes(search.toLowerCase())
  )

  const statusFilters = [
    { value: 'all', label: 'All Posts' },
    { value: 'draft', label: 'Drafts' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Management</h1>
          <p className="text-white/60 mt-1">Create and manage blog posts</p>
        </div>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Status Filters */}
        <div className="flex gap-2">
          {statusFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? 'bg-gold text-jet'
                  : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg
                     text-white placeholder:text-white/40 focus:outline-none focus:border-gold/50"
          />
        </div>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl">
          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No posts found</h3>
          <p className="text-white/60 mb-4">Get started by creating your first blog post</p>
          <Link href="/admin/blog/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-white/60">Post</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-white/60">Category</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-white/60">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-white/60">Date</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {post.coverImage ? (
                        <div className="w-16 h-12 relative rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={post.coverImage}
                            alt={post.titleEn}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-12 bg-white/10 rounded flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-white/30" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-medium line-clamp-1">{post.titleEn}</h3>
                        <p className="text-white/40 text-sm">/blog/{post.slug}</p>
                      </div>
                      {post.featured && (
                        <Star className="w-4 h-4 text-gold flex-shrink-0" fill="currentColor" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {post.category ? (
                      <span className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded">
                        {post.category}
                      </span>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs rounded font-medium ${
                      post.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : post.status === 'draft'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-white/10 text-white/50'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-white/60 text-sm">
                    {post.publishedAt ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-white/30">Not published</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleFeature(post.id, post.featured)}
                        className={`p-2 rounded hover:bg-white/10 transition-colors ${
                          post.featured ? 'text-gold' : 'text-white/40 hover:text-white'
                        }`}
                        title={post.featured ? 'Unfeature' : 'Feature'}
                      >
                        <Star className="w-4 h-4" fill={post.featured ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => handlePublish(post.id, post.status)}
                        className="p-2 text-white/40 hover:text-white rounded hover:bg-white/10 transition-colors"
                        title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        {post.status === 'published' ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="p-2 text-white/40 hover:text-white rounded hover:bg-white/10 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deleting === post.id}
                        className="p-2 text-white/40 hover:text-red-400 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
