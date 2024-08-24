import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import axios from 'axios'

const systemPrompt = `
You are a rate my professor agent to help students find classes, that takes in user questions and answers them.
For every user question, the top 3 professors that match the user question are returned.
Use them to answer the question if needed.
`

export async function POST(req) {
    const data = await req.json()

    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    })
    const index = pc.index('rag').namespace('ns1')

    const text = data[data.length - 1].content

    // Create embedding using GeminiAPI
    let embedding;
    try {
        const response = await axios.post('https://api.gemini.com/v1/embeddings', {
            model: 'models/text-embedding-004',
            content: text
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        })
        embedding = response.data.embedding
    } catch (error) {
        console.error('Error creating embedding:', error)
        return new NextResponse('Error creating embedding', { status: 500 })
    }

    // Query Pinecone index
    const results = await index.query({
        topK: 5,
        includeMetadata: true,
        vector: embedding,
    })

    let resultString = ''
    results.matches.forEach((match) => {
        resultString += `
        Returned Results:
        Professor: ${match.id}
        Review: ${match.metadata.review}
        Subject: ${match.metadata.subject}
        Stars: ${match.metadata.stars}
        \n\n`
    })

    const lastMessage = data[data.length - 1]
    const lastMessageContent = lastMessage.content + resultString
    const lastDataWithoutLastMessage = data.slice(0, data.length - 1)

    // Generate completion using GeminiAPI
    let completion;
    try {
        const response = await axios.post('https://api.gemini.com/v1/completions', {
            messages: [
                { role: 'system', content: systemPrompt },
                ...lastDataWithoutLastMessage,
                { role: 'user', content: lastMessageContent },
            ],
            model: 'gemini-1.5-flash',  // Adjust model name if different
            stream: true,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            responseType: 'stream'
        })
        completion = response.data
    } catch (error) {
        console.error('Error generating completion:', error)
        return new NextResponse('Error generating completion', { status: 500 })
    }

    // Handle streaming response
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try {
                completion.on('data', chunk => {
                    const content = chunk.choices[0]?.delta?.content
                    if (content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                })
                completion.on('end', () => {
                    controller.close()
                })
            } catch (err) {
                controller.error(err)
            }
        },
    })

    return new NextResponse(stream)
}
