
import { ChatHistory, ChatSuggestion, Message, Sentiment, SimilarMessage } from '@/types/chat';
import { findSimilarMessages } from './vectorDB';

// Define the HappinessRecord type
export interface HappinessRecord {
  date: string; // YYYY-MM-DD format
  averageSentiment: number; // -1 to 1 value representing average happiness
  sentimentCounts: Record<Sentiment, number>; // Count of each sentiment type
}

// Generate relevant suggestions based on conversation history and sentiment
export const generateSuggestions = async (
  conversation: ChatHistory | null, 
  allConversations: ChatHistory[],
  userProfile?: { gender?: string; age?: number; name?: string }
): Promise<ChatSuggestion[]> => {
  const suggestions: ChatSuggestion[] = [];
  
  // Add some default suggestions for new conversations
  if (!conversation || conversation.messages.length <= 1) {
    suggestions.push(
      { text: "How are you feeling today?", type: "question" },
      { text: "What's been on your mind lately?", type: "question" },
      { text: "Try taking a few deep breaths before chatting", type: "tip" },
      { text: "Share something positive that happened today", type: "exercise" },
    );
    
    // Add personalized suggestions if profile exists
    if (userProfile?.name) {
      suggestions.push({ 
        text: `How has your day been, ${userProfile.name}?`, 
        type: "question" 
      });
    }
    
    if (userProfile?.age && userProfile.age < 25) {
      suggestions.push({ 
        text: "How are things going with school or studies?", 
        type: "question" 
      });
    } else if (userProfile?.age && userProfile.age >= 25) {
      suggestions.push({ 
        text: "How's your work-life balance these days?", 
        type: "question" 
      });
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }
  
  // For existing conversations, analyze the message history
  const recentMessages = conversation.messages.slice(-5);
  const lastUserMessage = recentMessages.filter(m => m.sender === "user").pop();
  
  if (lastUserMessage) {
    const sentiment = lastUserMessage.sentiment || "neutral";
    
    // Add sentiment-specific suggestions
    if (sentiment === "anxious" || sentiment === "overwhelmed") {
      suggestions.push(
        { text: "Try the 5-5-5 breathing technique: breathe in for 5 seconds, hold for 5, out for 5", type: "tip" },
        { text: "Would listing out your concerns help organize your thoughts?", type: "question" },
        { text: "Rate your anxiety level from 1-10", type: "exercise" }
      );
    } else if (sentiment === "depressed" || sentiment === "negative") {
      suggestions.push(
        { text: "What's one small positive thing you noticed today?", type: "question" },
        { text: "Consider naming 3 things you're grateful for", type: "tip" },
        { text: "Would you like to talk about something that brings you joy?", type: "question" }
      );
    } else if (sentiment === "positive" || sentiment === "hopeful") {
      suggestions.push(
        { text: "That's wonderful! What contributed to these positive feelings?", type: "question" },
        { text: "Consider journaling about this positive experience", type: "tip" },
        { text: "How might you extend this positive feeling?", type: "question" }
      );
    }
    
    // Add suggestions based on vector search if available
    try {
      const similarMessages = await findSimilarMessages(lastUserMessage.content, 3);
      
      if (similarMessages.length > 0) {
        // Find the conversations that these similar messages belong to
        const relatedConversations = allConversations.filter(c => 
          similarMessages.some(m => m.conversationId === c.id)
        );
        
        // Generate follow-up questions based on these conversations
        relatedConversations.forEach(relConv => {
          // Find a bot response that came after a similar message
          const matchingMessageIndex = relConv.messages.findIndex(m => 
            similarMessages.some(sm => sm.messageId === m.id)
          );
          
          if (matchingMessageIndex !== -1 && matchingMessageIndex < relConv.messages.length - 1) {
            const followupMessage = relConv.messages[matchingMessageIndex + 1];
            if (followupMessage.sender === "bot" && followupMessage.content.includes("?")) {
              // Extract the question from the bot response
              const questionMatch = followupMessage.content.match(/([^.!?]+\?)/g);
              if (questionMatch) {
                suggestions.push({
                  text: questionMatch[0].trim(),
                  type: "question"
                });
              }
            }
          }
        });
      }
    } catch (error) {
      console.error("Error generating suggestions from vector DB:", error);
    }
  }
  
  // Add some generic follow-up suggestions
  suggestions.push(
    { text: "Could you tell me more about that?", type: "question" },
    { text: "How did that make you feel?", type: "question" },
    { text: "Is there something specific you'd like support with today?", type: "question" }
  );
  
  // Shuffle and limit suggestions
  return shuffleArray(suggestions).slice(0, 5);
};

// Helper to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Calculate happiness score from sentiment
export const calculateHappinessScore = (sentiment: Sentiment): number => {
  const sentimentScores: Record<Sentiment, number> = {
    "positive": 1,
    "hopeful": 0.7,
    "calm": 0.5,
    "neutral": 0,
    "anxious": -0.3,
    "confused": -0.2,
    "frustrated": -0.6,
    "overwhelmed": -0.5,
    "suppressed": -0.4,
    "negative": -0.8,
    "fearful": -0.7,
    "depressed": -0.9,
    "urgent": -1
  };
  
  return sentimentScores[sentiment] || 0;
};

// Calculate daily happiness records from messages
export const calculateHappinessRecords = (
  conversations: ChatHistory[]
): HappinessRecord[] => {
  // Group messages by date
  const messagesByDate: Record<string, Message[]> = {};
  
  conversations.forEach(conversation => {
    conversation.messages.forEach(message => {
      if (message.sender === "user" && message.sentiment) {
        const date = message.timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!messagesByDate[date]) {
          messagesByDate[date] = [];
        }
        messagesByDate[date].push(message);
      }
    });
  });
  
  // Calculate happiness score for each date
  const records: HappinessRecord[] = Object.entries(messagesByDate).map(([date, messages]) => {
    const sentimentCounts: Record<Sentiment, number> = {} as Record<Sentiment, number>;
    let totalScore = 0;
    
    messages.forEach(message => {
      if (message.sentiment) {
        sentimentCounts[message.sentiment] = (sentimentCounts[message.sentiment] || 0) + 1;
        totalScore += calculateHappinessScore(message.sentiment);
      }
    });
    
    const averageSentiment = messages.length > 0 ? totalScore / messages.length : 0;
    
    return {
      date,
      averageSentiment,
      sentimentCounts
    };
  });
  
  return records.sort((a, b) => a.date.localeCompare(b.date));
};
