
import { OpenAIMessage, Sentiment } from "@/types/chat";
import { OPENAI_API_URL, OPENAI_API_KEY, DEFAULT_MODEL } from "./config";

// Generate a response using the OpenAI API
export const generateOpenAIResponse = async (
  messages: OpenAIMessage[],
  sentiment?: Sentiment,
  temperature: number = 0.7
): Promise<string> => {
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
