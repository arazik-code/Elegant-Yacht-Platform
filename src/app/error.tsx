// Global Error Page

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])
  
  return (
    <main className="min-h-screen bg-jet flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center
                     bg-red-500/10 border border-red-500/30 rounded-full">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        
        <h1 className="text-display-sm font-display font-bold text-white mb-4">
          Something Went Wrong
        </h1>
        
        <p className="text-white/60 mb-8">
          We encountered an unexpected error. Please try again or contact us if the problem persists.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={reset} variant="secondary">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button asChild variant="primary">
            <Link href="/">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
        </div>
        
        {error.digest && (
          <p className="mt-8 text-white/30 text-sm">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </main>
  )
}
