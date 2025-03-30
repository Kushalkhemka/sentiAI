
import { Sentiment } from "../types/chat";

// Enhanced and more empathetic response generation with friendly, conversational tone
export const generateResponse = (message: string, sentiment: Sentiment, conversationHistory: string = ""): string => {
  // Crisis responses take immediate priority
  if (sentiment === "urgent") {
    return "Hey there, I'm really glad you reached out. It sounds like you're going through something really tough right now. " +
      "Please remember you're not alone in this. If you're in crisis, please reach out to the 988 Suicide & Crisis Lifeline " +
      "(call or text 988) or text HOME to 741741 for the Crisis Text Line. " +
      "I'm here to listen if you want to talk about what you're feeling. Would that help?";
  }

  // Friendly, personalized responses with more conversational tone
  const responses = {
    positive: [
      "That's awesome! I'm so happy things are going well for you! What's been making you smile lately?",
      "Look at you with all those positive vibes! ✨ Want to share more about what's going so well?",
      "I'm totally vibing with your positive energy! How can we keep this momentum going for you?"
    ],
    negative: [
      "I'm sorry you're feeling down. Sometimes life can be really tough. What's been on your mind lately?",
      "Hey, it's okay to not be okay sometimes. I'm right here whenever you want to talk through what's bothering you.",
      "That sounds really difficult. Remember, these feelings won't last forever, though they're very real right now. Want to talk about it?"
    ],
    neutral: [
      "Hey friend! How's your day shaping up so far?",
      "I'm all ears if you want to chat about anything that's on your mind today!",
      "What's been on your mind recently? I'm here to listen or just chat if you need a friend."
    ],
    anxious: [
      "I can hear you're feeling anxious, and that's completely understandable. Let's take a deep breath together, okay?",
      "Anxiety can feel so overwhelming sometimes. What's making you feel worried right now?",
      "When my friends feel anxious, sometimes just naming what's causing it can help take away some of its power. Want to try that together?"
    ],
    depressed: [
      "I'm here with you through these tough feelings. Depression can make everything seem gray, but you're not alone in this.",
      "Even reaching out when you're feeling so low takes incredible strength. I'm really proud of you for that.",
      "Sometimes when everything feels heavy, focusing on just one tiny positive thing can help. Is there any small bright spot in your day we could talk about?"
    ],
    hopeful: [
      "I can feel that spark of hope in your words, and it's beautiful! What possibilities are you seeing right now?",
      "That sense of hope is so precious! What's giving you that little light of optimism?",
      "I love hearing that hopeful tone! Let's build on this positive energy - what's making you feel this way?"
    ],
    overwhelmed: [
      "Whoa, it sounds like you have A LOT going on right now. Let's break it down together - what's the biggest thing on your plate?",
      "Being overwhelmed is totally normal when life throws too much at us at once. Which part feels most urgent to tackle?",
      "It's like you're juggling too many balls at once! Let's focus on just one thing for now - which situation needs attention first?"
    ],
    calm: [
      "That peaceful feeling is something to cherish! What helps you maintain this wonderful sense of calm?",
      "I'm loving this zen energy you've got going! How did you create this peaceful space for yourself?",
      "There's something so special about finding calm in our chaotic world. What practices help you stay centered?"
    ],
    frustrated: [
      "Ugh, that sounds super frustrating! I'd be feeling exactly the same way in your situation.",
      "It's totally okay to feel frustrated when things aren't going as planned. Want to vent about it? I'm all ears!",
      "I can practically feel your frustration through the screen! What's been getting under your skin lately?"
    ],
    suppressed: [
      "You know, sometimes when we say we're 'fine,' there might be more going on beneath the surface. It's safe to share those deeper feelings here if you want.",
      "I notice you're saying you're okay, but I'm getting the sense there might be more to it? It's just us here - you can be real with me.",
      "Hey, just checking in - you said you're fine, but sometimes that's our go-to when we don't want to unpack what's really going on. I'm here if you want to dig deeper."
    ],
    confused: [
      "Feeling confused is like being lost in a maze, right? Let's try to find some clarity together - what's got you puzzled?",
      "Being uncertain about things can feel so unsettling. Want to talk through what's causing the confusion?",
      "It's like having a mental fog when we're confused about something important. Let's see if we can clear it up a bit by talking it through."
    ],
    fearful: [
      "I hear that you're scared, and that's completely valid. Fear is actually trying to protect us sometimes. What's triggering this feeling for you?",
      "Being afraid can feel so overwhelming. Remember you're not alone with these feelings - I'm right here with you.",
      "Fear can be really powerful. Sometimes just naming what we're afraid of can help reduce its grip on us. What's scaring you the most right now?"
    ]
  };

  // Context-aware responses
  if (conversationHistory && conversationHistory.length > 0) {
    if (conversationHistory.includes("family") && message.toLowerCase().includes("family")) {
      return "Family relationships can be so complex, can't they? I notice we've been talking about your family a bit. How are those relationships affecting your wellbeing right now?";
    }
    
    if (conversationHistory.includes("work") && message.toLowerCase().includes("work")) {
      return "Work seems to be a recurring theme in our chats. How's the job situation impacting your daily happiness? Sometimes our work life can really affect our overall mood.";
    }
  }
  
  // Special handling for suppressed emotions
  if (sentiment === "suppressed") {
    return "I notice you're saying you're fine, but sometimes that word can be our way of glossing over deeper feelings. It's totally okay if you're not actually feeling fine right now. This is a safe space - what's really going on?";
  }

  // Select a random response from the appropriate category with a more natural, friendly tone
  const appropriateResponses = responses[sentiment] || responses.neutral;
  const randomIndex = Math.floor(Math.random() * appropriateResponses.length);
  
  return appropriateResponses[randomIndex];
};

export const getInitialBotMessages = (): string[] => {
  return [
    "Hey there! 👋 I'm your SentiAI friend, here to chat and provide support. How are you feeling today?",
    "Hi friend! I'm your SentiAI companion. I'm here to listen and support you whenever you need someone to talk to. What's on your mind?",
    "Welcome! I'm your judgment-free space to talk about anything. How's life treating you today?"
  ];
};
