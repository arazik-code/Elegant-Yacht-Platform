'use client'

// Admin WhatsApp Quick Replies Component
// Provides quick reply buttons for admin inquiry management

import { useState } from 'react'
import { MessageSquare, ChevronDown, X } from 'lucide-react'
import { 
  adminQuickReplies, 
  generateTrackedAdminReplyLink,
  type AdminReplyTemplate,
  type MessageTemplateData,
} from '@/lib/whatsapp'

interface AdminWhatsAppActionsProps {
  inquiryId: string
  phone: string
  customerName: string
  yachtTitle?: string
  locale?: 'en' | 'ar'
}

export function AdminWhatsAppActions({
  inquiryId,
  phone,
  customerName,
  yachtTitle,
  locale = 'en',
}: AdminWhatsAppActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const templateData: MessageTemplateData = {
    customerName,
    yachtTitle,
    inquiryId,
  }
  
  // Get all templates except 'custom'
  const templates = Object.entries(adminQuickReplies).filter(
    ([key]) => key !== 'custom'
  ) as [AdminReplyTemplate, typeof adminQuickReplies[AdminReplyTemplate]][]
  
  return (
    <div className="relative">
      {/* Main WhatsApp button with dropdown */}
      <div className="flex items-stretch">
        {/* Primary action - Quick reply */}
        <a
          href={generateTrackedAdminReplyLink(
            inquiryId,
            'follow_up',
            phone,
            templateData,
            locale
          )}
          className="px-3 py-1.5 text-sm bg-[#25D366] text-white 
                   hover:bg-[#20BD5A] transition-colors flex items-center gap-1
                   rounded-l"
        >
          <MessageSquare className="w-3 h-3" />
          WhatsApp
        </a>
        
        {/* Dropdown trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-2 py-1.5 bg-[#25D366] text-white border-l border-white/20
                   hover:bg-[#20BD5A] transition-colors rounded-r"
          title="Quick replies"
        >
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 z-50
                        bg-jet border border-white/10 rounded-lg shadow-xl
                        overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
              <span className="text-white/70 text-xs font-medium">Quick Replies</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            {/* Templates */}
            <div className="max-h-64 overflow-y-auto">
              {templates.map(([key, template]) => (
                <a
                  key={key}
                  href={generateTrackedAdminReplyLink(
                    inquiryId,
                    key,
                    phone,
                    templateData,
                    locale
                  )}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 
                           transition-colors text-sm text-white/80 hover:text-white"
                >
                  <span className="text-base">{template.icon}</span>
                  <span>{template.label[locale]}</span>
                </a>
              ))}
            </div>
            
            {/* Preview hint */}
            <div className="px-3 py-2 border-t border-white/10 bg-white/5">
              <p className="text-white/40 text-xs">
                Click to open WhatsApp with template
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Simple WhatsApp link for places that don't need the dropdown
export function SimpleWhatsAppLink({
  inquiryId,
  phone,
  customerName,
  yachtTitle,
  templateId = 'follow_up',
  locale = 'en',
}: AdminWhatsAppActionsProps & { templateId?: AdminReplyTemplate }) {
  const link = generateTrackedAdminReplyLink(
    inquiryId,
    templateId,
    phone,
    { customerName, yachtTitle, inquiryId },
    locale
  )
  
  return (
    <a
      href={link}
      className="px-3 py-1.5 text-sm bg-[#25D366] text-white 
               hover:bg-[#20BD5A] transition-colors flex items-center gap-1 rounded"
    >
      <MessageSquare className="w-3 h-3" />
      WhatsApp
    </a>
  )
}
