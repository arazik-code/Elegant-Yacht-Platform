'use client'

// AI-Powered Search Component
// Natural language yacht search with suggestions

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useLocaleInfo } from '@/components/providers/LocaleProvider'
import { YachtCardData } from '@/lib/types'
import { cn } from '@/lib/utils'
import { YachtCard } from '@/components/yacht/YachtCard'

interface AISearchResult {
  yachts: YachtCardData[]
  filters: Record<string, any>
  explanation: string
  suggestions?: string[]
  totalResults: number
}

interface AISearchProps {
  className?: string
  variant?: 'hero' | 'header' | 'full'
  onSearch?: (results: AISearchResult) => void
  initialQuery?: string
}

export function AISearch({
  className,
  variant = 'full',
  onSearch,
  initialQuery = '',
}: AISearchProps) {
  const t = useTranslations('search')
  const { isRtl } = useLocaleInfo()
  const router = useRouter()

  const [query, setQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<AISearchResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Save search to recent
  const saveSearch = useCallback((searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }, [recentSearches])

  // Perform AI search
  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)
    setShowResults(true)
    saveSearch(searchQuery)

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setResults(data)
      onSearch?.(data)
    } catch (err) {
      setError(t('error') || 'Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

  // Handle suggestion click
  const handleSuggestion = (suggestion: string) => {
    // Check if suggestion is a path (starts with /)
    if (suggestion.startsWith('/')) {
      router.push(suggestion)
      setShowResults(false)
      return
    }

    setQuery(suggestion)
    handleSearch(suggestion)
  }

  // Handle clear
  const handleClear = () => {
    setQuery('')
    setResults(null)
    setShowResults(false)
    inputRef.current?.focus()
  }

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Example queries
  const exampleQueries = [
    'Family yacht under 10 million AED',
    'Charter a Majesty for 12 guests',
    '80ft yacht with jacuzzi',
    'Recent Sunseeker for sale',
  ]

  const exampleQueriesAr = [
    'يخت عائلي أقل من 10 مليون درهم',
    'استئجار ماجستي لـ 12 ضيف',
    'يخت 80 قدم مع جاكوزي',
    'سنسيكر حديث للبيع',
  ]

  // Hero variant - large search for homepage
  if (variant === 'hero') {
    return (
      <div className={cn('w-full max-w-2xl mx-auto', className)}>
        <div className="relative">
          <div className="flex items-center bg-white dark:bg-slate-950/90 backdrop-blur-sm rounded-full shadow-xl overflow-hidden border border-white/20 dark:border-white/10">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowResults(true)}
              placeholder={isRtl
                ? 'صف يختك المثالي...'
                : 'Describe your perfect yacht...'
              }
              className={cn(
                'flex-1 py-4 px-6 text-lg outline-none text-black dark:text-white bg-transparent placeholder:text-gray-500',
                isRtl && 'text-right'
              )}
              dir={isRtl ? 'rtl' : 'ltr'}
            />
            <button
              onClick={() => handleSearch()}
              disabled={isSearching || !query.trim()}
              className="h-full px-8 py-4 bg-gold text-white font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="hidden sm:inline">{isRtl ? 'بحث ذكي' : 'AI Search'}</span>
                </>
              )}
            </button>
          </div>

          {/* Example queries */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {(isRtl ? exampleQueriesAr : exampleQueries).map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestion(example)}
                className="px-3 py-1.5 text-sm bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>

          {/* Results Dropdown for Hero Variant */}
          <AnimatePresence>
            {showResults && (results || recentSearches.length > 0) && (
              <motion.div
                ref={resultsRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-4 bg-popover rounded-2xl shadow-2xl overflow-hidden z-50 border border-border text-left mx-auto max-w-2xl"
              >
                {results ? (
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-3">{results.explanation}</p>
                    {results.yachts.length > 0 ? (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {results.yachts.slice(0, 5).map((yacht) => (
                          <a
                            key={yacht.id}
                            href={`/yachts/${yacht.slug}`}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors group"
                          >
                            {yacht.media?.[0] && (
                              <img
                                src={yacht.media[0].url}
                                alt={yacht.title}
                                className="w-20 h-16 object-cover rounded-md group-hover:scale-105 transition-transform"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-foreground">{yacht.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {yacht.brand} • {yacht.lengthFeet}ft
                              </p>
                              <p className="text-xs text-gold mt-1">
                                {yacht.priceOnRequest ? 'Price on Request' : `${yacht.currency} ${yacht.price?.toLocaleString()}`}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No yachts found</p>
                    )}
                    {results.suggestions && results.suggestions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">Try:</p>
                        <div className="flex flex-wrap gap-2">
                          {results.suggestions.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => handleSuggestion(s)}
                              className="text-xs px-3 py-1.5 bg-muted rounded-full hover:bg-gold/20 transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      {isRtl ? 'عمليات البحث الأخيرة' : 'Recent searches'}
                    </p>
                    <div className="space-y-1">
                      {recentSearches.map((search, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestion(search)}
                          className="w-full text-left px-4 py-3 text-sm rounded-lg hover:bg-muted transition-colors text-foreground flex items-center justify-between group"
                        >
                          <span>{search}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // Header variant - compact search (collapsible)
  if (variant === 'header') {
    return (
      <div className={cn('relative', className)}>
        {!showResults && !query ? (
          <button
            onClick={() => setShowResults(true)}
            className="p-2.5 text-foreground/80 hover:text-gold hover:bg-muted rounded-full transition-all"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center bg-muted rounded-full border border-border"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              onBlur={() => {
                // Sligth delay to allow click on results
                setTimeout(() => {
                  if (!query) setShowResults(false)
                }, 200)
              }}
              placeholder={isRtl ? 'ابحث...' : 'Search...'}
              className={cn(
                'w-40 lg:w-64 py-2 px-4 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground',
                isRtl && 'text-right'
              )}
              dir={isRtl ? 'rtl' : 'ltr'}
            />
            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="p-2 text-muted-foreground hover:text-gold transition-colors border-l border-border/50"
            >
              {isSearching ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault()
                handleClear()
                setShowResults(false)
              }}
              className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}

        {/* Dropdown results */}
        <AnimatePresence>
          {showResults && (results || recentSearches.length > 0) && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 w-96 bg-popover rounded-xl shadow-2xl overflow-hidden z-50 border border-border"
            >
              {results ? (
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">{results.explanation}</p>
                  {results.yachts.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {results.yachts.slice(0, 5).map((yacht) => (
                        <a
                          key={yacht.id}
                          href={`/yachts/${yacht.slug}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          {yacht.media?.[0] && (
                            <img
                              src={yacht.media[0].url}
                              alt={yacht.title}
                              className="w-16 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium text-foreground">{yacht.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {yacht.brand} • {yacht.lengthFeet}ft
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No yachts found</p>
                  )}
                  {results.suggestions && results.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Try:</p>
                      <div className="flex flex-wrap gap-1">
                        {results.suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestion(s)}
                            className="text-xs px-2 py-1 bg-muted rounded-full hover:bg-gold/20 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-2">
                    {isRtl ? 'عمليات البحث الأخيرة' : 'Recent searches'}
                  </p>
                  <div className="space-y-1">
                    {recentSearches.map((search, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestion(search)}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-foreground"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Full variant - complete search page
  return (
    <div className={cn('w-full', className)}>
      {/* Search input */}
      <div className="relative mb-8">
        <div className="flex items-center bg-card border-2 border-border rounded-xl overflow-hidden focus-within:border-gold transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRtl
              ? 'صف ما تبحث عنه... مثال: "يخت ماجستي لـ 10 ضيوف أقل من 20 مليون"'
              : 'Describe what you\'re looking for... e.g., "Majesty yacht for 10 guests under 20 million"'
            }
            className={cn(
              'flex-1 py-4 px-6 text-lg outline-none text-foreground bg-transparent',
              isRtl && 'text-right'
            )}
            dir={isRtl ? 'rtl' : 'ltr'}
          />
          {query && (
            <button
              onClick={handleClear}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
            className="h-full px-8 py-4 bg-gold text-white font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{isRtl ? 'جاري البحث...' : 'Searching...'}</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>{isRtl ? 'بحث' : 'Search'}</span>
              </>
            )}
          </button>
        </div>

        {/* Quick examples */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-sm text-muted-foreground">
            {isRtl ? 'جرب:' : 'Try:'}
          </span>
          {(isRtl ? exampleQueriesAr : exampleQueries).map((example, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestion(example)}
              className="text-sm px-3 py-1 bg-muted text-muted-foreground rounded-full hover:bg-gold/20 hover:text-gold transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Explanation */}
          <div className="mb-6 p-4 bg-gold/10 rounded-lg relative overflow-hidden">
            {/* AI Badge */}
            <div className="absolute top-0 right-0 bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
              BIMO AI
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gold/20 rounded-lg">
                <svg className="h-5 w-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">{results.explanation}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isRtl
                    ? `تم العثور على ${results.totalResults} يخت`
                    : `Found ${results.totalResults} yacht${results.totalResults !== 1 ? 's' : ''}`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Applied filters */}
          {Object.keys(results.filters).length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">
                {isRtl ? 'الفلاتر المطبقة:' : 'Applied filters:'}
              </span>
              {Object.entries(results.filters).map(([key, value]) => (
                <span
                  key={key}
                  className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm rounded-full"
                >
                  {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                </span>
              ))}
            </div>
          )}

          {/* Yacht grid */}
          {results.yachts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.yachts.map((yacht) => (
                <YachtCard key={yacht.id} yacht={yacht} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {/* Only show 'No Found' icon if the explanation implies a search failure, 
                  otherwise if it's a Q&A answer, clean it up */}
              {results.explanation.includes('Sorry') || results.explanation.includes('No yachts') ? (
                <>
                  <svg className="h-16 w-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                    {isRtl ? 'لا توجد نتائج' : 'No yachts found'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isRtl
                      ? 'جرب تعديل البحث أو استخدم معايير مختلفة'
                      : 'Try adjusting your search or using different criteria'
                    }
                  </p>
                </>
              ) : (
                <div className="max-w-md mx-auto">
                  <p className="text-muted-foreground italic">
                    {isRtl ? 'آمل أن يكون هذا مفيدًا' : 'I hope this helps! Ask me anything else.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Suggestions */}
          {results.suggestions && results.suggestions.length > 0 && (
            <div className="mt-8 p-6 bg-muted/50 rounded-xl">
              <h4 className="font-semibold text-foreground mb-3">
                {isRtl ? 'عمليات بحث مقترحة' : 'Suggested searches'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {results.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestion(suggestion)}
                    className={cn(
                      "px-4 py-2 bg-card border border-border rounded-lg hover:border-gold hover:text-gold transition-colors flex items-center gap-2",
                      suggestion.startsWith('/') && "bg-gold/10 border-gold/50 text-gold"
                    )}
                  >
                    <span>{suggestion.startsWith('/') ? (
                      suggestion === '/sell-your-yacht' ? t('sellYacht') || 'Sell Your Yacht' :
                        suggestion === '/contact' ? t('contact') || 'Contact Us' :
                          suggestion
                    ) : suggestion}</span>

                    {suggestion.startsWith('/') && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRtl ? "M19 12H5m14 0l-4 4m4-4l-4-4" : "M5 12h14M12 5l7 7-7 7"} />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
