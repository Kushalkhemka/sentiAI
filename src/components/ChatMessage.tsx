
import React from "react";
import { Message } from "../types/chat";
import { getSentimentColor } from "../utils/sentimentAnalysis";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
  showSentiment?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  showSentiment = true 
}) => {
  const { content, sender, sentiment, timestamp } = message;
  const isUser = sender === "user";
  
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp);
  
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className="max-w-[80%]">
        <div className={cn(
          "p-4 rounded-2xl",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-sm" 
            : "bg-muted text-foreground rounded-tl-sm"
        )}>
          <p className="whitespace-pre-wrap">{content}</p>
          
          {/* Show sentiment tag for user messages only if sentiment exists */}
          {isUser && sentiment && showSentiment && (
            <div className="flex justify-end mt-2">
              <span className={cn(
                "sentiment-tag",
                getSentimentColor(sentiment)
              )}>
                {sentiment}
              </span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "text-xs text-muted-foreground mt-1",
          isUser ? "text-right" : "text-left"
        )}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
