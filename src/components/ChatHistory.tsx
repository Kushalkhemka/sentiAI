
import React, { useEffect, useRef } from "react";
import { Message } from "@/types/chat";
import ChatMessage from "./ChatMessage";
import { cn } from "@/lib/utils";

interface ChatHistoryProps {
  messages: Message[];
  className?: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  messages,
  className
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={cn("flex-1 overflow-y-auto px-4 py-6", className)}>
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <p>Start chatting to get support</p>
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatHistory;
