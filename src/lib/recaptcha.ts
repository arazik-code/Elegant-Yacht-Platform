// reCAPTCHA v3 Verification
// Server-side verification for form submissions

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

interface RecaptchaVerifyResponse {
  success: boolean
  score?: number
  action?: string
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
}

/**
 * Verify reCAPTCHA token
 */
export async function verifyRecaptcha(
  token: string,
  expectedAction?: string,
  minScore: number = 0.5
): Promise<{ valid: boolean; score?: number; error?: string }> {
  // Skip verification if secret key is not configured
  if (!RECAPTCHA_SECRET_KEY) {
    console.warn('reCAPTCHA secret key not configured')
    return { valid: true }
  }
  
  if (!token) {
    return { valid: false, error: 'No reCAPTCHA token provided' }
  }
  
  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
      }),
    })
    
    const data: RecaptchaVerifyResponse = await response.json()
    
    if (!data.success) {
      return {
        valid: false,
        error: data['error-codes']?.join(', ') || 'Verification failed',
      }
    }
    
    // Check action if specified
    if (expectedAction && data.action !== expectedAction) {
      return {
        valid: false,
        score: data.score,
        error: 'Action mismatch',
      }
    }
    
    // Check score
    if (data.score !== undefined && data.score < minScore) {
      return {
        valid: false,
        score: data.score,
        error: 'Score too low',
      }
    }
    
    return {
      valid: true,
      score: data.score,
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return { valid: false, error: 'Verification request failed' }
  }
}

/**
 * Client-side script URL
 */
export const RECAPTCHA_SCRIPT_URL = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`
