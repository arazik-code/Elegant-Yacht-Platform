// Admin Security Dashboard - Rate Limiting & Security Monitoring

'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  CheckCircle, 
  RefreshCw, 
  Loader2,
  Activity,
  Lock,
  Globe,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface SecurityStats {
  rateLimiting: {
    activeEntries: number
    blockedIPs: number
    recentViolations: number
  }
  recaptcha: {
    enabled: boolean
    verifiedToday: number
    blockedToday: number
  }
  requests: {
    total24h: number
    blocked24h: number
    suspicious24h: number
  }
}

export default function AdminSecurityPage() {
  const [stats, setStats] = useState<SecurityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/admin/security/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch security stats:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  // Default stats for display when API not implemented
  const displayStats = stats || {
    rateLimiting: { activeEntries: 0, blockedIPs: 0, recentViolations: 0 },
    recaptcha: { enabled: !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, verifiedToday: 0, blockedToday: 0 },
    requests: { total24h: 0, blocked24h: 0, suspicious24h: 0 },
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-gold" />
            Security Dashboard
          </h1>
          <p className="text-white/60 mt-1">
            Monitor rate limiting, security events, and protection status
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={fetchStats}
          disabled={refreshing}
          className="text-white/60 hover:text-white"
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Security Status Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* Rate Limiting Status */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Rate Limiting</p>
              <p className="text-lg font-bold text-green-400">Active</p>
            </div>
          </div>
          <p className="text-xs text-white/50">
            Protecting all API endpoints
          </p>
        </div>

        {/* CSP Status */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">CSP Headers</p>
              <p className="text-lg font-bold text-green-400">Enabled</p>
            </div>
          </div>
          <p className="text-xs text-white/50">
            Content-Security-Policy active
          </p>
        </div>

        {/* reCAPTCHA Status */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              displayStats.recaptcha.enabled ? 'bg-green-500/20' : 'bg-yellow-500/20'
            }`}>
              <Shield className={`w-5 h-5 ${
                displayStats.recaptcha.enabled ? 'text-green-400' : 'text-yellow-400'
              }`} />
            </div>
            <div>
              <p className="text-sm text-white/60">reCAPTCHA v3</p>
              <p className={`text-lg font-bold ${
                displayStats.recaptcha.enabled ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {displayStats.recaptcha.enabled ? 'Enabled' : 'Not Configured'}
              </p>
            </div>
          </div>
          <p className="text-xs text-white/50">
            {displayStats.recaptcha.enabled ? 'Form protection active' : 'Set RECAPTCHA keys in .env'}
          </p>
        </div>

        {/* Cloudflare Status */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">Cloudflare</p>
              <p className="text-lg font-bold text-blue-400">Compatible</p>
            </div>
          </div>
          <p className="text-xs text-white/50">
            CF-Connecting-IP detection ready
          </p>
        </div>
      </div>

      {/* Rate Limiting Details */}
      <section className="bg-white/5 border border-white/10 p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-gold" />
          Rate Limiting Configuration
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* API Rate Limit */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-sm font-medium text-white mb-2">General API</h3>
            <p className="text-2xl font-bold text-gold">100</p>
            <p className="text-xs text-white/50">requests/minute</p>
            <p className="text-xs text-white/40 mt-2">Block after 5 violations</p>
          </div>

          {/* Form Rate Limit */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-sm font-medium text-white mb-2">Form Submissions</h3>
            <p className="text-2xl font-bold text-gold">5</p>
            <p className="text-xs text-white/50">requests/minute</p>
            <p className="text-xs text-white/40 mt-2">Block after 3 violations (1hr)</p>
          </div>

          {/* AI Search Rate Limit */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-sm font-medium text-white mb-2">AI Search</h3>
            <p className="text-2xl font-bold text-gold">20</p>
            <p className="text-xs text-white/50">requests/minute</p>
            <p className="text-xs text-white/40 mt-2">Block after 10 violations</p>
          </div>

          {/* Auth Rate Limit */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-sm font-medium text-white mb-2">Authentication</h3>
            <p className="text-2xl font-bold text-gold">5</p>
            <p className="text-xs text-white/50">requests/minute</p>
            <p className="text-xs text-white/40 mt-2">Block after 3 violations (30min)</p>
          </div>

          {/* Admin Rate Limit */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-sm font-medium text-white mb-2">Admin Actions</h3>
            <p className="text-2xl font-bold text-gold">50</p>
            <p className="text-xs text-white/50">requests/minute</p>
            <p className="text-xs text-white/40 mt-2">Block after 10 violations</p>
          </div>

          {/* Sensitive Admin Rate Limit */}
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <h3 className="text-sm font-medium text-white mb-2">Sensitive Operations</h3>
            <p className="text-2xl font-bold text-gold">20</p>
            <p className="text-xs text-white/50">requests/minute</p>
            <p className="text-xs text-white/40 mt-2">Block after 5 violations (15min)</p>
          </div>
        </div>
      </section>

      {/* Security Headers */}
      <section className="bg-white/5 border border-white/10 p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-gold" />
          Security Headers
        </h2>

        <div className="space-y-3">
          {[
            { name: 'Content-Security-Policy', status: 'Enabled', description: 'Restricts resource loading to trusted sources' },
            { name: 'X-Frame-Options', status: 'DENY', description: 'Prevents clickjacking attacks' },
            { name: 'X-Content-Type-Options', status: 'nosniff', description: 'Prevents MIME type sniffing' },
            { name: 'Strict-Transport-Security', status: 'Enabled', description: 'Forces HTTPS connections' },
            { name: 'Referrer-Policy', status: 'strict-origin-when-cross-origin', description: 'Controls referrer information' },
            { name: 'Permissions-Policy', status: 'Restricted', description: 'Limits browser feature access' },
          ].map((header, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">{header.name}</p>
                <p className="text-xs text-white/50">{header.description}</p>
              </div>
              <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
                {header.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Bot Protection */}
      <section className="bg-white/5 border border-white/10 p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
          <Ban className="w-5 h-5 text-gold" />
          Bot Protection
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-white mb-3">Detection Methods</h3>
            <ul className="space-y-2">
              {[
                'User-Agent analysis',
                'Honeypot fields on forms',
                'reCAPTCHA v3 scoring',
                'Request rate analysis',
                'Suspicious pattern detection',
              ].map((method, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  {method}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-white mb-3">Blocked User Agents</h3>
            <div className="space-y-1">
              {[
                'python-requests',
                'curl/',
                'wget/',
                'scrapy',
                'phantom',
                'selenium',
              ].map((ua, i) => (
                <div key={i} className="text-xs text-red-400/80 font-mono bg-white/5 px-2 py-1 rounded">
                  {ua}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="bg-gold/10 border border-gold/30 p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-gold" />
          Security Recommendations
        </h2>

        <div className="space-y-3">
          {!displayStats.recaptcha.enabled && (
            <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white font-medium">Configure reCAPTCHA v3</p>
                <p className="text-xs text-white/60 mt-1">
                  Add NEXT_PUBLIC_RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY to your .env file
                  to enable form protection.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <Globe className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Deploy behind Cloudflare</p>
              <p className="text-xs text-white/60 mt-1">
                For production, use Cloudflare for DDoS protection and WAF. 
                IP detection is already configured for CF-Connecting-IP headers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
            <Clock className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Run security audits regularly</p>
              <p className="text-xs text-white/60 mt-1">
                Use <code className="text-gold">npm run security:audit</code> to check for dependency vulnerabilities.
                GitHub Actions workflow runs automatically on push.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
