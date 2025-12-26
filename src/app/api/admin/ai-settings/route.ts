import { NextRequest, NextResponse } from 'next/server'
import { 
  getRecommendationSettings, 
  updateRecommendationSettings,
  getAICacheStats,
  clearAICache,
  RecommendationSettings 
} from '@/lib/ai-search'

// GET - Retrieve current AI settings and cache stats
export async function GET() {
  try {
    const settings = getRecommendationSettings()
    const cacheStats = getAICacheStats()
    
    return NextResponse.json({
      success: true,
      settings,
      cacheStats,
    })
  } catch (error) {
    console.error('Failed to get AI settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve AI settings' },
      { status: 500 }
    )
  }
}

// PUT - Update AI recommendation settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body as { settings: Partial<RecommendationSettings> }
    
    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'Settings are required' },
        { status: 400 }
      )
    }
    
    const updatedSettings = updateRecommendationSettings(settings)
    
    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: 'AI settings updated successfully'
    })
  } catch (error) {
    console.error('Failed to update AI settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update AI settings' },
      { status: 500 }
    )
  }
}

// DELETE - Clear AI cache
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cacheType = searchParams.get('type') as 'search' | 'similarity' | 'description' | 'all' | null
    
    clearAICache(cacheType || 'all')
    
    const cacheStats = getAICacheStats()
    
    return NextResponse.json({
      success: true,
      message: `Cache${cacheType && cacheType !== 'all' ? ` (${cacheType})` : ''} cleared successfully`,
      cacheStats,
    })
  } catch (error) {
    console.error('Failed to clear cache:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}
