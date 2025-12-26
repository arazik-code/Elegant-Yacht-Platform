// Admin Webhooks Management API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// GET /api/admin/webhooks - List webhook configurations
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get webhook configs from environment
    const configStr = process.env.WEBHOOK_CONFIGS
    let configs: any[] = []
    
    if (configStr) {
      try {
        configs = JSON.parse(configStr).map((c: any) => ({
          ...c,
          secret: '********', // Hide secret
        }))
      } catch {
        // Invalid config
      }
    }
    
    return NextResponse.json({
      webhooks: configs,
      availableEvents: [
        'yacht.created',
        'yacht.updated',
        'yacht.deleted',
        'yacht.published',
        'yacht.sold',
        'inquiry.created',
        'inquiry.status_changed',
        'charter.booking',
        'user.registered',
        '*',
      ],
    })
    
  } catch (error) {
    console.error('Webhooks list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    )
  }
}

// POST /api/admin/webhooks/test - Test a webhook
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { url, event } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }
    
    // Send test webhook
    const testPayload = {
      event: event || 'test',
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        message: 'This is a test webhook from Bimo Yacht',
      },
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': testPayload.event,
          'X-Webhook-Timestamp': testPayload.timestamp,
        },
        body: JSON.stringify(testPayload),
      })
      
      return NextResponse.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
      })
      
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
      })
    }
    
  } catch (error) {
    console.error('Webhook test error:', error)
    return NextResponse.json(
      { error: 'Failed to test webhook' },
      { status: 500 }
    )
  }
}
