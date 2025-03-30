
import { OpenAIMessage } from "@/types/chat";
import { OPENAI_API_URL, OPENAI_API_KEY, DEFAULT_MODEL } from "./config";

// Function to detect language
export const detectLanguage = async (text: string): Promise<string> => {
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
