import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import { ReadableStream } from 'web-streams-polyfill'

// Define constants
const PINECONE_API_KEY = process.env.PINECONE_API_KEY
const EMBEDDING_DIMENSION = 1536
const INDEX_NAME = 'rag'

// Check if the API key is set
if (!PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY environment variable is not set.')
}

// Initialize Pinecone client
const pc = new Pinecone({ apiKey: PINECONE_API_KEY })

// Access the index
const index = pc.Index(INDEX_NAME)

// Initialize Pinecone index
async function initializePinecone() {
    try {
        // Check if the index exists, create if not
        const indexList = await pc.listIndexes()
        if (!indexList.includes(INDEX_NAME)) {
            await pc.createIndex({
                name: INDEX_NAME,
                dimension: EMBEDDING_DIMENSION,
                metric: 'cosine',
                spec: { cloud: 'aws', region: 'us-east-1' }
            })
            console.log(`Index '${INDEX_NAME}' created successfully.`)
        } else {
            console.log(`Index '${INDEX_NAME}' already exists.`)
        }
    } catch (error) {
        console.error('Error initializing Pinecone client:', error)
        throw new Error('Failed to initialize Pinecone client')
    }
}

// Ensure Pinecone is initialized
initializePinecone()

// Simulated embedding function
async function getEmbedding(text) {
    // Replace with actual embedding logic
    const embedding = new Array(EMBEDDING_DIMENSION).fill(Math.random())
    console.log('Generated embedding:', embedding)
    return embedding
}

// Handle POST requests
export async function POST(req) {
    try {
        const data = await req.json()
        console.log('Received data:', data)

        const text = data[data.length - 1]?.content
        if (!text) {
            console.log('No content provided for embedding')
            return NextResponse.json({ error: 'No content provided for embedding' }, { status: 400 })
        }

        // Get embedding
        const embedding = await getEmbedding(text)
        if (!embedding) {
            console.log('Failed to retrieve embedding')
            return NextResponse.json({ error: 'Failed to retrieve embedding' }, { status: 500 })
        }

        // Query Pinecone index
        const results = await index.query({
            topK: 3,
            includeMetadata: true,
            vector: embedding
        })

        console.log('Query results:', results)

        if (!results.matches.length) {
            console.log('No matches found in Pinecone index.')
            return NextResponse.json({ message: 'No relevant results found.' }, { status: 404 })
        }

        let resultString = ''
        results.matches.forEach((match) => {
            resultString += `
            Returned Results:
            Professor: ${match.id}
            Review: ${match.metadata?.review || 'N/A'}
            Subject: ${match.metadata?.subject || 'N/A'}
            Stars: ${match.metadata?.stars || 'N/A'}
            \n\n`
        })

        const lastMessage = data[data.length - 1]
        const lastMessageContent = lastMessage.content + resultString
        const lastDataWithoutLastMessage = data.slice(0, -1)

        // Simulate chat completion
        const chatCompletionResponse = new ReadableStream({
            async start(controller) {
                const responseText = `Processed response based on input: ${lastMessageContent}`
                controller.enqueue(new TextEncoder().encode(responseText))
                controller.close()
            }
        })

        return new NextResponse(chatCompletionResponse)

    } catch (error) {
        console.error('Error in POST request:', error)
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
    }
}
