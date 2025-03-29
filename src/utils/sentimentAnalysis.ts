
import { Sentiment, SentimentAnalysisResult } from "../types/chat";

// Keywords that might indicate different sentiments
const sentimentKeywords = {
  positive: ["happy", "good", "great", "excellent", "joy", "thankful", "excited", "pleased", "content"],
  negative: ["sad", "bad", "terrible", "awful", "miserable", "unhappy", "disappointed", "upset"],
  anxious: ["anxious", "worried", "nervous", "fear", "scared", "panic", "stress", "afraid", "tense"],
  depressed: ["depressed", "hopeless", "worthless", "empty", "numb", "alone", "lonely", "despair"],
  hopeful: ["hope", "optimistic", "better", "improve", "forward", "future", "possibility"],
  overwhelmed: ["overwhelmed", "too much", "can't handle", "exhausted", "burnout", "pressure"],
  calm: ["calm", "peaceful", "relaxed", "steady", "balanced", "centered", "mindful"],
  urgent: ["help", "emergency", "crisis", "suicide", "kill", "die", "hurt myself", "end it all", "can't go on"]
};

// This is a simple mock sentiment analyzer
// In a real application, you would use a more sophisticated model
export const analyzeSentiment = (text: string): SentimentAnalysisResult => {
  const normalizedText = text.toLowerCase();
  let detectedSentiment: Sentiment = "neutral";
  let highestMatchCount = 0;
  
  // Check for urgent/crisis words first - these take priority
  const urgentMatches = countKeywordMatches(normalizedText, sentimentKeywords.urgent);
  if (urgentMatches > 0) {
    return {
      sentiment: "urgent",
      confidence: Math.min(urgentMatches * 0.3, 0.9)  // Higher confidence for urgent messages
    };
  }
  
  // Check other sentiments
  for (const [sentiment, keywords] of Object.entries(sentimentKeywords)) {
    const matchCount = countKeywordMatches(normalizedText, keywords);
    if (matchCount > highestMatchCount) {
      highestMatchCount = matchCount;
      detectedSentiment = sentiment as Sentiment;
    }
  }

  // If no significant matches found, return neutral
  if (highestMatchCount === 0) {
    return {
      sentiment: "neutral",
      confidence: 0.7
    };
  }

  return {
    sentiment: detectedSentiment,
    confidence: Math.min(0.5 + (highestMatchCount * 0.1), 0.9)
  };
};

const countKeywordMatches = (text: string, keywords: string[]): number => {
  return keywords.reduce((count, keyword) => {
    // Check for whole word matches or phrases
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    const matches = text.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
};

export const getSentimentColor = (sentiment: Sentiment): string => {
  switch (sentiment) {
    case "positive":
      return "bg-soothing-green-light text-green-800";
    case "hopeful":
      return "bg-soothing-green text-white";
    case "calm":
      return "bg-blue-100 text-blue-800";
    case "neutral":
      return "bg-soothing-neutral-light text-soothing-neutral-dark";
    case "anxious":
      return "bg-yellow-100 text-yellow-800";
    case "overwhelmed":
      return "bg-orange-100 text-orange-800";
    case "negative":
      return "bg-red-100 text-red-800";
    case "depressed":
      return "bg-purple-100 text-purple-800";
    case "urgent":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
