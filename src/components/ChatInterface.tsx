
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import ChatHistory from "./ChatHistory";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import ChatDisclaimer from "./ChatDisclaimer";
import { Message } from "@/types/chat";
import { analyzeSentiment } from "@/utils/sentimentAnalysis";
import { generateResponse, getInitialBotMessages } from "@/utils/chatResponses";
import { toast } from "@/components/ui/use-toast";

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  
  // Send initial bot message when disclaimer is accepted
  useEffect(() => {
    if (disclaimerAccepted && messages.length === 0) {
      const initialMessages = getInitialBotMessages();
      const randomIndex = Math.floor(Math.random() * initialMessages.length);
      
      const botMessage: Message = {
        id: uuidv4(),
        content: initialMessages[randomIndex],
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages([botMessage]);
    }
  }, [disclaimerAccepted, messages.length]);

  const handleSendMessage = (content: string) => {
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
    
    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    
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
    
    // Simulate bot response with a delay
    setTimeout(() => {
      const botResponse = generateResponse(content, sentimentResult.sentiment);
      
      const botMessage: Message = {
        id: uuidv4(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };
  
  if (!disclaimerAccepted) {
    return <ChatDisclaimer onAccept={() => setDisclaimerAccepted(true)} />;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto shadow-lg rounded-xl border overflow-hidden bg-background">
      <ChatHeader />
      
      <ChatHistory messages={messages} className="px-4" />
      
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
  );
};

export default ChatInterface;
