
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

// Save user-specific conversations
export const saveUserConversations = (userId: string, conversations: ChatHistory[]): void => {
  try {
    const userKey = `${userId}-${CONVERSATIONS_KEY}`;
    localStorage.setItem(userKey, JSON.stringify(conversations));
    console.log(`Saved ${conversations.length} conversations for user ${userId}`);
  } catch (error) {
    console.error("Error saving user conversations:", error);
  }
};

// Load user-specific conversations
export const loadUserConversations = (userId: string): ChatHistory[] => {
  try {
    if (!userId) {
      console.log("No userId provided, returning empty conversations array");
      return [];
    }
    
    const userKey = `${userId}-${CONVERSATIONS_KEY}`;
    const storedConversations = localStorage.getItem(userKey);
    if (!storedConversations) {
      console.log(`No stored conversations found for user ${userId}`);
      return [];
    }

    const conversations = JSON.parse(storedConversations);
    console.log(`Loaded ${conversations.length} conversations for user ${userId}`);
    
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
    console.error("Error loading user conversations:", error);
    return [];
  }
};

// Save user-specific active conversation ID
export const saveUserActiveConversationId = (userId: string, conversationId: string | null): void => {
  try {
    if (!userId) {
      console.warn("No userId provided, skipping save of active conversation ID");
      return;
    }
    
    const userKey = `${userId}-${ACTIVE_CONVERSATION_KEY}`;
    if (conversationId) {
      localStorage.setItem(userKey, conversationId);
      console.log(`Saved active conversation ID ${conversationId} for user ${userId}`);
    } else {
      localStorage.removeItem(userKey);
      console.log(`Removed active conversation ID for user ${userId}`);
    }
  } catch (error) {
    console.error("Error saving user active conversation ID:", error);
  }
};

// Load user-specific active conversation ID
export const loadUserActiveConversationId = (userId: string): string | null => {
  try {
    if (!userId) {
      console.warn("No userId provided, cannot load active conversation ID");
      return null;
    }
    
    const userKey = `${userId}-${ACTIVE_CONVERSATION_KEY}`;
    const activeId = localStorage.getItem(userKey);
    console.log(`Loaded active conversation ID for user ${userId}: ${activeId}`);
    return activeId;
  } catch (error) {
    console.error("Error loading user active conversation ID:", error);
    return null;
  }
};
