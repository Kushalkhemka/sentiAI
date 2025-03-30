
import { OPENAI_API_URL, OPENAI_API_KEY } from "./config";

// Function to generate text-to-speech audio
export const textToSpeech = async (text: string, voice: string = "alloy"): Promise<ArrayBuffer> => {
  try {
    console.log("Generating speech for text:", text.substring(0, 50) + "...");
    console.log("Using voice:", voice);
    
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
      const errorText = await response.text();
      console.error("OpenAI TTS API error response:", errorText);
      throw new Error(`OpenAI TTS API error: ${response.status} ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};
