// Admin AI Settings Page - Recommendation Tuning & Cache Management

'use client'

import { useState, useEffect } from 'react'
import {
  Brain,
  Sparkles,
  Database,
  Trash2,
  Save,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sliders,
  Target,
  Shuffle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface RecommendationSettings {
  weights: {
    sameType: number
    similarPrice: number
    similarLength: number
    sameBrand: number
    similarYear: number
    similarGuests: number
  }
  minScore: number
  maxResults: number
  prioritizeFeatured: boolean
  diversifyBrands: boolean
}

interface CacheStats {
  search: { size: number; maxSize: number; ttlMinutes: number }
  similarity: { size: number; maxSize: number; ttlMinutes: number }
  description: { size: number; maxSize: number; ttlMinutes: number }
  total: number
}

const weightLabels: Record<keyof RecommendationSettings['weights'], { label: string; description: string }> = {
  sameType: {
    label: 'Same Type',
    description: 'How important is matching sale/charter type'
  },
  similarPrice: {
    label: 'Similar Price',
    description: 'Prioritize yachts in similar price range'
  },
  similarLength: {
    label: 'Similar Length',
    description: 'Match yachts of similar size'
  },
  sameBrand: {
    label: 'Same Brand',
    description: 'Recommend yachts from the same manufacturer'
  },
  similarYear: {
    label: 'Similar Year',
    description: 'Match yachts of similar age'
  },
  similarGuests: {
    label: 'Similar Capacity',
    description: 'Match yachts with similar guest capacity'
  },
}

export default function AdminAISettingsPage() {
  const [settings, setSettings] = useState<RecommendationSettings | null>(null)
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch initial settings and cache stats
  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/ai-settings')
      const data = await response.json()

      if (data.success) {
        setSettings(data.settings)
        setCacheStats(data.cacheStats)
      }
    } catch (error) {
      console.error('Failed to fetch AI settings:', error)
      setMessage({ type: 'error', text: 'Failed to load AI settings' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Save settings
  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/ai-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'AI settings saved successfully!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  // Clear cache
  const handleClearCache = async (type: 'search' | 'similarity' | 'description' | 'all') => {
    setClearing(type)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/ai-settings?type=${type}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setCacheStats(data.cacheStats)
        setMessage({ type: 'success', text: data.message })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to clear cache' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setClearing(null)
    }
  }

  // Update weight value
  const updateWeight = (key: keyof RecommendationSettings['weights'], value: number) => {
    if (!settings) return
    setSettings({
      ...settings,
      weights: { ...settings.weights, [key]: value }
    })
  }

  // Reset to defaults
  const resetToDefaults = () => {
    setSettings({
      weights: {
        sameType: 8,
        similarPrice: 7,
        similarLength: 6,
        sameBrand: 5,
        similarYear: 4,
        similarGuests: 5,
      },
      minScore: 15,
      maxResults: 6,
      prioritizeFeatured: true,
      diversifyBrands: true,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <Brain className="w-7 h-7 text-gold" />
          AI & Recommendations
        </h1>
        <p className="text-white/60 mt-1">
          Configure AI-powered search and recommendation settings
        </p>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${message.type === 'success'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Cache Statistics */}
      <section className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-gold" />
            AI Cache Statistics
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            className="text-white/60 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {cacheStats && (
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search Cache */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Search Cache</span>
                <span className="text-xs text-gold/80">{cacheStats.search.ttlMinutes}min TTL</span>
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {cacheStats.search.size} / {cacheStats.search.maxSize}
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gold h-2 rounded-full transition-all"
                  style={{ width: `${(cacheStats.search.size / cacheStats.search.maxSize) * 100}%` }}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClearCache('search')}
                disabled={clearing === 'search'}
                className="mt-3 text-red-400 hover:text-red-300 text-xs"
              >
                {clearing === 'search' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Clear
              </Button>
            </div>

            {/* Similarity Cache */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Similarity Cache</span>
                <span className="text-xs text-gold/80">{cacheStats.similarity.ttlMinutes}min TTL</span>
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {cacheStats.similarity.size} / {cacheStats.similarity.maxSize}
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(cacheStats.similarity.size / cacheStats.similarity.maxSize) * 100}%` }}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClearCache('similarity')}
                disabled={clearing === 'similarity'}
                className="mt-3 text-red-400 hover:text-red-300 text-xs"
              >
                {clearing === 'similarity' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Clear
              </Button>
            </div>

            {/* Description Cache */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/60">Description Cache</span>
                <span className="text-xs text-gold/80">{cacheStats.description.ttlMinutes}min TTL</span>
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {cacheStats.description.size} / {cacheStats.description.maxSize}
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${(cacheStats.description.size / cacheStats.description.maxSize) * 100}%` }}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClearCache('description')}
                disabled={clearing === 'description'}
                className="mt-3 text-red-400 hover:text-red-300 text-xs"
              >
                {clearing === 'description' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Clear
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-sm text-white/60">
            Total cached items: <strong className="text-white">{cacheStats?.total || 0}</strong>
          </span>
          <Button
            variant="ghost"
            onClick={() => handleClearCache('all')}
            disabled={clearing === 'all'}
            className="text-red-400 hover:text-red-300"
          >
            {clearing === 'all' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Clear All Caches
          </Button>
        </div>
      </section>

      {/* Recommendation Weights */}
      {settings && (
        <section className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-gold" />
              Recommendation Weights
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefaults}
              className="text-white/60 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Defaults
            </Button>
          </div>

          <p className="text-sm text-white/60">
            Adjust how similar yachts are calculated. Higher weights mean that factor is more important.
          </p>

          <div className="space-y-4">
            {(Object.keys(settings.weights) as Array<keyof RecommendationSettings['weights']>).map((key) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white">
                      {weightLabels[key].label}
                    </label>
                    <p className="text-xs text-white/50">{weightLabels[key].description}</p>
                  </div>
                  <span className="text-lg font-bold text-gold w-8 text-right">
                    {settings.weights[key]}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={settings.weights[key]}
                  onChange={(e) => updateWeight(key, parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
                />
                <div className="flex justify-between text-xs text-white/40">
                  <span>0 (ignore)</span>
                  <span>10 (critical)</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Advanced Settings */}
      {settings && (
        <section className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-gold" />
            Advanced Settings
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Min Score */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Minimum Similarity Score
              </label>
              <p className="text-xs text-white/50">
                Only show yachts with score above this threshold
              </p>
              <input
                type="number"
                min="0"
                max="50"
                value={settings.minScore}
                onChange={(e) => setSettings({ ...settings, minScore: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>

            {/* Max Results */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Maximum Results
              </label>
              <p className="text-xs text-white/50">
                Number of similar yachts to display
              </p>
              <input
                type="number"
                min="1"
                max="12"
                value={settings.maxResults}
                onChange={(e) => setSettings({ ...settings, maxResults: parseInt(e.target.value) || 6 })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
              />
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-4">
            {/* Prioritize Featured */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex-1">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" />
                  Prioritize Featured Yachts
                </label>
                <p className="text-xs text-white/50 mt-1">
                  Boost featured yachts in recommendation results
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.prioritizeFeatured}
                  onChange={(e) => setSettings({ ...settings, prioritizeFeatured: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
              </label>
            </div>

            {/* Diversify Brands */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex-1">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-blue-400" />
                  Diversify Brands
                </label>
                <p className="text-xs text-white/50 mt-1">
                  Limit yachts from the same brand to show more variety
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.diversifyBrands}
                  onChange={(e) => setSettings({ ...settings, diversifyBrands: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
              </label>
            </div>
          </div>
        </section>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save AI Settings
            </>
          )}
        </Button>
      </div>

      {/* AI Info */}
      <section className="bg-gold/10 border border-gold/30 p-6 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold" />
          About AI Features
        </h2>
        <div className="text-sm text-white/70 space-y-2">
          <p>
            <strong className="text-white">Natural Language Search:</strong> Users can search with queries like
            "50ft yacht under 2M for family" and the AI will understand their intent.
          </p>
          <p>
            <strong className="text-white">Smart Recommendations:</strong> Similar yachts are calculated based
            on the weights you configure above. The algorithm scores each yacht and shows the best matches.
          </p>
          <p>
            <strong className="text-white">AI-Generated Descriptions:</strong> Yacht descriptions can be
            automatically generated using AI for consistent, professional copy.
          </p>
          <p className="text-xs text-white/50 mt-4">
            Powered by Google Gemini (Flash 1.5). All AI responses are cached to minimize API costs.
          </p>
        </div>
      </section>
    </div>
  )
}
