
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatHistory from "./ChatHistory";
import CustomChatHeader from "./CustomChatHeader";
import MessageInput from "./MessageInput";
import ChatDisclaimer from "./ChatDisclaimer";
import ConversationSidebar from "./ConversationSidebar";
import { Message, ChatHistory as ChatHistoryType, UserPreferences, OpenAIMessage } from "@/types/chat";
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
  
  const { apiKeySet } = useOpenAI();
  
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
    }
  }, [disclaimerAccepted]);
  
  // Save conversations to local storage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations);
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
      
      // Handle translation if needed
      if (detectedLanguage !== preferences.preferredLanguage && preferences.autoTranslateEnabled) {
        const translated = await translateText(content, preferences.preferredLanguage);
        userMessage.originalText = content;
        userMessage.content = translated;
        userMessage.translatedFrom = detectedLanguage;
      }
    } catch (error) {
      console.error("Error detecting language:", error);
    }
    
    // Analyze sentiment - use OpenAI if available, otherwise fallback
    let sentimentResult;
    try {
      if (apiKeySet) {
        sentimentResult = await analyzeWithOpenAI(content);
        userMessage.sentiment = sentimentResult;
      } else {
        // Fallback to local sentiment analysis
        const { analyzeSentiment } = await import("@/utils/sentimentAnalysis");
        sentimentResult = analyzeSentiment(content).sentiment;
        userMessage.sentiment = sentimentResult;
      }
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      const { analyzeSentiment } = await import("@/utils/sentimentAnalysis");
      sentimentResult = analyzeSentiment(content).sentiment;
      userMessage.sentiment = sentimentResult;
    }
    
    // Update the conversation
    setConversations(prev => {
      const updatedConversations = prev.map(conversation => {
        if (conversation.id === activeConversationId) {
          // If this is the first user message, set the conversation title
          let updatedTitle = conversation.title;
          let updatedLanguage = conversation.language;
          
          if (conversation.messages.length === 1 && conversation.messages[0].sender === "bot") {
            // Try to use OpenAI to generate a title if API key is set
            if (apiKeySet) {
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
            } else {
              // Fallback to local title generation
              const { generateConversationTitle } = require("@/utils/sentimentAnalysis");
              updatedTitle = generateConversationTitle(content);
            }
            
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
    if (sentimentResult === "urgent") {
      toast({
        title: "Crisis Resources",
        description: "If you're in crisis, please contact 988 Suicide & Crisis Lifeline (call or text 988) or text HOME to 741741 for the Crisis Text Line.",
        variant: "destructive",
        duration: 10000,
      });
    }
    
    // Get conversation history for context-aware responses
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    
    try {
      // Generate bot response
      let botResponse: string;
      
      if (apiKeySet) {
        // If we have an OpenAI API key, use it to generate the response
        const conversationMessages: OpenAIMessage[] = [];
        
        // Add system message
        conversationMessages.push({
          role: "system",
          content: `You are an empathetic AI assistant designed to provide emotional support and understanding. 
          You should respond with compassion, actively listen, and validate the user's feelings.
          If the user shows signs of crisis or mentions self-harm or suicide, provide resources like the 988 Crisis Lifeline.
          Keep responses concise (max 3-4 sentences) and focused on emotional support.
          The user's current sentiment is: ${sentimentResult}.`
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
        botResponse = await generateOpenAIResponse(conversationMessages, sentimentResult);
      } else {
        // Fallback to local response generation
        const conversationHistory = activeConversation 
          ? activeConversation.messages.map(m => m.content).join(" ") 
          : "";
        
        botResponse = generateResponse(content, sentimentResult, conversationHistory);
      }
      
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
          <MessageInput 
            onSendMessage={handleSendMessage} 
            disabled={isTyping || !disclaimerAccepted || (isApiKeySet() === false && activeConversation?.messages.length > 5)}
          />
          
          {!apiKeySet && activeConversation?.messages.length > 4 && (
            <div className="text-center text-sm text-muted-foreground mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="font-medium text-amber-700 dark:text-amber-400">Add your OpenAI API key to enable advanced features</p>
              <p className="mt-1">Open settings to add your API key and unlock all features including better responses, sentiment analysis, and language detection.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
