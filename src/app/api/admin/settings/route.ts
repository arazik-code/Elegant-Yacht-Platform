import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidateTag } from 'next/cache'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        let settings = await prisma.siteSettings.findUnique({
            where: { id: 'default' },
        })

        if (!settings) {
            // Return defaults if not found (though getSettings handles creation usually)
            return NextResponse.json({})
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Failed to fetch settings:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const body = await req.json()

        // Validate body if needed, but for now we trust the admin input logic (mostly strings/bools)

        // Remove id from body if present to avoid unique constraint issues or immutable field errors
        const { id, ...data } = body

        const settings = await prisma.siteSettings.upsert({
            where: { id: 'default' },
            update: data,
            create: {
                id: 'default',
                ...data,
            },
        })

        // Revalidate the cache tag
        revalidateTag('settings')

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Failed to update settings:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
