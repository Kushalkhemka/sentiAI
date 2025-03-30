
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

export interface UserProfile {
  gender?: "male" | "female" | "non-binary" | "prefer-not-to-say" | string;
  age?: number;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  email?: string; // Added for authentication
  userId?: string; // Added for authentication
}

export interface HappinessRecord {
  date: string; // YYYY-MM-DD format
  averageSentiment: number; // -1 to 1 value representing average happiness
  sentimentCounts: Record<Sentiment, number>; // Count of each sentiment type
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
  userId?: string; // Added for authentication
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
  adaptiveColorsEnabled?: boolean; // Added for adaptive colors
}

// Authentication related types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  profile?: UserProfile;
}

export interface Credentials {
  email: string;
  password: string;
}

// ChromaDB types
export interface VectorDBEntry {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    messageId: string;
    conversationId: string;
    timestamp: Date;
    sentiment: string;
  };
}

export interface ChatSuggestion {
  text: string;
  type: "question" | "tip" | "exercise";
}

// MoodJourney visualization data type
export interface MoodJourneyData {
  period: string; // 'day', 'week', 'month'
  data: {
    label: string; // date or time period
    value: number; // sentiment score
    sentiment: Sentiment;
  }[];
}
