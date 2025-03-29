import { Sentiment, SentimentAnalysisResult } from "../types/chat";

// Enhanced keywords for more nuanced sentiment detection
const sentimentKeywords = {
  positive: ["happy", "good", "great", "excellent", "joy", "thankful", "excited", "pleased", "content"],
  negative: ["sad", "bad", "terrible", "awful", "miserable", "unhappy", "disappointed", "upset"],
  anxious: ["anxious", "worried", "nervous", "fear", "scared", "panic", "stress", "afraid", "tense"],
  depressed: ["depressed", "hopeless", "worthless", "empty", "numb", "alone", "lonely", "despair"],
  hopeful: ["hope", "optimistic", "better", "improve", "forward", "future", "possibility"],
  overwhelmed: ["overwhelmed", "too much", "can't handle", "exhausted", "burnout", "pressure"],
  calm: ["calm", "peaceful", "relaxed", "steady", "balanced", "centered", "mindful"],
  urgent: ["help", "emergency", "crisis", "suicide", "kill", "die", "hurt myself", "end it all", "can't go on"],
  frustrated: ["frustrated", "annoyed", "irritated", "angry", "mad", "upset", "furious", "impatient"],
  suppressed: ["fine", "okay", "alright", "nothing", "nevermind", "forget it", "doesn't matter", "it's nothing"],
  confused: ["confused", "unsure", "don't understand", "lost", "bewildered", "perplexed"],
  fearful: ["terrified", "horrified", "petrified", "dread", "frightened"]
};

// This detects micro-emotions including masked feelings
export const analyzeSentiment = (text: string): SentimentAnalysisResult => {
  const normalizedText = text.toLowerCase();
  
  // Check for urgent/crisis words first - these take priority
  const urgentMatches = countKeywordMatches(normalizedText, sentimentKeywords.urgent);
  if (urgentMatches > 0) {
    return {
      sentiment: "urgent",
      confidence: Math.min(urgentMatches * 0.3, 0.9)  // Higher confidence for urgent messages
    };
  }

  // Special case for suppressed emotions (saying "fine" or "okay" with negative terms)
  const suppressedMatches = countKeywordMatches(normalizedText, sentimentKeywords.suppressed);
  const negativeMatches = countKeywordMatches(normalizedText, sentimentKeywords.negative) + 
                         countKeywordMatches(normalizedText, sentimentKeywords.anxious) + 
                         countKeywordMatches(normalizedText, sentimentKeywords.depressed);
  
  if (suppressedMatches > 0 && negativeMatches > 0) {
    return {
      sentiment: "suppressed",
      confidence: 0.7
    };
  }
  
  // Check other sentiments
  let detectedSentiment: Sentiment = "neutral";
  let highestMatchCount = 0;
  let highestConfidence = 0;
  
  for (const [sentiment, keywords] of Object.entries(sentimentKeywords)) {
    const matchCount = countKeywordMatches(normalizedText, keywords);
    if (matchCount > highestMatchCount) {
      highestMatchCount = matchCount;
      detectedSentiment = sentiment as Sentiment;
      highestConfidence = Math.min(0.5 + (matchCount * 0.1), 0.9);
    }
  }

  // Advanced context analysis - look for patterns like short responses after long explanations
  if (normalizedText.length < 10 && detectedSentiment === "neutral") {
    // Short, ambiguous response might indicate suppressed emotions
    highestConfidence = 0.6;
    detectedSentiment = "suppressed";
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
    confidence: highestConfidence
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
    case "frustrated":
      return "bg-red-200 text-red-800";
    case "suppressed":
      return "bg-indigo-100 text-indigo-800";
    case "confused":
      return "bg-amber-100 text-amber-800";
    case "fearful":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Function to determine the title for a new conversation based on first message
export const generateConversationTitle = (message: string): string => {
  // If message is short enough, use it directly
  if (message.length < 30) {
    return message;
  }
  
  // Otherwise, use first few words and add ellipsis
  const words = message.split(' ');
  const shortTitle = words.slice(0, 5).join(' ');
  return `${shortTitle}...`;
};
