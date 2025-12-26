// Webhooks Service
// Send webhooks on key events

import crypto from 'crypto'

interface WebhookPayload {
  event: string
  timestamp: string
  data: any
}

interface WebhookConfig {
  url: string
  secret: string
  events: string[]
}

// Get webhook configurations from environment
function getWebhookConfigs(): WebhookConfig[] {
  const configStr = process.env.WEBHOOK_CONFIGS
  if (!configStr) return []
  
  try {
    return JSON.parse(configStr)
  } catch {
    console.error('Invalid WEBHOOK_CONFIGS format')
    return []
  }
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

/**
 * Send webhook to a single endpoint
 */
async function sendWebhook(
  config: WebhookConfig,
  payload: WebhookPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const body = JSON.stringify(payload)
    const signature = generateSignature(body, config.secret)
    
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Timestamp': payload.timestamp,
      },
      body,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error(`Webhook failed: ${config.url}`, error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Trigger webhooks for an event
 */
export async function triggerWebhooks(event: string, data: any): Promise<void> {
  const configs = getWebhookConfigs()
  
  // Filter configs that subscribe to this event
  const relevantConfigs = configs.filter(
    c => c.events.includes('*') || c.events.includes(event)
  )
  
  if (relevantConfigs.length === 0) return
  
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  }
  
  // Send webhooks in parallel
  const results = await Promise.all(
    relevantConfigs.map(config => sendWebhook(config, payload))
  )
  
  // Log results
  const failures = results.filter(r => !r.success)
  if (failures.length > 0) {
    console.error(`${failures.length}/${results.length} webhooks failed for event: ${event}`)
  }
}

// Webhook event types
export const WebhookEvents = {
  // Yacht events
  YACHT_CREATED: 'yacht.created',
  YACHT_UPDATED: 'yacht.updated',
  YACHT_DELETED: 'yacht.deleted',
  YACHT_PUBLISHED: 'yacht.published',
  YACHT_SOLD: 'yacht.sold',
  
  // Inquiry events
  INQUIRY_CREATED: 'inquiry.created',
  INQUIRY_STATUS_CHANGED: 'inquiry.status_changed',
  
  // Charter events
  CHARTER_BOOKING: 'charter.booking',
  
  // User events
  USER_REGISTERED: 'user.registered',
} as const

export type WebhookEvent = typeof WebhookEvents[keyof typeof WebhookEvents]
