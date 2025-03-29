
export type Sentiment = 
  | "positive" 
  | "negative" 
  | "neutral" 
  | "anxious" 
  | "depressed" 
  | "hopeful" 
  | "overwhelmed" 
  | "calm" 
  | "urgent"
  | "frustrated"
  | "suppressed"
  | "confused"
  | "fearful";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  sentiment?: Sentiment;
  language?: string;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  mainSentiment?: Sentiment;
}

export interface SentimentAnalysisResult {
  sentiment: Sentiment;
  confidence: number;
}

export interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  error: string | null;
}

export interface ConversationState {
  activeConversationId: string | null;
  conversations: ChatHistory[];
  isCreatingNewConversation: boolean;
}
