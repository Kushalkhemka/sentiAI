
import React from "react";
import { ChatHistory, Sentiment } from "@/types/chat";
import { PlusCircle, MessageCircle, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSentimentColor } from "@/utils/sentimentAnalysis";
import { Button } from "@/components/ui/button";

interface ConversationSidebarProps {
  conversations: ChatHistory[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

// Get a more prominent color for the conversation sentiment indicator
const getSentimentIndicatorColor = (sentiment: Sentiment): string => {
  switch (sentiment) {
    case "positive":
      return "bg-green-500";
    case "hopeful":
      return "bg-green-400";
    case "calm":
      return "bg-blue-400";
    case "neutral":
      return "bg-gray-400";
    case "anxious":
      return "bg-yellow-500";
    case "overwhelmed":
      return "bg-orange-400";
    case "frustrated":
      return "bg-orange-500";
    case "confused":
      return "bg-amber-400";
    case "fearful":
      return "bg-red-400";
    case "negative":
      return "bg-red-500";
    case "depressed":
      return "bg-purple-500";
    case "suppressed":
      return "bg-indigo-400";
    case "urgent":
      return "bg-red-600";
    default:
      return "bg-gray-400";
  }
};

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation
}) => {
  return (
    <div className="w-64 h-full bg-white dark:bg-slate-900 border-r flex flex-col">
      <div className="p-4 border-b">
        <Button 
          onClick={onNewConversation}
          className="w-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center gap-2"
          variant="ghost"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div 
                key={conversation.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg cursor-pointer group",
                  activeConversationId === conversation.id 
                    ? "bg-primary/20" 
                    : "hover:bg-muted"
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MessageCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-sm">{conversation.title}</span>
                </div>
                
                {conversation.mainSentiment && (
                  <div className={cn(
                    "h-2 w-2 rounded-full flex-shrink-0",
                    getSentimentIndicatorColor(conversation.mainSentiment)
                  )} />
                )}
                
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                >
                  <Trash className="h-3 w-3" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;
