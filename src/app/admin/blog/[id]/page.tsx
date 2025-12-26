// Admin Blog Post Editor

'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Save,
  ArrowLeft,
  Eye,
  Image as ImageIcon,
  X,
  Upload,
  Globe,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

interface BlogMedia {
  id: string
  url: string
  alt: string
  type: string
}

interface BlogPost {
  id: string
  slug: string
  titleEn: string
  titleAr?: string
  excerptEn?: string
  excerptAr?: string
  contentEn: string
  contentAr?: string
  coverImage?: string
  coverImageAlt?: string
  metaTitleEn?: string
  metaTitleAr?: string
  metaDescriptionEn?: string
  metaDescriptionAr?: string
  category?: string
  tags: string[]
  sources: string[]
  status: string
  featured: boolean
  authorName?: string
  media?: BlogMedia[]
}

const CATEGORIES = [
  { value: '', label: 'No Category' },
  { value: 'news', label: 'News' },
  { value: 'guides', label: 'Buying Guides' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'yachts', label: 'Featured Yachts' },
  { value: 'events', label: 'Events' },
]

export default function BlogEditorPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const isNew = id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'media'>('content')
  const [tagInput, setTagInput] = useState('')
  const [sourceInput, setSourceInput] = useState('')
  const [postMedia, setPostMedia] = useState<BlogMedia[]>([])

  const [form, setForm] = useState<Partial<BlogPost>>({
    slug: '',
    titleEn: '',
    titleAr: '',
    excerptEn: '',
    excerptAr: '',
    contentEn: '',
    contentAr: '',
    coverImage: '',
    coverImageAlt: '',
    metaTitleEn: '',
    metaTitleAr: '',
    metaDescriptionEn: '',
    metaDescriptionAr: '',
    category: '',
    tags: [],
    sources: [],
    status: 'draft',
    featured: false,
    authorName: '',
  })

  useEffect(() => {
    if (!isNew) {
      fetchPost()
    }
  }, [id, isNew])

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/admin/blog/${id}`)
      if (res.ok) {
        const data = await res.json()
        setForm(data.post)
        if (data.post.media) {
          setPostMedia(data.post.media)
        }
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const generateSlug = () => {
    if (form.titleEn) {
      const slug = form.titleEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      handleChange('slug', slug)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !form.tags?.includes(tagInput.trim())) {
      handleChange('tags', [...(form.tags || []), tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    handleChange('tags', form.tags?.filter(t => t !== tag) || [])
  }

  const addSource = () => {
    if (sourceInput.trim()) {
      handleChange('sources', [...(form.sources || []), sourceInput.trim()])
      setSourceInput('')
    }
  }

  const removeSource = (index: number) => {
    const newSources = [...(form.sources || [])]
    newSources.splice(index, 1)
    handleChange('sources', newSources)
  }

  const handleAiGenerate = async () => {
    if (!form.titleEn) {
      alert('Please enter a title first')
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/admin/ai/blog-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.titleEn,
          category: form.category,
          tags: form.tags,
        })
      })

      if (res.ok) {
        const data = await res.json()
        handleChange('contentEn', data.content)
      } else {
        alert('Failed to generate content')
      }
    } catch (error) {
      console.error('AI generation failed:', error)
      alert('Failed to generate content')
    } finally {
      setGenerating(false)
    }
  }

  const handlePostMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (isNew) {
      alert('Please save the post first before adding inline media')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`/api/admin/blog/${id}/media`, {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        setPostMedia(prev => [data.media, ...prev])
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        handleChange('coverImage', data.url)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleSave = async (publish = false) => {
    setSaving(true)

    const payload = {
      ...form,
      status: publish ? 'published' : form.status,
    }

    try {
      const url = isNew ? '/api/admin/blog' : `/api/admin/blog/${id}`
      const method = isNew ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push('/admin/blog')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save post')
      }
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">
            {isNew ? 'New Blog Post' : 'Edit Post'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {form.status === 'published' && (
            <a
              href={`/blog/${form.slug}`}
              target="_blank"
              className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5"
            >
              <Eye className="w-5 h-5" />
            </a>
          )}
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10">
        {[
          { id: 'content', label: 'Content' },
          { id: 'seo', label: 'SEO & Meta' },
          { id: 'media', label: 'Media' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab.id
              ? 'border-gold text-gold'
              : 'border-transparent text-white/60 hover:text-white'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">English Content</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAiGenerate}
                  disabled={generating || !form.titleEn}
                  className="text-gold border-gold/20 hover:bg-gold/10"
                >
                  {generating ? 'Start Writing...' : '✨ Generate with AI'}
                </Button>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Title</label>
                <Input
                  value={form.titleEn || ''}
                  onChange={(e) => handleChange('titleEn', e.target.value)}
                  placeholder="Post title"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Slug</label>
                <div className="flex gap-2">
                  <Input
                    value={form.slug || ''}
                    onChange={(e) => handleChange('slug', e.target.value)}
                    placeholder="post-url-slug"
                  />
                  <Button variant="outline" onClick={generateSlug}>
                    Generate
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Excerpt</label>
                <Textarea
                  value={form.excerptEn || ''}
                  onChange={(e) => handleChange('excerptEn', e.target.value)}
                  placeholder="Brief summary of the post..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Content (Markdown supported)</label>
                <div className="relative">
                  <Textarea
                    value={form.contentEn || ''}
                    onChange={(e) => handleChange('contentEn', e.target.value)}
                    placeholder="Write your post content here..."
                    rows={20}
                    className="font-mono text-sm leading-relaxed"
                  />
                  <div className="absolute top-2 right-2 text-xs text-white/20">
                    Markdown Enabled
                  </div>
                </div>
              </div>

              {/* Sources Section */}
              <div className="border-t border-white/10 pt-4">
                <label className="block text-sm text-white/60 mb-2">Sources / References</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={sourceInput}
                      onChange={(e) => setSourceInput(e.target.value)}
                      placeholder="https://example.com/source"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSource())}
                    />
                    <Button variant="outline" onClick={addSource}>Add</Button>
                  </div>

                  {form.sources && form.sources.length > 0 && (
                    <ul className="space-y-1">
                      {form.sources.map((source, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-white/60 bg-white/5 px-3 py-1.5 rounded">
                          <span className="flex-1 truncate">{source}</span>
                          <button onClick={() => removeSource(idx)} className="text-white/40 hover:text-red-400">
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Arabic Content */}
            <div className="bg-white/5 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Arabic Content (Optional)
              </h2>

              <div>
                <label className="block text-sm text-white/60 mb-1">Title (Arabic)</label>
                <Input
                  value={form.titleAr || ''}
                  onChange={(e) => handleChange('titleAr', e.target.value)}
                  placeholder="عنوان المقال"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Excerpt (Arabic)</label>
                <Textarea
                  value={form.excerptAr || ''}
                  onChange={(e) => handleChange('excerptAr', e.target.value)}
                  placeholder="ملخص قصير..."
                  rows={2}
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Content (Arabic)</label>
                <Textarea
                  value={form.contentAr || ''}
                  onChange={(e) => handleChange('contentAr', e.target.value)}
                  placeholder="اكتب محتوى المقال هنا..."
                  rows={10}
                  dir="rtl"
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing */}
            <div className="bg-white/5 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-white">Publishing</h3>

              <div>
                <label className="block text-sm text-white/60 mb-1">Status</label>
                <select
                  value={form.status || 'draft'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                           text-white focus:outline-none focus:border-gold/50"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured || false}
                  onChange={(e) => handleChange('featured', e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 text-gold focus:ring-gold/50"
                />
                <span className="text-white/80">Featured post</span>
              </label>

              <div>
                <label className="block text-sm text-white/60 mb-1">Author Name</label>
                <Input
                  value={form.authorName || ''}
                  onChange={(e) => handleChange('authorName', e.target.value)}
                  placeholder="Author name"
                />
              </div>
            </div>

            {/* Category & Tags */}
            <div className="bg-white/5 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-white">Category & Tags</h3>

              <div>
                <label className="block text-sm text-white/60 mb-1">Category</label>
                <select
                  value={form.category || ''}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                           text-white focus:outline-none focus:border-gold/50"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                  />
                  <Button variant="outline" onClick={addTag}>
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.tags?.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gold/20 text-gold text-sm rounded"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white/5 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">SEO Settings (English)</h2>

            <div>
              <label className="block text-sm text-white/60 mb-1">Meta Title</label>
              <Input
                value={form.metaTitleEn || ''}
                onChange={(e) => handleChange('metaTitleEn', e.target.value)}
                placeholder="SEO title (leave blank to use post title)"
              />
              <p className="text-xs text-white/40 mt-1">
                {(form.metaTitleEn || form.titleEn || '').length}/60 characters
              </p>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Meta Description</label>
              <Textarea
                value={form.metaDescriptionEn || ''}
                onChange={(e) => handleChange('metaDescriptionEn', e.target.value)}
                placeholder="SEO description (leave blank to use excerpt)"
                rows={3}
              />
              <p className="text-xs text-white/40 mt-1">
                {(form.metaDescriptionEn || form.excerptEn || '').length}/160 characters
              </p>
            </div>

            {/* Preview */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-white/60 mb-2">Search Preview</p>
              <div className="p-4 bg-white rounded-lg">
                <p className="text-blue-600 text-lg hover:underline truncate">
                  {form.metaTitleEn || form.titleEn || 'Post Title'}
                </p>
                <p className="text-green-700 text-sm">
                  bimoyacht.com/blog/{form.slug || 'post-slug'}
                </p>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {form.metaDescriptionEn || form.excerptEn || 'Post description will appear here...'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Globe className="w-5 h-5" />
              SEO Settings (Arabic)
            </h2>

            <div>
              <label className="block text-sm text-white/60 mb-1">Meta Title (Arabic)</label>
              <Input
                value={form.metaTitleAr || ''}
                onChange={(e) => handleChange('metaTitleAr', e.target.value)}
                placeholder="عنوان SEO"
                dir="rtl"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Meta Description (Arabic)</label>
              <Textarea
                value={form.metaDescriptionAr || ''}
                onChange={(e) => handleChange('metaDescriptionAr', e.target.value)}
                placeholder="وصف SEO"
                rows={3}
                dir="rtl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Media Tab */}
      {activeTab === 'media' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white/5 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Cover Image</h2>

            {form.coverImage ? (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={form.coverImage}
                  alt={form.coverImageAlt || 'Cover'}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => handleChange('coverImage', '')}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-gold/50 transition-colors">
                <Upload className="w-10 h-10 text-white/40 mb-2" />
                <span className="text-white/60">Click to upload cover image</span>
                <span className="text-white/40 text-sm">Recommended: 1200x630px</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}

            <div>
              <label className="block text-sm text-white/60 mb-1">Image Alt Text</label>
              <Input
                value={form.coverImageAlt || ''}
                onChange={(e) => handleChange('coverImageAlt', e.target.value)}
                placeholder="Describe the image for accessibility..."
              />
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Inline Media Manager</h2>
              <div className="text-xs text-white/40">
                {!isNew ? 'Upload images to use in your content' : 'Save post to enable uploads'}
              </div>
            </div>

            {!isNew && (
              <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-gold/30 hover:bg-gold/5 transition-colors">
                <div className="text-center">
                  <Upload className="w-6 h-6 text-gold mx-auto mb-2" />
                  <span className="text-sm text-white/60">Upload Content Image</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePostMediaUpload}
                  className="hidden"
                />
              </label>
            )}

            {postMedia.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {postMedia.map((media) => (
                  <div key={media.id} className="relative group bg-black/20 rounded-lg p-2">
                    <div className="aspect-video relative rounded overflow-hidden mb-2 bg-black">
                      <Image
                        src={media.url}
                        alt={media.alt || 'Media'}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] bg-black/50 p-1.5 rounded flex-1 truncate text-white/70 font-mono">
                        ![{media.alt || 'Image'}]({media.url})
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`![${media.alt || 'Image'}]({media.url})`)
                          alert('Markdown copied to clipboard!')
                        }}
                        className="p-1.5 bg-gold/10 text-gold rounded hover:bg-gold hover:text-jet transition-colors"
                        title="Copy Markdown"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/20 text-sm">
                No inline media uploaded yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
