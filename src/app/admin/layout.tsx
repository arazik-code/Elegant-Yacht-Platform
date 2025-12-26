// Admin Layout

import { redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Ship, 
  MessageSquare, 
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Activity,
  Brain,
  Shield,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/yachts', label: 'Yachts', icon: Ship },
  { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/activity', label: 'Activity', icon: Activity },
  { href: '/admin/ai', label: 'AI Settings', icon: Brain },
  { href: '/admin/security', label: 'Security', icon: Shield },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  const user = await currentUser()
  
  return (
    <div className="min-h-screen bg-jet flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy border-r border-white/10">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-display font-bold text-gold">BIMO</span>
            <span className="text-white/60 text-sm">Admin</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-6">
          <ul className="space-y-1 px-3">
            {adminNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 text-white/70
                           hover:text-white hover:bg-white/5 transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
              <span className="text-gold font-semibold">
                {user?.firstName?.[0] || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-white/50 text-xs truncate">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
          <Link
            href="/sign-out"
            className="flex items-center gap-2 px-3 py-2 text-sm text-white/50
                     hover:text-white hover:bg-white/5 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-6
                         bg-navy border-b border-white/10 lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-display font-bold text-gold">BIMO</span>
            <span className="text-white/60 text-sm">Admin</span>
          </Link>
          {/* Mobile menu button would go here */}
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
