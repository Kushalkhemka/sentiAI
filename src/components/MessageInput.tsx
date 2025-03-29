
import React, { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  disabled = false 
}) => {
  const [message, setMessage] = useState("");

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

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-end gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="resize-none min-h-[60px] rounded-2xl bg-muted/50 border-primary/20 focus-visible:ring-primary/30"
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
