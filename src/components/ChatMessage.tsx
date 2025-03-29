
import React from "react";
import { Message } from "../types/chat";
import { getSentimentColor } from "../utils/sentimentAnalysis";
import { cn } from "@/lib/utils";
import TextToSpeech from "./TextToSpeech";

interface ChatMessageProps {
  message: Message;
  showSentiment?: boolean;
  showTextToSpeech?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  showSentiment = true,
  showTextToSpeech = true
}) => {
  const { content, sender, sentiment, timestamp, language } = message;
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
                "text-xs px-2 py-1 rounded-full font-medium",
                getSentimentColor(sentiment)
              )}>
                {sentiment}
              </span>
            </div>
          )}
          
          {/* Show language indicator if available */}
          {language && language !== 'en' && (
            <div className="text-xs text-muted-foreground mt-1">
              Detected language: {language}
            </div>
          )}
        </div>
        
        <div className={cn(
          "flex items-center text-xs text-muted-foreground mt-1",
          isUser ? "justify-end" : "justify-start"
        )}>
          {!isUser && showTextToSpeech && (
            <TextToSpeech text={content} />
          )}
          <span>{formattedTime}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
