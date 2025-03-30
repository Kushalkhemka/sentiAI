
import { OpenAIMessage, Sentiment } from "@/types/chat";
import { OPENAI_API_URL, OPENAI_API_KEY, DEFAULT_MODEL } from "./config";
import { translateText } from "./language";

// Generate a response using the OpenAI API
export const generateOpenAIResponse = async (
  messages: OpenAIMessage[],
  sentiment?: Sentiment,
  temperature: number = 0.7,
  preferredLanguage: string = "en"
): Promise<string> => {
  // Add sentiment information to the system message if available
  const enhancedMessages = [...messages];
  
  // Add language preference to system message
  if (enhancedMessages.length > 0 && enhancedMessages[0].role === "system") {
    enhancedMessages[0].content += `\nThe user's current detected sentiment is: ${sentiment || 'neutral'}.`;
    
    // Add instruction to respond in the user's preferred language if not English
    if (preferredLanguage && preferredLanguage !== "en") {
      enhancedMessages[0].content += `\nVery important: You MUST respond in ${preferredLanguage} language.`;
    }
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
    let responseText = data.choices[0].message.content;
    
    // If response isn't already in preferred language, translate it
    if (preferredLanguage && preferredLanguage !== "en" && !isInLanguage(responseText, preferredLanguage)) {
      try {
        responseText = await translateText(responseText, preferredLanguage);
      } catch (translationError) {
        console.error("Translation error:", translationError);
        // Continue with untranslated response if translation fails
      }
    }
    
    return responseText;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
};

// Helper function to detect if text might already be in the target language
// This is a simple heuristic and not foolproof
const isInLanguage = (text: string, languageCode: string): boolean => {
  // For some common languages, we can check for unique characters or patterns
  if (languageCode === "hi" && /[\u0900-\u097F]/.test(text)) return true; // Hindi
  if (languageCode === "zh" && /[\u4e00-\u9fff]/.test(text)) return true; // Chinese
  if (languageCode === "ja" && /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text)) return true; // Japanese
  if (languageCode === "ko" && /[\uAC00-\uD7AF\u1100-\u11FF]/.test(text)) return true; // Korean
  if (languageCode === "ar" && /[\u0600-\u06FF]/.test(text)) return true; // Arabic
  if (languageCode === "ru" && /[\u0400-\u04FF]/.test(text)) return true; // Russian
  
  // For Latin-based languages, we can't easily determine, so return false to ensure translation
  return false;
}

// Generate conversation title
export const generateTitle = async (firstMessage: string): Promise<string> => {
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
