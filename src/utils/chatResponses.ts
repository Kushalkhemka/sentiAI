
import { Sentiment } from "../types/chat";

// Enhanced and more empathetic response generation based on detected sentiment
export const generateResponse = (message: string, sentiment: Sentiment, conversationHistory: string = ""): string => {
  // Crisis responses take immediate priority
  if (sentiment === "urgent") {
    return "I notice you may be in distress. Please remember that you're not alone. " +
      "If you're in crisis, please reach out to a crisis helpline like the 988 Suicide & Crisis Lifeline " +
      "(call or text 988) or text HOME to 741741 to reach the Crisis Text Line. " +
      "Would it help to talk about what you're experiencing right now?";
  }

  // Advanced emotion-based responses with Chain-of-Thought reasoning
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
    ],
    frustrated: [
      "I can sense your frustration. It's completely valid to feel this way when things aren't going as expected.",
      "It seems like you're dealing with some frustration. Would it help to talk about what's causing this?",
      "Frustration can be challenging to navigate. Is there a specific situation that's contributing to this feeling?"
    ],
    suppressed: [
      "I notice you're saying you're okay, but I'm wondering if there might be more you'd like to share?",
      "Sometimes when we say we're 'fine,' there are other feelings beneath the surface. It's safe to express those here if you'd like.",
      "I'm hearing that you're okay, but I'm also sensing there might be more to it. Would you like to talk more about what's going on?"
    ],
    confused: [
      "It sounds like you might be feeling uncertain about some things. Would it help to explore that confusion together?",
      "Being confused can feel uncomfortable. Is there a specific situation that's causing this uncertainty?",
      "I notice you might be feeling a bit lost. Sometimes talking through our thoughts can help bring clarity."
    ],
    fearful: [
      "I can hear that you're feeling afraid, which is completely understandable. Would you like to talk about what's causing this fear?",
      "Fear is a powerful emotion and often has important things to tell us. What do you think your fear might be trying to protect you from?",
      "Being scared is a natural response to perceived threats. Is there something specific that's triggered this feeling for you?"
    ]
  };

  // Advanced context-aware responses using the conversation history
  if (conversationHistory && conversationHistory.length > 0) {
    // Look for repeated patterns or topics in the conversation
    if (conversationHistory.includes("family") && message.toLowerCase().includes("family")) {
      return "I notice family relationships seem to be an important theme in our conversation. Would you like to explore how these relationships are affecting you?";
    }
    
    if (conversationHistory.includes("work") && message.toLowerCase().includes("work")) {
      return "Work seems to be coming up frequently in our discussion. How is your work situation impacting your overall wellbeing?";
    }
  }
  
  // Handle suppressed emotions specifically - detect when someone might be hiding their true feelings
  if (sentiment === "suppressed") {
    return "I notice you said you're fine, but sometimes that word can cover many different feelings. It's okay if you're not actually feeling fine right now. Would you like to share more about what's really going on?";
  }

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
