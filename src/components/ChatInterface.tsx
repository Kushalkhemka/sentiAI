import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatHistory from "./ChatHistory";
import CustomChatHeader from "./CustomChatHeader";
import MessageInput from "./MessageInput";
import ChatDisclaimer from "./ChatDisclaimer";
import ConversationSidebar from "./ConversationSidebar";
import ChatSuggestions from "./ChatSuggestions";
import MoodJourney from "./MoodJourney";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Message, 
  ChatHistory as ChatHistoryType, 
  UserPreferences, 
  OpenAIMessage, 
  UserProfile,
  ChatSuggestion,
  HappinessRecord,
  SimilarMessage
} from "@/types/chat";
import { toast } from "@/components/ui/use-toast";
import { 
  loadConversations, 
  saveConversations, 
  loadActiveConversationId, 
  saveActiveConversationId,
  findMainSentiment
} from "@/utils/storage";
import useOpenAI from "@/hooks/useOpenAI";
import { 
  analyzeWithOpenAI, 
  generateOpenAIResponse, 
  detectLanguage, 
  translateText, 
  generateTitle,
  isApiKeySet
} from "@/utils/openai";
import { generateResponse, getInitialBotMessages } from "@/utils/chatResponses";
import { generateConversationTitle } from "@/utils/sentimentAnalysis";
import { 
  initVectorDB, 
  storeMessageInVectorDB, 
  storeConversationHistoryInVectorDB, 
  findSimilarMessages 
} from "@/utils/vectorDB";
import { 
  generateSuggestions, 
  calculateHappinessRecords 
} from "@/utils/suggestionGenerator";
import { getSentimentColorTheme, applyColorTheme, resetToDefaultTheme } from "@/utils/adaptiveColors";

const ChatInterface: React.FC = () => {
  const [conversations, setConversations] = useState<ChatHistoryType[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferredLanguage: "en",
    textToSpeechEnabled: false,
    autoTranslateEnabled: false,
    theme: "light",
    adaptiveColorsEnabled: false
  });
  const [happinessRecords, setHappinessRecords] = useState<HappinessRecord[]>([]);
  const [chatSuggestions, setChatSuggestions] = useState<ChatSuggestion[]>([]);
  const [vectorDBInitialized, setVectorDBInitialized] = useState(false);
  const [showMoodJourney, setShowMoodJourney] = useState(false);
  
  const { apiKeySet } = useOpenAI();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);
  
  useEffect(() => {
    if (disclaimerAccepted && !vectorDBInitialized) {
      initVectorDB().then(success => {
        setVectorDBInitialized(success);
        if (success) {
          console.log("VectorDB initialized successfully");
        }
      });
    }
  }, [disclaimerAccepted, vectorDBInitialized]);
  
  useEffect(() => {
    if (disclaimerAccepted && user) {
      const storedConversations = loadUserConversations(user.id);
      
      setConversations(storedConversations);
      
      const storedActiveId = loadUserActiveConversationId(user.id);
      
      if (storedActiveId && storedConversations.some(c => c.id === storedActiveId)) {
        setActiveConversationId(storedActiveId);
      } else if (storedConversations.length > 0) {
        setActiveConversationId(storedConversations[0].id);
      } else {
        createNewConversation();
      }
      
      const storedPreferences = localStorage.getItem(`user_preferences_${user.id}`);
      if (storedPreferences) {
        const parsedPrefs = JSON.parse(storedPreferences) as UserPreferences;
        setPreferences(parsedPrefs);
        
        if (parsedPrefs.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (parsedPrefs.theme === 'light') {
          document.documentElement.classList.remove('dark');
        }
      }
      
      if (storedConversations.length > 0 && vectorDBInitialized) {
        storedConversations.forEach(conversation => {
          storeConversationHistoryInVectorDB(conversation);
        });
      }
      
      const records = calculateHappinessRecords(storedConversations);
      setHappinessRecords(records);
    }
  }, [disclaimerAccepted, vectorDBInitialized, user]);
  
  useEffect(() => {
    if (conversations.length > 0 && user) {
      saveUserConversations(user.id, conversations);
      
      const records = calculateHappinessRecords(conversations);
      setHappinessRecords(records);
    }
  }, [conversations, user]);
  
  useEffect(() => {
    if (activeConversationId && user) {
      saveUserActiveConversationId(user.id, activeConversationId);
    }
  }, [activeConversationId, user]);
  
  useEffect(() => {
    if (user) {
      localStorage.setItem(`user_preferences_${user.id}`, JSON.stringify(preferences));
    }
    
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (preferences.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    if (preferences.adaptiveColorsEnabled && activeConversationId) {
      const activeConversation = conversations.find(c => c.id === activeConversationId);
      if (activeConversation && activeConversation.mainSentiment) {
        const colorTheme = getSentimentColorTheme(activeConversation.mainSentiment);
        applyColorTheme(colorTheme, preferences.theme === 'dark');
      } else {
        resetToDefaultTheme(preferences.theme === 'dark');
      }
    } else {
      resetToDefaultTheme(preferences.theme === 'dark');
    }
  }, [preferences, activeConversationId, conversations, user]);
  
  useEffect(() => {
    if (activeConversationId) {
      const activeConversation = conversations.find(c => c.id === activeConversationId);
      
      if (preferences.adaptiveColorsEnabled && activeConversation?.mainSentiment) {
        const colorTheme = getSentimentColorTheme(activeConversation.mainSentiment);
        applyColorTheme(colorTheme, preferences.theme === 'dark');
      }
      
      generateSuggestions(activeConversation || null, conversations, user?.profile)
        .then(suggestions => {
          setChatSuggestions(suggestions);
        });
    } else {
      generateSuggestions(null, conversations, user?.profile)
        .then(suggestions => {
          setChatSuggestions(suggestions);
        });
    }
  }, [activeConversationId, conversations, user?.profile, preferences.adaptiveColorsEnabled, preferences.theme]);

  const createNewConversation = () => {
    const newConversationId = uuidv4();
    const initialBotMessages = getInitialBotMessages();
    const randomIndex = Math.floor(Math.random() * initialBotMessages.length);
    
    const botMessage: Message = {
      id: uuidv4(),
      content: initialBotMessages[randomIndex],
      sender: "bot",
      timestamp: new Date(),
    };
    
    const newConversation: ChatHistoryType = {
      id: newConversationId,
      title: "New conversation",
      messages: [botMessage],
      createdAt: new Date(),
      updatedAt: new Date(),
      language: preferences.preferredLanguage,
      userId: user?.id || 'anonymous'
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversationId);
    
    generateSuggestions(null, conversations, user?.profile)
      .then(suggestions => {
        setChatSuggestions(suggestions);
      });
  };
  
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };
  
  const handleDeleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    
    if (activeConversationId === conversationId) {
      const remainingConversations = conversations.filter(c => c.id !== conversationId);
      
      if (remainingConversations.length > 0) {
        setActiveConversationId(remainingConversations[0].id);
      } else {
        createNewConversation();
      }
    }
  };
  
  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const updatedPreferences = {
        ...prev,
        ...newPrefs
      };
      
      if (user) {
        localStorage.setItem(`user_preferences_${user.id}`, JSON.stringify(updatedPreferences));
      }
      
      return updatedPreferences;
    });
    
    toast({
      title: "Preferences Updated",
      description: "Your preferences have been saved",
    });
  };
  
  const updateUserProfile = (profile: UserProfile) => {
    if (!user) return;
    
    const { updateUserProfile } = useAuth();
    updateUserProfile(profile);
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved",
    });
  };

  const handleSendMessage = async (content: string, language?: string) => {
    if (!activeConversationId) {
      createNewConversation();
      return;
    }
    
    const userMessage: Message = {
      id: uuidv4(),
      content,
      sender: "user",
      timestamp: new Date(),
    };
    
    try {
      const detectedLanguage = language || await detectLanguage(content);
      userMessage.language = detectedLanguage;
      console.log(`Detected language for user message: ${detectedLanguage}`);
      
      if (preferences.preferredLanguage && preferences.preferredLanguage !== detectedLanguage && preferences.autoTranslateEnabled) {
        try {
          userMessage.originalText = content;
          userMessage.translatedFrom = detectedLanguage;
          const translatedContent = await translateText(content, preferences.preferredLanguage);
          userMessage.content = translatedContent;
          console.log(`Translated user message from ${detectedLanguage} to ${preferences.preferredLanguage}`);
        } catch (error) {
          console.error("Translation error:", error);
        }
      }
    } catch (error) {
      console.error("Error detecting language:", error);
      userMessage.language = preferences.preferredLanguage || "en";
    }
    
    try {
      const sentimentResult = await analyzeWithOpenAI(content);
      userMessage.sentiment = sentimentResult;
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      const { analyzeSentiment } = await import("@/utils/sentimentAnalysis");
      userMessage.sentiment = analyzeSentiment(content).sentiment;
    }
    
    setConversations(prev => {
      const updatedConversations = prev.map(conversation => {
        if (conversation.id === activeConversationId) {
          let updatedTitle = conversation.title;
          let updatedLanguage = conversation.language;
          
          if (conversation.messages.length === 1 && conversation.messages[0].sender === "bot") {
            generateTitle(content).then(title => {
              if (title) {
                setConversations(current => {
                  return current.map(c => {
                    if (c.id === activeConversationId) {
                      return { ...c, title };
                    }
                    return c;
                  });
                });
              }
            }).catch(err => console.error("Error generating title:", err));
            
            if (userMessage.language) {
              updatedLanguage = userMessage.language;
            }
          }
          
          const updatedMessages = [...conversation.messages, userMessage];
          const mainSentiment = findMainSentiment(updatedMessages);
          
          return {
            ...conversation,
            title: updatedTitle,
            messages: updatedMessages,
            updatedAt: new Date(),
            mainSentiment,
            language: updatedLanguage
          };
        }
        return conversation;
      });
      
      return updatedConversations;
    });
    
    setIsTyping(true);
    
    if (userMessage.sentiment === "urgent") {
      toast({
        title: "Crisis Resources",
        description: "If you're in crisis, please contact 988 Suicide & Crisis Lifeline (call or text 988) or text HOME to 741741 for the Crisis Text Line.",
        variant: "destructive",
        duration: 10000,
      });
    }
    
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    
    if (vectorDBInitialized && activeConversationId) {
      storeMessageInVectorDB(userMessage, activeConversationId);
    }
    
    try {
      let botResponse: string;
      
      let contextMessages: SimilarMessage[] = [];
      if (vectorDBInitialized) {
        try {
          contextMessages = await findSimilarMessages(content, 3);
        } catch (error) {
          console.error("Error finding similar messages:", error);
        }
      }
      
      const conversationMessages: OpenAIMessage[] = [];
      
      let systemPrompt = `You are an empathetic AI assistant designed to provide emotional support and understanding. 
      You should respond with compassion, actively listen, and validate the user's feelings.
      If the user shows signs of crisis or mentions self-harm or suicide, provide resources like the 988 Crisis Lifeline.
      Keep responses concise (max 3-4 sentences) and focused on emotional support.
      Speak as if you're the user's trusted confidant and use a conversational tone that feels personal and caring.`;
      
      if (user?.profile) {
        systemPrompt += `\nThe user has provided the following profile information:`;
        if (user.profile.name) systemPrompt += `\n- Name: ${user.profile.name}`;
        if (user.profile.gender) systemPrompt += `\n- Gender: ${user.profile.gender}`;
        if (user.profile.age) systemPrompt += `\n- Age: ${user.profile.age}`;
        systemPrompt += `\nTailor your response appropriately to this demographic information.`;
        systemPrompt += `\nAddress them by name occasionally to create connection.`;
        
        if (user.profile.gender === 'female') {
          systemPrompt += `\nUse a nurturing and supportive communication style.`;
        } else if (user.profile.gender === 'male') {
          systemPrompt += `\nUse a straightforward yet supportive communication style.`;
        }
        
        if (user.profile.age && user.profile.age < 18) {
          systemPrompt += `\nUse age-appropriate language for a teenager.`;
        } else if (user.profile.age && user.profile.age > 60) {
          systemPrompt += `\nUse clear, respectful language without condescension.`;
        }
      }
      
      systemPrompt += `\nThe user's current sentiment is: ${userMessage.sentiment}.`;
      
      if (contextMessages.length > 0) {
        systemPrompt += `\n\nHere are some similar messages the user has sent in the past that may provide context:`;
        contextMessages.forEach(msg => {
          systemPrompt += `\n- "${msg.content}"`;
        });
      }
      
      if (preferences.preferredLanguage) {
        systemPrompt += `\n\nIMPORTANT: You MUST respond in the following language: ${preferences.preferredLanguage}`;
      }
      
      conversationMessages.push({
        role: "system",
        content: systemPrompt
      });
      
      if (activeConversation) {
        const lastMessages = activeConversation.messages.slice(-8);
        
        for (const msg of lastMessages) {
          conversationMessages.push({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content
          });
        }
      }
      
      console.log("Generating AI response with preferred language:", preferences.preferredLanguage);
      
      try {
        botResponse = await generateOpenAIResponse(conversationMessages, userMessage.sentiment);
        console.log("Generated raw bot response");
      } catch (error) {
        console.error("OpenAI API error:", error);
        const { generateResponse } = await import("@/utils/chatResponses");
        botResponse = generateResponse(content, userMessage.sentiment);
      }
      
      if (preferences.autoTranslateEnabled && preferences.preferredLanguage) {
        try {
          const detectedLanguage = await detectLanguage(botResponse);
          console.log(`Detected language for bot response: ${detectedLanguage}`);
          
          if (detectedLanguage !== preferences.preferredLanguage) {
            console.log(`Translating bot response from ${detectedLanguage} to ${preferences.preferredLanguage}`);
            botResponse = await translateText(botResponse, preferences.preferredLanguage);
          }
        } catch (error) {
          console.error("Error translating bot response:", error);
        }
      }
      
      const botMessage: Message = {
        id: uuidv4(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
        language: preferences.preferredLanguage
      };
      
      setConversations(prev => {
        return prev.map(conversation => {
          if (conversation.id === activeConversationId) {
            return {
              ...conversation,
              messages: [...conversation.messages, botMessage],
              updatedAt: new Date()
            };
          }
          return conversation;
        });
      });
      
      const updatedConversation = {
        ...activeConversation!,
        messages: [...activeConversation!.messages, userMessage, botMessage]
      };
      
      generateSuggestions(updatedConversation, conversations, user?.profile)
        .then(suggestions => {
          setChatSuggestions(suggestions);
        });
      
    } catch (error) {
      console.error("Error generating response:", error);
      
      const fallbackMessage: Message = {
        id: uuidv4(),
        content: "I'm here to listen. What's on your mind today?",
        sender: "bot",
        timestamp: new Date(),
        language: preferences.preferredLanguage || "en"
      };
      
      setConversations(prev => {
        return prev.map(conversation => {
          if (conversation.id === activeConversationId) {
            return {
              ...conversation,
              messages: [...conversation.messages, fallbackMessage],
              updatedAt: new Date()
            };
          }
          return conversation;
        });
      });
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleSelectSuggestion = (suggestion: string) => {
    handleSendMessage(suggestion);
  };
  
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = activeConversation ? activeConversation.messages : [];
  
  if (!disclaimerAccepted) {
    return <ChatDisclaimer onAccept={() => setDisclaimerAccepted(true)} />;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-6xl mx-auto shadow-lg rounded-xl border overflow-hidden bg-background">
      <ConversationSidebar 
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={createNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />
      
      <div className="flex flex-col flex-1 h-full">
        <CustomChatHeader 
          preferences={preferences}
          onUpdatePreferences={updatePreferences}
          happinessRecords={happinessRecords}
          userProfile={user?.profile}
          onUpdateUserProfile={updateUserProfile}
          onToggleMoodJourney={() => setShowMoodJourney(!showMoodJourney)}
          showMoodJourney={showMoodJourney}
        />
        
        {showMoodJourney && (
          <div className="p-4 border-b">
            <MoodJourney records={happinessRecords} />
          </div>
        )}
        
        <ChatHistory messages={activeMessages} className="px-4" />
        
        {isTyping && (
          <div className="px-6 py-2">
            <div className="flex items-center space-x-2 text-muted-foreground text-sm">
              <div className="flex space-x-1">
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
              <span>AI is typing...</span>
            </div>
          </div>
        )}
        
        <div className="p-4 border-t mt-auto">
          {chatSuggestions.length > 0 && !isTyping && (
            <ChatSuggestions 
              suggestions={chatSuggestions}
              onSelectSuggestion={handleSelectSuggestion}
            />
          )}
          
          <MessageInput 
            onSendMessage={handleSendMessage} 
            disabled={isTyping || !disclaimerAccepted}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
