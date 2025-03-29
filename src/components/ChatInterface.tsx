import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatHistory from "./ChatHistory";
import CustomChatHeader from "./CustomChatHeader";
import MessageInput from "./MessageInput";
import ChatDisclaimer from "./ChatDisclaimer";
import ConversationSidebar from "./ConversationSidebar";
import ChatSuggestions from "./ChatSuggestions";
import { 
  Message, 
  ChatHistory as ChatHistoryType, 
  UserPreferences, 
  OpenAIMessage, 
  UserProfile,
  ChatSuggestion,
  HappinessRecord
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
} from "@/utils/openaiService";
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

const ChatInterface: React.FC = () => {
  const [conversations, setConversations] = useState<ChatHistoryType[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferredLanguage: "en",
    textToSpeechEnabled: false,
    autoTranslateEnabled: false,
    theme: "light"
  });
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);
  const [happinessRecords, setHappinessRecords] = useState<HappinessRecord[]>([]);
  const [chatSuggestions, setChatSuggestions] = useState<ChatSuggestion[]>([]);
  const [vectorDBInitialized, setVectorDBInitialized] = useState(false);
  
  const { apiKeySet } = useOpenAI();
  
  // Initialize VectorDB
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
  
  // Load conversations from local storage on initial render
  useEffect(() => {
    if (disclaimerAccepted) {
      const storedConversations = loadConversations();
      setConversations(storedConversations);
      
      // Load active conversation ID
      const storedActiveId = loadActiveConversationId();
      
      if (storedActiveId && storedConversations.some(c => c.id === storedActiveId)) {
        setActiveConversationId(storedActiveId);
      } else if (storedConversations.length > 0) {
        // Set the most recent conversation as active
        setActiveConversationId(storedConversations[0].id);
      } else {
        // Create a new conversation if none exist
        createNewConversation();
      }
      
      // Load user preferences
      const storedPreferences = localStorage.getItem('user_preferences');
      if (storedPreferences) {
        setPreferences(JSON.parse(storedPreferences));
      }
      
      // Load user profile
      const storedProfile = localStorage.getItem('user_profile');
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        // Convert string dates back to Date objects
        parsedProfile.createdAt = new Date(parsedProfile.createdAt);
        parsedProfile.updatedAt = new Date(parsedProfile.updatedAt);
        setUserProfile(parsedProfile);
      } else {
        // Check if we should prompt for user profile
        const profilePrompted = localStorage.getItem('profile_prompted');
        if (!profilePrompted) {
          // Set a timeout to show the profile form after a short delay
          setTimeout(() => {
            localStorage.setItem('profile_prompted', 'true');
            // Create a default profile that will be shown in the form
            setUserProfile({
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }, 2000);
        }
      }
      
      // Store existing conversations in VectorDB
      if (storedConversations.length > 0 && vectorDBInitialized) {
        storedConversations.forEach(conversation => {
          storeConversationHistoryInVectorDB(conversation);
        });
      }
      
      // Calculate happiness records
      const records = calculateHappinessRecords(storedConversations);
      setHappinessRecords(records);
    }
  }, [disclaimerAccepted, vectorDBInitialized]);
  
  // Save conversations to local storage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations);
      
      // Update happiness records
      const records = calculateHappinessRecords(conversations);
      setHappinessRecords(records);
    }
  }, [conversations]);
  
  // Save active conversation ID whenever it changes
  useEffect(() => {
    if (activeConversationId) {
      saveActiveConversationId(activeConversationId);
    }
  }, [activeConversationId]);
  
  // Save user preferences whenever they change
  useEffect(() => {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
    
    // Apply theme
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (preferences.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [preferences]);
  
  // Save user profile whenever it changes
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('user_profile', JSON.stringify(userProfile));
    }
  }, [userProfile]);
  
  // Generate chat suggestions when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      const activeConversation = conversations.find(c => c.id === activeConversationId);
      
      generateSuggestions(activeConversation || null, conversations, userProfile)
        .then(suggestions => {
          setChatSuggestions(suggestions);
        });
    } else {
      // Default suggestions for new conversation
      generateSuggestions(null, conversations, userProfile)
        .then(suggestions => {
          setChatSuggestions(suggestions);
        });
    }
  }, [activeConversationId, conversations, userProfile]);

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
      language: preferences.preferredLanguage
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversationId);
    
    // Generate new suggestions for the empty conversation
    generateSuggestions(null, conversations, userProfile)
      .then(suggestions => {
        setChatSuggestions(suggestions);
      });
  };
  
  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };
  
  const handleDeleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    
    // If the deleted conversation was active, set a new active conversation
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
    setPreferences(prev => ({
      ...prev,
      ...newPrefs
    }));
  };
  
  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    
    // Show confirmation toast
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved",
    });
  };

  const handleSendMessage = async (content: string, language?: string) => {
    // If no active conversation, create one
    if (!activeConversationId) {
      createNewConversation();
      return;
    }
    
    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      content,
      sender: "user",
      timestamp: new Date(),
    };
    
    // Detect language if not provided
    try {
      const detectedLanguage = language || await detectLanguage(content);
      userMessage.language = detectedLanguage;
      
      // Note: We no longer auto-translate, instead we always keep the original 
      // language and translate dynamically when displaying if needed
    } catch (error) {
      console.error("Error detecting language:", error);
    }
    
    // Analyze sentiment - always use OpenAI
    try {
      const sentimentResult = await analyzeWithOpenAI(content);
      userMessage.sentiment = sentimentResult;
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      const { analyzeSentiment } = await import("@/utils/sentimentAnalysis");
      userMessage.sentiment = analyzeSentiment(content).sentiment;
    }
    
    // Update the conversation
    setConversations(prev => {
      const updatedConversations = prev.map(conversation => {
        if (conversation.id === activeConversationId) {
          // If this is the first user message, set the conversation title
          let updatedTitle = conversation.title;
          let updatedLanguage = conversation.language;
          
          if (conversation.messages.length === 1 && conversation.messages[0].sender === "bot") {
            // Try to use OpenAI to generate a title
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
    
    // Show typing indicator
    setIsTyping(true);
    
    // If sentiment is urgent, show toast with crisis resources
    if (userMessage.sentiment === "urgent") {
      toast({
        title: "Crisis Resources",
        description: "If you're in crisis, please contact 988 Suicide & Crisis Lifeline (call or text 988) or text HOME to 741741 for the Crisis Text Line.",
        variant: "destructive",
        duration: 10000,
      });
    }
    
    // Get conversation history for context-aware responses
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    
    // Store the message in VectorDB for future reference
    if (vectorDBInitialized && activeConversationId) {
      storeMessageInVectorDB(userMessage, activeConversationId);
    }
    
    try {
      // Generate bot response
      let botResponse: string;
      
      // Get similar messages for context
      let contextMessages: SimilarMessage[] = [];
      if (vectorDBInitialized) {
        try {
          contextMessages = await findSimilarMessages(content, 3);
        } catch (error) {
          console.error("Error finding similar messages:", error);
        }
      }
      
      // Always use OpenAI for response generation
      const conversationMessages: OpenAIMessage[] = [];
      
      // Add system message with personalization
      let systemPrompt = `You are an empathetic AI assistant designed to provide emotional support and understanding. 
      You should respond with compassion, actively listen, and validate the user's feelings.
      If the user shows signs of crisis or mentions self-harm or suicide, provide resources like the 988 Crisis Lifeline.
      Keep responses concise (max 3-4 sentences) and focused on emotional support.`;
      
      // Add user profile information for personalization
      if (userProfile) {
        systemPrompt += `\nThe user has provided the following profile information:`;
        if (userProfile.name) systemPrompt += `\n- Name: ${userProfile.name}`;
        if (userProfile.gender) systemPrompt += `\n- Gender: ${userProfile.gender}`;
        if (userProfile.age) systemPrompt += `\n- Age: ${userProfile.age}`;
        systemPrompt += `\nTailor your response appropriately to this demographic information.`;
      }
      
      // Add sentiment info
      systemPrompt += `\nThe user's current sentiment is: ${userMessage.sentiment}.`;
      
      // Add similar past messages for context
      if (contextMessages.length > 0) {
        systemPrompt += `\n\nHere are some similar messages the user has sent in the past that may provide context:`;
        contextMessages.forEach(msg => {
          systemPrompt += `\n- "${msg.content}"`;
        });
      }
      
      // Add current language preference
      systemPrompt += `\n\nRespond in the following language: ${preferences.preferredLanguage}`;
      
      conversationMessages.push({
        role: "system",
        content: systemPrompt
      });
      
      // Add conversation history (last 10 messages for context)
      if (activeConversation) {
        const lastMessages = activeConversation.messages.slice(-10);
        
        for (const msg of lastMessages) {
          conversationMessages.push({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content
          });
        }
      }
      
      // Get response from OpenAI
      botResponse = await generateOpenAIResponse(conversationMessages, userMessage.sentiment);
      
      // Create bot message
      const botMessage: Message = {
        id: uuidv4(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
        language: preferences.preferredLanguage
      };
      
      // Add bot message to conversation
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
      
      // Generate new suggestions based on the updated conversation
      const updatedConversation = {
        ...activeConversation!,
        messages: [...activeConversation!.messages, userMessage, botMessage]
      };
      
      generateSuggestions(updatedConversation, conversations, userProfile)
        .then(suggestions => {
          setChatSuggestions(suggestions);
        });
      
    } catch (error) {
      console.error("Error generating response:", error);
      
      // Fallback response in case of API error
      const fallbackMessage: Message = {
        id: uuidv4(),
        content: "I'm sorry, I encountered an issue while processing your message. Could you try again?",
        sender: "bot",
        timestamp: new Date(),
        language: "en"
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
      // Hide typing indicator
      setIsTyping(false);
    }
  };
  
  const handleSelectSuggestion = (suggestion: string) => {
    handleSendMessage(suggestion);
  };
  
  // Find the active conversation
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
          userProfile={userProfile}
          onUpdateUserProfile={updateUserProfile}
        />
        
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
