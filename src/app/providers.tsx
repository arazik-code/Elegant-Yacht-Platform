'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'
import { SettingsProvider } from '@/context/SettingsContext'
import { SiteSettings } from '@/lib/settings'

interface ProvidersProps extends ThemeProviderProps {
    initialSettings: SiteSettings
}

export function Providers({ children, initialSettings, ...props }: ProvidersProps) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
            {...props}
        >
            <SettingsProvider initialSettings={initialSettings}>
                {children}
            </SettingsProvider>
        </NextThemesProvider>
    )
}
