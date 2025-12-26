// Global 404 Page

import Link from 'next/link'
import { Ship, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-jet flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center
                     bg-gold/10 border border-gold/30 rounded-full">
          <Ship className="w-12 h-12 text-gold" />
        </div>
        
        <h1 className="text-display-sm font-display font-bold text-white mb-4">
          Page Not Found
        </h1>
        
        <p className="text-white/60 mb-8">
          The page you're looking for seems to have sailed away. 
          Let's get you back on course.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild variant="secondary">
            <Link href="/">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="primary">
            <Link href="/yachts">
              <Ship className="w-4 h-4" />
              Browse Yachts
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
