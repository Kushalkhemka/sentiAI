
import { ChatHistory, Message, Sentiment, SimilarMessage } from '@/types/chat';

// Fix the "global is not defined" error by creating a polyfill
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  // @ts-ignore
  window.global = window;
}

// Use a simpler in-memory database approach instead of ChromaDB
let memoryVectorDB: Array<{
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    messageId: string;
    conversationId: string;
    timestamp: string;
    sentiment: string;
  };
}> = [];

// Initialize the vector DB
export const initVectorDB = async (): Promise<boolean> => {
  try {
    console.log("Initialized in-memory vector database");
    return true;
  } catch (error) {
    console.error("Failed to initialize vector database:", error);
    return false;
  }
};

// Generate simple embeddings (cosine similarity will be used for search)
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    // Create basic embeddings (very simplified)
    return texts.map(text => {
      // Create a simple embedding based on character frequencies
      const charFreq = new Array(256).fill(0);
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) % 256;
        charFreq[charCode]++;
      }
      // Normalize the vector
      const sum = charFreq.reduce((a, b) => a + b, 0);
      return charFreq.map(freq => sum > 0 ? freq / sum : 0);
    });
  } catch (error) {
    console.error("Error generating embeddings:", error);
    // Return empty embeddings as fallback
    return texts.map(() => new Array(256).fill(0));
  }
}

// Store a message in the vector database
export const storeMessageInVectorDB = async (message: Message, conversationId: string): Promise<boolean> => {
  try {
    // Only store user messages
    if (message.sender !== "user") return true;
    
    const embedding = await generateEmbeddings([message.content]);
    
    memoryVectorDB.push({
      id: message.id,
      content: message.content,
      embedding: embedding[0],
      metadata: {
        messageId: message.id,
        conversationId: conversationId,
        timestamp: message.timestamp.toISOString(),
        sentiment: message.sentiment || "neutral"
      }
    });
    
    return true;
  } catch (error) {
    console.error("Error storing message in vector DB:", error);
    return false;
  }
};

// Store multiple messages at once
export const storeConversationHistoryInVectorDB = async (history: ChatHistory): Promise<boolean> => {
  try {
    // Filter for only user messages
    const userMessages = history.messages.filter(m => m.sender === "user");
    
    if (userMessages.length === 0) return true;
    
    for (const message of userMessages) {
      await storeMessageInVectorDB(message, history.id);
    }
    
    return true;
  } catch (error) {
    console.error("Error storing conversation history in vector DB:", error);
    return false;
  }
};

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

// Find similar messages to the given query
export const findSimilarMessages = async (query: string, limit: number = 5): Promise<SimilarMessage[]> => {
  try {
    if (memoryVectorDB.length === 0) {
      return [];
    }
    
    // Generate embedding for the query
    const queryEmbedding = (await generateEmbeddings([query]))[0];
    
    // Calculate similarity with each message in the database
    const similarities = memoryVectorDB.map(entry => ({
      messageId: entry.metadata.messageId,
      content: entry.content,
      similarity: cosineSimilarity(queryEmbedding, entry.embedding),
      conversationId: entry.metadata.conversationId
    }));
    
    // Sort by similarity (descending) and take the top results
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  } catch (error) {
    console.error("Error finding similar messages:", error);
    return [];
  }
};
