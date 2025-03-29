
import { useState, useEffect, useCallback } from 'react';
import { findSimilarMessages, addMessageToVectorDB } from '@/utils/vectorDB';
import { Message } from '@/types/chat';

interface UseRAGProps {
  activeConversationId: string | null;
}

interface UseRAGResult {
  addMessageToContext: (message: Message) => Promise<void>;
  getRelevantContext: (query: string) => Promise<string>;
  isReady: boolean;
}

export const useRAG = ({ activeConversationId }: UseRAGProps): UseRAGResult => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize RAG system
    const init = async () => {
      try {
        // Any initialization code here
        setIsReady(true);
      } catch (error) {
        console.error("Error initializing RAG:", error);
      }
    };

    init();
  }, []);

  // Add a message to the RAG context
  const addMessageToContext = useCallback(async (message: Message) => {
    if (!activeConversationId) return;
    
    try {
      await addMessageToVectorDB(message, activeConversationId);
    } catch (error) {
      console.error("Error adding message to RAG context:", error);
    }
  }, [activeConversationId]);

  // Get relevant context for a query
  const getRelevantContext = useCallback(async (query: string): Promise<string> => {
    try {
      const similarMessages = await findSimilarMessages(query, 5);
      
      if (similarMessages.length === 0) {
        return "";
      }
      
      // Format the context
      return similarMessages
        .map(msg => `Previous relevant context: ${msg.content}`)
        .join("\n\n");
    } catch (error) {
      console.error("Error getting relevant context:", error);
      return "";
    }
  }, []);

  return {
    addMessageToContext,
    getRelevantContext,
    isReady
  };
};

export default useRAG;
