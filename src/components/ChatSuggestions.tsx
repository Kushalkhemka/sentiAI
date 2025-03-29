
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Message, Sentiment } from '@/types/chat';
import { MessageCircleMore, Wind, Brain, Heart } from 'lucide-react';

interface ChatSuggestionProps {
  messages: Message[];
  onSuggestionClick: (suggestion: string) => void;
  sentiment?: Sentiment;
}

const ChatSuggestions: React.FC<ChatSuggestionProps> = ({ 
  messages, 
  onSuggestionClick,
  sentiment = "neutral"
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  useEffect(() => {
    // Generate suggestions based on conversation context and sentiment
    const newSuggestions: string[] = [];
    
    // General suggestions for new chats (empty or just started)
    if (messages.length <= 2) {
      newSuggestions.push("How can I help you today?");
      newSuggestions.push("Tell me about something that's on your mind.");
      newSuggestions.push("How are you feeling right now?");
      newSuggestions.push("What brings you here today?");
      setSuggestions(newSuggestions);
      return;
    }
    
    // Sentiment-based suggestions
    switch(sentiment) {
      case "anxious":
        newSuggestions.push("Can you tell me more about what's making you anxious?");
        newSuggestions.push("When did you start feeling this way?");
        newSuggestions.push("What helps you relax when you're feeling anxious?");
        break;
      case "depressed":
        newSuggestions.push("What small thing might help you feel a bit better today?");
        newSuggestions.push("Have you felt this way before?");
        newSuggestions.push("Is there someone you can reach out to?");
        break;
      case "frustrated":
        newSuggestions.push("What specifically is frustrating you the most?");
        newSuggestions.push("How have you handled similar situations in the past?");
        newSuggestions.push("What would make this situation better?");
        break;
      case "overwhelmed":
        newSuggestions.push("What's one small task you could focus on right now?");
        newSuggestions.push("Can you break down what you're facing into smaller steps?");
        newSuggestions.push("Would it help to talk about what's overwhelming you?");
        break;
      case "positive":
        newSuggestions.push("What's contributed to your positive mood today?");
        newSuggestions.push("How can you maintain this positivity?");
        newSuggestions.push("What are you looking forward to?");
        break;
      case "hopeful":
        newSuggestions.push("What's giving you hope right now?");
        newSuggestions.push("What positive change are you hoping for?");
        newSuggestions.push("How can you build on this hopeful feeling?");
        break;
      default:
        // Context-based suggestions
        if (messages.some(m => m.content.toLowerCase().includes("work"))) {
          newSuggestions.push("How is your work-life balance currently?");
          newSuggestions.push("What aspects of your work do you find most challenging?");
        }
        
        if (messages.some(m => m.content.toLowerCase().includes("family") || m.content.toLowerCase().includes("friend"))) {
          newSuggestions.push("How are your relationships affecting your wellbeing?");
          newSuggestions.push("Is there a specific relationship you'd like to talk about?");
        }
        
        if (messages.some(m => m.content.toLowerCase().includes("sleep") || m.content.toLowerCase().includes("tired"))) {
          newSuggestions.push("How has your sleep been lately?");
          newSuggestions.push("What helps you sleep better?");
        }

        // General follow-ups
        newSuggestions.push("How does that make you feel?");
        newSuggestions.push("Can you tell me more about that?");
        break;
    }
    
    // Always ensure we have at least 3 suggestions
    if (newSuggestions.length < 3) {
      newSuggestions.push("Is there anything specific you'd like to discuss today?");
      newSuggestions.push("How can I best support you right now?");
    }
    
    // Shuffle and limit suggestions
    setSuggestions(shuffleArray(newSuggestions).slice(0, 3));
  }, [messages, sentiment]);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: string[]): string[] => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="flex items-center space-x-1 text-xs"
          onClick={() => onSuggestionClick(suggestion)}
        >
          {index % 3 === 0 && <MessageCircleMore className="h-3 w-3 mr-1" />}
          {index % 3 === 1 && <Brain className="h-3 w-3 mr-1" />}
          {index % 3 === 2 && <Heart className="h-3 w-3 mr-1" />}
          {suggestion}
        </Button>
      ))}
    </div>
  );
};

export default ChatSuggestions;
