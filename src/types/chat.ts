
export type Sentiment = 
  | "positive" 
  | "negative" 
  | "neutral" 
  | "anxious" 
  | "depressed" 
  | "hopeful" 
  | "overwhelmed" 
  | "calm" 
  | "urgent";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  sentiment?: Sentiment;
}

export interface ChatHistory {
  messages: Message[];
}

export interface SentimentAnalysisResult {
  sentiment: Sentiment;
  confidence: number;
}
