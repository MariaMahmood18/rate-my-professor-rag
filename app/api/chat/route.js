import { NextResponse } from 'next/server'
import { PineconeClient } from '@pinecone-database/pinecone'
import axios from 'axios'

const systemPrompt = `
You are a rate my professor agent to help students find classes, that takes in user questions and answers them.
For every user question, the top 3 professors that match the user question are returned.
Use them to answer the question if needed.
`

export async function POST(req) {
    const data = await req.json()

    // Initialize Pinecone client
    const pc = new PineconeClient() // Initialize without parameters
    await pc.init({
        apiKey: process.env.PINECONE_API_KEY,
    })
    const index = pc.Index('rag').Namespace('ns1')

    // Initialize Gemini API
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    const GEMINI_EMBEDDING_API_URL = "https://generativelanguage.googleapis.com/v1beta/gemini-1_5-flash:embedText"
    const GEMINI_CHAT_API_URL = "https://generativelanguage.googleapis.com/v1beta/gemini-1_5-flash:generateChat"

    try {
        // Create embeddings
        const text = data[data.length - 1]?.content
        const embeddingResponse = await axios.post(GEMINI_EMBEDDING_API_URL, {
            model: 'gemini-1.5-flash',
            text: text
        }, {
            headers: {
                "Authorization": `Bearer ${GEMINI_API_KEY}`,
                "Content-Type": "application/json"
            }
        })

        const embedding = embeddingResponse.data.embedding

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
            Review: ${match.metadata.review} // Adjust based on available metadata fields
            Subject: ${match.metadata.subject}
            Stars: ${match.metadata.stars}
            \n\n`
        })

        const lastMessage = data[data.length - 1]
        const lastMessageContent = lastMessage.content + resultString
        const lastDataWithoutLastMessage = data.slice(0, -1)

        // Generate chat completion with Gemini API
        const chatCompletionResponse = await axios.post(GEMINI_CHAT_API_URL, {
            model: 'gemini-1.5-flash',
            messages: [
                { role: 'system', content: systemPrompt },
                ...lastDataWithoutLastMessage,
                { role: 'user', content: lastMessageContent }
            ]
        }, {
            headers: {
                "Authorization": `Bearer ${GEMINI_API_KEY}`,
                "Content-Type": "application/json"
            },
            responseType: 'stream' // Ensure streaming is supported
        })

        // Return the response stream
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder()
                try {
                    chatCompletionResponse.data.pipeTo(new WritableStream({
                        write(chunk) {
                            controller.enqueue(encoder.encode(chunk))
                        },
                        close() {
                            controller.close()
                        },
                        error(err) {
                            controller.error(err)
                        }
                    }))
                } catch (err) {
                    controller.error(err)
                }
            },
        })

        return new NextResponse(stream)

    } catch (error) {
        console.error('Error in POST request:', error)
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
    }
}
