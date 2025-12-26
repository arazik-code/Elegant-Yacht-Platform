import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'

export interface SiteSettings {
    id: string
    siteName: string
    siteTagline: string
    footerText: string

    // Contact
    whatsappNumber: string
    whatsappMessage: string
    email: string
    phone: string
    address: string
    googleMapsEmbed: string

    // Social
    instagramUrl: string
    instagramFollowers: string
    youtubeUrl: string
    tiktokUrl: string

    // Business
    dedLicenseNumber: string

    // Display
    showPrices: boolean
    maintenanceMode: boolean

    // Email
    adminEmailAddress: string
    emailNotifyInquiry: boolean
    emailNotifyListing: boolean
    emailDailyDigest: boolean
    emailWeeklyDigest: boolean
    emailFooterContent: string
}

const DEFAULT_SETTINGS: Omit<SiteSettings, 'id'> = {
    siteName: 'Bimo Yacht For Sale',
    siteTagline: 'Luxury Yachts in Dubai',
    footerText: '© 2024 Bimo Yacht For Sale. DED Licensed. All rights reserved.',
    whatsappNumber: '+971501566633',
    whatsappMessage: 'Hello! I am interested in a yacht.',
    email: 'info@bimoyacht.com',
    phone: '+971 50 156 6633',
    address: 'Dubai Marina, Dubai, UAE',
    googleMapsEmbed: '',
    instagramUrl: 'https://www.instagram.com/bimo_yacht4sale/',
    instagramFollowers: '900K+',
    youtubeUrl: '',
    tiktokUrl: '',
    dedLicenseNumber: '',
    showPrices: true,
    maintenanceMode: false,
    adminEmailAddress: '',
    emailNotifyInquiry: true,
    emailNotifyListing: true,
    emailDailyDigest: false,
    emailWeeklyDigest: false,
    emailFooterContent: '© Bimo Yacht - Premium Yacht Brokerage in Dubai',
}

export const getSettings = unstable_cache(
    async () => {
        try {
            let settings = await prisma.siteSettings.findUnique({
                where: { id: 'default' },
            })

            if (!settings) {
                settings = await prisma.siteSettings.create({
                    data: {
                        id: 'default',
                        ...DEFAULT_SETTINGS,
                    },
                })
            }

            return settings
        } catch (error) {
            console.error('Failed to fetching settings:', error)
            return { id: 'default', ...DEFAULT_SETTINGS }
        }
    },
    ['site-settings'],
    {
        revalidate: 60, // Revalidate every minute
        tags: ['settings'],
    }
)
