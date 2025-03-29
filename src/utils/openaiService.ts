
import { OpenAIMessage, Sentiment } from "@/types/chat";

// OpenAI API configuration
const OPENAI_API_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini"; // GPT-4o mini as default for cost efficiency

// Fixed API key - replace with your actual OpenAI API key
const OPENAI_API_KEY = "your-openai-api-key-here";

// Function to check if API key is set
export const isApiKeySet = (): boolean => {
  return OPENAI_API_KEY !== "your-openai-api-key-here";
};

// Generate a response using the OpenAI API
export const generateOpenAIResponse = async (
  messages: OpenAIMessage[],
  sentiment?: Sentiment,
  temperature: number = 0.7
): Promise<string> => {
  if (!isApiKeySet()) {
    throw new Error("OpenAI API key is not set correctly in the code");
  }

  // Add sentiment information to the system message if available
  const enhancedMessages = [...messages];
  if (sentiment && enhancedMessages.length > 0 && enhancedMessages[0].role === "system") {
    enhancedMessages[0].content += `\nThe user's current detected sentiment is: ${sentiment}.`;
  }

  try {
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: enhancedMessages,
        temperature,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
};

// Function to analyze sentiment using OpenAI
export const analyzeWithOpenAI = async (text: string): Promise<Sentiment> => {
  if (!isApiKeySet()) {
    throw new Error("OpenAI API key is not set correctly in the code");
  }

  try {
    const messages: OpenAIMessage[] = [
      {
        role: "system",
        content: `Analyze the sentiment in the following text and respond with ONLY ONE of these categories: 
        positive, negative, neutral, anxious, depressed, hopeful, overwhelmed, calm, urgent, frustrated, suppressed, confused, fearful.
        
        Pay special attention to signs of suppressed emotions like saying "I'm fine" while expressing negative feelings.
        If there are signs of crisis or self-harm, classify as "urgent".
        Respond with only the sentiment label and nothing else.`
      },
      {
        role: "user",
        content: text
      }
    ];

    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: 0.1, // Low temperature for more consistent results
        max_tokens: 20,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const sentiment = data.choices[0].message.content.trim().toLowerCase() as Sentiment;
    
    // Ensure it's a valid sentiment type
    const validSentiments: Sentiment[] = [
      "positive", "negative", "neutral", "anxious", "depressed", 
      "hopeful", "overwhelmed", "calm", "urgent", "frustrated", 
      "suppressed", "confused", "fearful"
    ];
    
    return validSentiments.includes(sentiment) ? sentiment : "neutral";
  } catch (error) {
    console.error("Error analyzing sentiment with OpenAI:", error);
    return "neutral"; // Default to neutral on error
  }
};

// Function to detect language
export const detectLanguage = async (text: string): Promise<string> => {
  if (!isApiKeySet()) {
    throw new Error("OpenAI API key is not set correctly in the code");
  }

  try {
    const messages: OpenAIMessage[] = [
      {
        role: "system",
        content: "Identify the language of the following text. Respond with ONLY the ISO 639-1 two-letter language code (e.g., 'en' for English, 'es' for Spanish, etc.)."
      },
      {
        role: "user",
        content: text
      }
    ];

    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: 0.1,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const languageCode = data.choices[0].message.content.trim().toLowerCase();
    
    return languageCode;
  } catch (error) {
    console.error("Error detecting language:", error);
    return "en"; // Default to English on error
  }
};

// Function to translate text
export const translateText = async (
  text: string, 
  targetLanguage: string = "en"
): Promise<string> => {
  if (!isApiKeySet()) {
    throw new Error("OpenAI API key is not set correctly in the code");
  }

  try {
    const messages: OpenAIMessage[] = [
      {
        role: "system",
        content: `Translate the following text to ${targetLanguage}. Preserve formatting and tone. Only return the translation, nothing else.`
      },
      {
        role: "user",
        content: text
      }
    ];

    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error translating text:", error);
    return text; // Return original text on error
  }
};

// Function to generate conversation title
export const generateTitle = async (firstMessage: string): Promise<string> => {
  if (!isApiKeySet()) {
    throw new Error("OpenAI API key is not set correctly in the code");
  }

  try {
    const messages: OpenAIMessage[] = [
      {
        role: "system",
        content: "Create a short, descriptive title (maximum 50 characters) for a conversation that starts with the following message. Return only the title text."
      },
      {
        role: "user",
        content: firstMessage
      }
    ];

    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 20,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating title:", error);
    // Fallback to the original method if API fails
    if (firstMessage.length < 30) {
      return firstMessage;
    } else {
      const words = firstMessage.split(' ');
      return `${words.slice(0, 5).join(' ')}...`;
    }
  }
};

// Function to generate text-to-speech audio
export const textToSpeech = async (text: string, voice: string = "alloy"): Promise<ArrayBuffer> => {
  if (!isApiKeySet()) {
    throw new Error("OpenAI API key is not set correctly in the code");
  }

  try {
    const response = await fetch(`${OPENAI_API_URL}/audio/speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice, // alloy, echo, fable, onyx, nova, or shimmer
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS API error: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};
