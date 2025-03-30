
import { OpenAIMessage, Sentiment } from "@/types/chat";
import { OPENAI_API_URL, OPENAI_API_KEY, DEFAULT_MODEL } from "./config";

// Function to analyze sentiment using OpenAI
export const analyzeWithOpenAI = async (text: string): Promise<Sentiment> => {
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
