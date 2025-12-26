'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/Button'

export function ThemeToggle() {
    const { setTheme, theme, systemTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="text-foreground hover:text-gold hover:bg-accent/10">
                <span className="sr-only">Toggle theme</span>
            </Button>
        )
    }

    const currentTheme = theme === 'system' ? systemTheme : theme

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(currentTheme === 'light' ? 'dark' : 'light')}
            className="text-foreground/80 hover:text-gold hover:bg-accent/10 transition-colors"
            title={currentTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
