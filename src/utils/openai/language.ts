
import { OPENAI_API_URL, OPENAI_API_KEY, DEFAULT_MODEL } from "./config";

// Function to detect the language of a text
export const detectLanguage = async (text: string): Promise<string> => {
  try {
    console.log("Detecting language for text:", text.substring(0, 50) + "...");
    
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a language detection tool. Respond with only the ISO 639-1 language code (2 letters, e.g., 'en', 'es', 'fr') for the given text. Nothing else."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      console.error("Language detection API error:", response.statusText);
      return "en"; // Default to English on error
    }

    const data = await response.json();
    const detectedLanguage = data.choices[0].message.content.trim().toLowerCase().substring(0, 2);
    console.log("Detected language:", detectedLanguage);
    return detectedLanguage;
  } catch (error) {
    console.error("Language detection error:", error);
    return "en"; // Default to English on error
  }
};

// Function to translate text from one language to another
export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  try {
    console.log(`Translating text to ${targetLanguage}:`, text.substring(0, 50) + "...");
    
    // For Hindi specifically, we'll use "Hinglish" instruction when appropriate
    const systemInstruction = targetLanguage === "hi" 
      ? `You are a translation tool. If the input appears to be Hinglish (Hindi written in English), translate to proper Hindi script. Otherwise, translate the following text into Hindi. Provide only the translated text, nothing else.`
      : `You are a translation tool. Translate the following text into ${targetLanguage}. Provide only the translated text, nothing else.`;
    
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: systemInstruction
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error("Translation API error:", response.statusText);
      return text; // Return original text on error
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content.trim();
    console.log("Translated text:", translatedText.substring(0, 50) + "...");
    return translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text on error
  }
};
