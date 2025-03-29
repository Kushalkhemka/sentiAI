
import React, { useState, FormEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic } from "lucide-react";
import VoiceInput from "./VoiceInput";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  disabled = false 
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (message.trim() === "") return;
    
    onSendMessage(message);
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
      
      <div className="text-xs text-center mt-2 text-muted-foreground">
        <p>Press Enter to send. Shift+Enter for a new line.</p>
      </div>
    </form>
  );
};

export default MessageInput;
