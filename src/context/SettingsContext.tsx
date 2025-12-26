'use client'

import { createContext, useContext, ReactNode, useState } from 'react'
import { SiteSettings } from '@/lib/settings'

interface SettingsContextType {
    settings: SiteSettings | null
    updateSettings: (newSettings: SiteSettings) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({
    children,
    initialSettings
}: {
    children: ReactNode
    initialSettings: SiteSettings
}) {
    const [settings, setSettings] = useState<SiteSettings>(initialSettings)

    const updateSettings = (newSettings: SiteSettings) => {
        setSettings(newSettings)
    }

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider')
    }
    return context
}
