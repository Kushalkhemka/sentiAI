
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChatSuggestion } from '@/types/chat';
import { MessageCircle, Star } from "lucide-react";

interface ChatSuggestionsProps {
  suggestions: ChatSuggestion[];
  onSelectSuggestion: (suggestion: string) => void;
}

const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({
  suggestions,
  onSelectSuggestion
}) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap gap-2 mb-4 mt-2">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="flex items-center gap-1 text-left"
          onClick={() => onSelectSuggestion(suggestion.text)}
        >
          {suggestion.type === 'question' ? (
            <MessageCircle className="h-3 w-3" />
          ) : (
            <Star className="h-3 w-3" />
          )}
          <span className="truncate max-w-[200px]">{suggestion.text}</span>
        </Button>
      ))}
    </div>
  );
};

export default ChatSuggestions;
