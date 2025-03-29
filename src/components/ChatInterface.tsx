
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatHistory from "./ChatHistory";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import ChatDisclaimer from "./ChatDisclaimer";
import ConversationSidebar from "./ConversationSidebar";
import { Message, ChatHistory as ChatHistoryType } from "@/types/chat";
import { analyzeSentiment } from "@/utils/sentimentAnalysis";
import { generateResponse, getInitialBotMessages } from "@/utils/chatResponses";
import { toast } from "@/components/ui/use-toast";
import { 
  loadConversations, 
  saveConversations, 
  loadActiveConversationId, 
  saveActiveConversationId,
  findMainSentiment
} from "@/utils/storage";
import { generateConversationTitle } from "@/utils/sentimentAnalysis";

const ChatInterface: React.FC = () => {
  const [conversations, setConversations] = useState<ChatHistoryType[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  
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

  const handleSendMessage = (content: string) => {
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
    
    // Analyze sentiment
    const sentimentResult = analyzeSentiment(content);
    userMessage.sentiment = sentimentResult.sentiment;
    
    // Update the conversation
    setConversations(prev => {
      const updatedConversations = prev.map(conversation => {
        if (conversation.id === activeConversationId) {
          // If this is the first user message, set the conversation title
          let updatedTitle = conversation.title;
          if (conversation.messages.length === 1 && conversation.messages[0].sender === "bot") {
            updatedTitle = generateConversationTitle(content);
          }
          
          const updatedMessages = [...conversation.messages, userMessage];
          const mainSentiment = findMainSentiment(updatedMessages);
          
          return {
            ...conversation,
            title: updatedTitle,
            messages: updatedMessages,
            updatedAt: new Date(),
            mainSentiment
          };
        }
        return conversation;
      });
      
      return updatedConversations;
    });
    
    // Show typing indicator
    setIsTyping(true);
    
    // If sentiment is urgent, show toast with crisis resources
    if (sentimentResult.sentiment === "urgent") {
      toast({
        title: "Crisis Resources",
        description: "If you're in crisis, please contact 988 Suicide & Crisis Lifeline (call or text 988) or text HOME to 741741 for the Crisis Text Line.",
        variant: "destructive",
        duration: 10000,
      });
    }
    
    // Get conversation history for context-aware responses
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const conversationHistory = activeConversation 
      ? activeConversation.messages.map(m => m.content).join(" ") 
      : "";
    
    // Simulate bot response with a delay
    setTimeout(() => {
      const botResponse = generateResponse(content, sentimentResult.sentiment, conversationHistory);
      
      const botMessage: Message = {
        id: uuidv4(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
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
      
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
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
        <ChatHeader />
        
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
          <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
