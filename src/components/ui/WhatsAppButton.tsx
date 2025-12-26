'use client'

// WhatsApp Floating Button Component
// Global CTA button for instant contact with click tracking

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { generateTrackedWhatsAppLink, type WhatsAppContext } from '@/lib/whatsapp'

interface WhatsAppButtonProps {
  message?: string
  yachtTitle?: string
  yachtId?: string
}

export function WhatsAppButton({ yachtTitle, yachtId }: WhatsAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Show button after initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Quick message options with tracked links
  const quickMessages: Array<{
    label: string
    context: WhatsAppContext
    link: string
  }> = [
      {
        label: 'Yacht Inquiry',
        context: 'yacht_inquiry',
        link: generateTrackedWhatsAppLink('yacht_inquiry', { yachtTitle, yachtId }),
      },
      {
        label: 'Charter Booking',
        context: 'charter_inquiry',
        link: generateTrackedWhatsAppLink('charter_inquiry', { yachtTitle, yachtId }),
      },
      {
        label: 'Sell My Yacht',
        context: 'sell_yacht',
        link: generateTrackedWhatsAppLink('sell_yacht'),
      },
      {
        label: 'General Question',
        context: 'general_inquiry',
        link: generateTrackedWhatsAppLink('general_inquiry'),
      },
    ]

  // Default link for the main button
  const defaultLink = yachtTitle
    ? generateTrackedWhatsAppLink('yacht_inquiry', { yachtTitle, yachtId })
    : generateTrackedWhatsAppLink('general_inquiry')

  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
          {/* Quick Messages Panel */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-popover rounded-2xl shadow-2xl overflow-hidden w-72 border border-border"
              >
                {/* Header */}
                <div className="bg-[#25D366] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Bimo Yacht</p>
                      <p className="text-white/80 text-xs">Typically replies instantly</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="p-4 bg-muted/30">
                  <div className="bg-card rounded-lg p-3 shadow-sm border border-border">
                    <p className="text-foreground text-sm">
                      Hello! 👋 Welcome to Bimo Yacht. How can we assist you today?
                    </p>
                    <p className="text-muted-foreground text-xs mt-1 text-right">Just now</p>
                  </div>
                </div>

                {/* Quick Options */}
                <div className="p-3 space-y-2 bg-popover border-t border-border">
                  <p className="text-muted-foreground text-xs px-1">Quick messages:</p>
                  {quickMessages.map((item, index) => (
                    <a
                      key={index}
                      href={item.link}
                      className="block w-full px-4 py-2.5 text-left text-sm text-foreground 
                                 bg-muted/50 rounded-lg hover:bg-[#25D366]/10 
                                 hover:text-[#25D366] transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-16 h-16 bg-[#25D366] rounded-full shadow-lg 
                       flex items-center justify-center
                       hover:shadow-xl hover:shadow-[#25D366]/30
                       transition-shadow duration-300"
            aria-label="Open WhatsApp chat"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="w-7 h-7 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="whatsapp"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pulse Animation */}
            {!isOpen && (
              <span className="absolute inset-0 rounded-full animate-ping bg-[#25D366] opacity-20" />
            )}
          </motion.button>

          {/* Mobile-only direct link (for smaller screens) */}
          <a
            href={defaultLink}
            className="sr-only sm:hidden"
            aria-label="Contact on WhatsApp"
          >
            WhatsApp
          </a>
        </div>
      )}
    </AnimatePresence>
  )
}
