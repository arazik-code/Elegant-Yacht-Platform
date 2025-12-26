// Global Loading State with Skeleton Animation

export default function Loading() {
  return (
    <div className="min-h-screen bg-jet">
      {/* Header skeleton */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-jet/95 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
          <div className="hidden md:flex items-center gap-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-4 w-16 bg-white/10 rounded animate-pulse" />
            ))}
          </div>
          <div className="h-10 w-24 bg-gold/20 rounded animate-pulse" />
        </div>
      </header>

      {/* Main content skeleton */}
      <main className="pt-20">
        {/* Hero skeleton */}
        <div className="h-[60vh] bg-gradient-to-br from-white/5 to-white/[0.02] animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="h-12 w-64 mx-auto bg-white/10 rounded animate-pulse" />
              <div className="h-6 w-96 mx-auto bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white/5 rounded-2xl overflow-hidden">
                <div className="aspect-[4/3] bg-white/10 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-6 w-3/4 bg-white/10 rounded animate-pulse" />
                  <div className="flex gap-4">
                    <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-1/2 bg-gold/20 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Loading indicator overlay */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="bg-jet/90 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 shadow-lg">
          <div className="w-4 h-4 relative">
            <div className="absolute inset-0 border-2 border-gold/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-white/70 text-sm">Loading...</span>
        </div>
      </div>
    </div>
  )
}
