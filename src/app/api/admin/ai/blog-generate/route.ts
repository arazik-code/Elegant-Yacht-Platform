
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { title, category, tags, keywords } = await request.json()

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `
      You are an expert yachting lifestyle journalist. Write a detailed, engaging blog post for a luxury yacht website.
      
      Title: ${title}
      Category: ${category || 'General'}
      Tags: ${tags?.join(', ')}
      Keywords: ${keywords || ''}

      Requirements:
      1. Write in a sophisticated, aspirational, yet informative tone suitable for high-net-worth individuals.
      2. Structure the content with proper Metadata (H1 is the title, so start with an introduction).
      3. Use H2 (##) and H3 (###) for headings.
      4. detailed paragraphs.
      5. Include a "Conclusion" section.
      
      Format your response in Markdown. Do not wrap the response in a code block or JSON. Just the raw markdown content.
    `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        return NextResponse.json({ content: text })
    } catch (error) {
        console.error('AI generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate content' },
            { status: 500 }
        )
    }
}
