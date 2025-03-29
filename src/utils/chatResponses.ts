
import { Sentiment } from "../types/chat";

// Simple response generation based on detected sentiment
export const generateResponse = (message: string, sentiment: Sentiment): string => {
  // Crisis responses take immediate priority
  if (sentiment === "urgent") {
    return "I notice you may be in distress. Please remember that you're not alone. " +
      "If you're in crisis, please reach out to a crisis helpline like the 988 Suicide & Crisis Lifeline " +
      "(call or text 988) or text HOME to 741741 to reach the Crisis Text Line. " +
      "Would it help to talk about what you're experiencing right now?";
  }

  const responses = {
    positive: [
      "I'm glad to hear you're feeling good! What's contributing to those positive feelings?",
      "It's wonderful that you're in good spirits. Would you like to share more about what's going well?",
      "I'm happy you're feeling positive. How can we maintain this energy going forward?"
    ],
    negative: [
      "I'm sorry to hear you're not feeling well. Would you like to talk more about what's troubling you?",
      "That sounds difficult. Remember that it's okay to feel this way, and these feelings won't last forever.",
      "I'm here to listen. Sometimes expressing our feelings can help us process them better."
    ],
    neutral: [
      "How has your day been going so far?",
      "I'm here to chat whenever you need support or just want to talk.",
      "Is there anything specific on your mind that you'd like to discuss?"
    ],
    anxious: [
      "It sounds like you might be feeling anxious. Taking slow, deep breaths can sometimes help in the moment.",
      "Anxiety can be challenging. Would it help to talk about what's causing these feelings?",
      "When I feel anxious, grounding exercises can help. Would you like to try one together?"
    ],
    depressed: [
      "I'm sorry you're feeling this way. Depression can make things seem hopeless, but please know you're not alone.",
      "These feelings are valid, and reaching out is a positive step. Have you been able to talk to anyone else about how you're feeling?",
      "Small steps can help. Perhaps we could think about one tiny positive action you might take today?"
    ],
    hopeful: [
      "It's great to hear a sense of hope in your words. What positive possibilities are you seeing?",
      "Hope is powerful. What's giving you this optimistic outlook?",
      "I'm glad you're feeling hopeful. How can we build on this positive momentum?"
    ],
    overwhelmed: [
      "It sounds like you have a lot on your plate right now. Would it help to break things down into smaller steps?",
      "Feeling overwhelmed is natural when facing many challenges. Which one feels most pressing right now?",
      "Let's take a step back and breathe. We can approach one thing at a time."
    ],
    calm: [
      "It's wonderful that you're feeling calm. What practices help you maintain this sense of peace?",
      "Calmness is a valuable state. How did you arrive at this peaceful mindset?",
      "This sense of calm can be a great foundation. Is there anything you'd like to explore from this grounded place?"
    ]
  };

  // Select a random response from the appropriate category
  const appropriateResponses = responses[sentiment] || responses.neutral;
  const randomIndex = Math.floor(Math.random() * appropriateResponses.length);
  
  return appropriateResponses[randomIndex];
};

export const getInitialBotMessages = (): string[] => {
  return [
    "Hi there! I'm here to chat and provide a supportive space. How are you feeling today?",
    "Hello! I'm your empathetic chat companion. I'm here to listen and support you. How can I help today?",
    "Welcome! I'm here to provide a judgment-free space to talk. How are you doing right now?"
  ];
};
