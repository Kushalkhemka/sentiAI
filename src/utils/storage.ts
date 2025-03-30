
import { ChatHistory, Message } from "@/types/chat";

// Local storage keys
const CONVERSATIONS_KEY = "sentiAI-chat-conversations";
const ACTIVE_CONVERSATION_KEY = "sentiAI-chat-active-conversation";

// Load conversations from local storage
export const loadConversations = (): ChatHistory[] => {
  try {
    const storedConversations = localStorage.getItem(CONVERSATIONS_KEY);
    if (!storedConversations) return [];

    const conversations = JSON.parse(storedConversations);
    
    // Convert string dates back to Date objects
    return conversations.map((conversation: any) => ({
      ...conversation,
      createdAt: new Date(conversation.createdAt),
      updatedAt: new Date(conversation.updatedAt),
      messages: conversation.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
  } catch (error) {
    console.error("Error loading conversations:", error);
    return [];
  }
};

// Save conversations to local storage
export const saveConversations = (conversations: ChatHistory[]): void => {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error("Error saving conversations:", error);
  }
};

// Load active conversation ID from local storage
export const loadActiveConversationId = (): string | null => {
  try {
    return localStorage.getItem(ACTIVE_CONVERSATION_KEY);
  } catch (error) {
    console.error("Error loading active conversation ID:", error);
    return null;
  }
};

// Save active conversation ID to local storage
export const saveActiveConversationId = (conversationId: string | null): void => {
  try {
    if (conversationId) {
      localStorage.setItem(ACTIVE_CONVERSATION_KEY, conversationId);
    } else {
      localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
    }
  } catch (error) {
    console.error("Error saving active conversation ID:", error);
  }
};

// Find the most common sentiment in a conversation
export const findMainSentiment = (messages: Message[]) => {
  const userMessages = messages.filter(m => m.sender === "user" && m.sentiment);
  
  if (userMessages.length === 0) return undefined;
  
  const sentimentCounts = userMessages.reduce((counts, message) => {
    if (message.sentiment) {
      counts[message.sentiment] = (counts[message.sentiment] || 0) + 1;
    }
    return counts;
  }, {} as Record<string, number>);
  
  let maxCount = 0;
  let mainSentiment = undefined;
  
  for (const [sentiment, count] of Object.entries(sentimentCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mainSentiment = sentiment;
    }
  }
  
  return mainSentiment;
};
