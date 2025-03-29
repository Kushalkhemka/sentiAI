
import React, { useState, FormEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Globe } from "lucide-react";
import VoiceInput from "./VoiceInput";
import LanguageSelector from "./LanguageSelector";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MessageInputProps {
  onSendMessage: (message: string, language?: string) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  disabled = false 
}) => {
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("en");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (message.trim() === "") return;
    
    onSendMessage(message, language);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setMessage(transcript);
    
    // Focus the textarea after receiving voice input
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "60px"; // Reset height
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`; // Limit max height
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-end gap-2">
        <VoiceInput 
          onTranscriptComplete={handleVoiceInput} 
          isDisabled={disabled} 
        />
        
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="resize-none min-h-[60px] max-h-[200px] rounded-xl bg-muted/50 border-primary/20 focus-visible:ring-primary/30"
          disabled={disabled}
        />
        
        <div className="flex flex-col gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="rounded-full h-[30px] w-[30px]"
                disabled={disabled}
              >
                <Globe className="h-4 w-4" />
                <span className="sr-only">Select language</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2">
              <LanguageSelector
                selectedLanguage={language}
                onSelectLanguage={setLanguage}
                disabled={disabled}
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full h-[60px] w-[60px] bg-primary hover:bg-primary/90"
            disabled={disabled || message.trim() === ""}
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
      
      <div className="text-xs text-center mt-2 text-muted-foreground">
        <p>Press Enter to send. Shift+Enter for a new line.</p>
      </div>
    </form>
  );
};

export default MessageInput;
