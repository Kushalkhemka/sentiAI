
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
  originalText?: string; // For storing original text before translation
  translatedFrom?: string; // Source language if translated
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  mainSentiment?: Sentiment;
  tags?: string[]; // Added tags for categorizing conversations
  language?: string; // Primary language of the conversation
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

export interface OpenAIMessage {
  role: "system" | "user" | "assistant" | "function";
  content: string;
}

export interface TextToSpeechState {
  isPlaying: boolean;
  currentMessageId: string | null;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

// For memory retention with vector embeddings
export interface MessageEmbedding {
  messageId: string;
  conversationId: string;
  embedding: number[];
  content: string;
  timestamp: Date;
}

export interface SimilarMessage {
  messageId: string;
  content: string;
  similarity: number;
  conversationId: string;
}

export interface UserPreferences {
  preferredLanguage: string;
  textToSpeechEnabled: boolean;
  autoTranslateEnabled: boolean;
  theme: "light" | "dark" | "system";
  gender?: "male" | "female" | "non-binary" | "prefer-not-to-say";
  ageGroup?: "under-18" | "18-24" | "25-34" | "35-44" | "45-54" | "55+" | "prefer-not-to-say";
}

// Daily mood tracking data
export interface MoodEntry {
  date: string; // ISO date string
  sentiment: Sentiment;
  confidence: number;
}

// Happiness meter data
export interface HappinessData {
  dailyMoods: MoodEntry[];
  weeklyAverage: number; // 0-100 scale
  trend: "improving" | "declining" | "stable";
}

// Vector database interface
export interface VectorDBEntry {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    messageId: string;
    conversationId: string;
    timestamp: Date;
    sentiment?: Sentiment;
  };
}
