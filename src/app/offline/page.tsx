// Offline Fallback Page
// Displayed when user is offline and page is not cached

'use client'

import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-jet flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Offline icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto relative">
            <svg
              className="w-full h-full text-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
            {/* Animated pulse ring */}
            <div className="absolute inset-0 border-2 border-gold/20 rounded-full animate-ping" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-white/60 mb-8 leading-relaxed">
          It looks like you've lost your internet connection. Please check your 
          network settings and try again. Some pages you've visited before may 
          still be available.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gold text-jet font-semibold py-3 px-6 rounded-lg hover:bg-gold/90 transition-colors"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="block w-full bg-white/10 text-white font-semibold py-3 px-6 rounded-lg hover:bg-white/20 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>

        {/* Cached pages hint */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-white/40 text-sm mb-4">
            Previously visited pages that may be available:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { href: '/yachts', label: 'Yachts' },
              { href: '/charter', label: 'Charter' },
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' },
            ].map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="px-3 py-1 text-sm text-white/60 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
              >
                {page.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Decorative wave */}
        <div className="mt-12 opacity-20">
          <svg
            className="w-full h-8"
            viewBox="0 0 400 30"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              className="text-gold"
              d="M0,15 C100,25 200,5 300,15 C350,20 375,20 400,15 L400,30 L0,30 Z"
            >
              <animate
                attributeName="d"
                values="M0,15 C100,25 200,5 300,15 C350,20 375,20 400,15 L400,30 L0,30 Z;M0,15 C100,5 200,25 300,15 C350,10 375,10 400,15 L400,30 L0,30 Z;M0,15 C100,25 200,5 300,15 C350,20 375,20 400,15 L400,30 L0,30 Z"
                dur="4s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>
      </div>
    </div>
  )
}
