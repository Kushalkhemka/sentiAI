
import { ChromaClient, Collection, OpenAIEmbeddingFunction } from 'chromadb';
import { v4 as uuidv4 } from 'uuid';
import { Message, VectorDBEntry } from '@/types/chat';
import { isApiKeySet } from './openaiService';

// Initialize ChromaDB client
const client = new ChromaClient();

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// In-memory fallback for browser environments
let memoryVectorStore: VectorDBEntry[] = [];

// OpenAI embedding function
let embeddingFunction: OpenAIEmbeddingFunction | null = null;

// Collection reference
let collection: Collection | null = null;

// Initialize the vector database
export const initVectorDB = async (): Promise<void> => {
  try {
    if (isBrowser) {
      console.log("Running in browser environment, using in-memory vector storage");
      // Load from localStorage if available
      const storedVectors = localStorage.getItem('vector_store');
      if (storedVectors) {
        memoryVectorStore = JSON.parse(storedVectors);
      }
      return;
    }

    // If running in Node.js, use actual ChromaDB
    if (!isApiKeySet()) {
      throw new Error("OpenAI API key is required for embeddings");
    }

    embeddingFunction = new OpenAIEmbeddingFunction({
      openai_api_key: "your-openai-api-key-here", // Replace with actual key
      model_name: "text-embedding-3-small"
    });

    // Create or get collection
    collection = await client.getOrCreateCollection({
      name: "chat_history",
      embeddingFunction
    });

    console.log("ChromaDB initialized successfully");
  } catch (error) {
    console.error("Error initializing vector database:", error);
    // Fallback to in-memory storage
    console.log("Falling back to in-memory vector storage");
  }
};

// Add a message to the vector database
export const addMessageToVectorDB = async (
  message: Message,
  conversationId: string
): Promise<void> => {
  try {
    if (!message.content.trim()) return;

    // Create embedding via OpenAI
    if (isBrowser) {
      // In-memory implementation for browser
      const entry: VectorDBEntry = {
        id: uuidv4(),
        content: message.content,
        embedding: [], // Empty as we can't generate embeddings in the browser
        metadata: {
          messageId: message.id,
          conversationId,
          timestamp: message.timestamp,
          sentiment: message.sentiment
        }
      };

      memoryVectorStore.push(entry);
      localStorage.setItem('vector_store', JSON.stringify(memoryVectorStore));
      return;
    }

    // Use ChromaDB if available
    if (collection && embeddingFunction) {
      await collection.add({
        ids: [uuidv4()],
        documents: [message.content],
        metadatas: [{
          messageId: message.id,
          conversationId,
          timestamp: message.timestamp.toISOString(),
          sentiment: message.sentiment || "neutral"
        }]
      });
    }
  } catch (error) {
    console.error("Error adding message to vector database:", error);
  }
};

// Find similar messages for RAG
export const findSimilarMessages = async (
  query: string,
  limit: number = 5
): Promise<VectorDBEntry[]> => {
  try {
    if (isBrowser) {
      // Simple keyword matching as fallback in browser
      const keywords = query.toLowerCase().split(' ');
      const results = memoryVectorStore
        .filter(entry => {
          const content = entry.content.toLowerCase();
          return keywords.some(keyword => content.includes(keyword));
        })
        .sort((a, b) => {
          // Crude relevance scoring
          const scoreA = keywords.filter(kw => a.content.toLowerCase().includes(kw)).length;
          const scoreB = keywords.filter(kw => b.content.toLowerCase().includes(kw)).length;
          return scoreB - scoreA;
        })
        .slice(0, limit);
      
      return results;
    }

    // Use ChromaDB if available
    if (collection && embeddingFunction) {
      const results = await collection.query({
        queryTexts: [query],
        nResults: limit
      });

      // Map results to our format
      if (results.documents && results.documents[0] && results.metadatas && results.metadatas[0]) {
        return results.documents[0].map((doc, i) => {
          const metadata = results.metadatas![0][i];
          return {
            id: results.ids![0][i],
            content: doc,
            embedding: [], // We don't need the actual embedding
            metadata: {
              messageId: metadata.messageId,
              conversationId: metadata.conversationId,
              timestamp: new Date(metadata.timestamp),
              sentiment: metadata.sentiment
            }
          };
        });
      }
    }

    return [];
  } catch (error) {
    console.error("Error finding similar messages:", error);
    return [];
  }
};

// Make sure to initialize the vector DB
initVectorDB().catch(console.error);
