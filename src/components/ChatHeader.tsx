
import React from "react";
import { cn } from "@/lib/utils";
import { HeartPulse } from "lucide-react";

interface ChatHeaderProps {
  className?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ className }) => {
  return (
    <div className={cn(
      "py-4 px-6 border-b flex items-center justify-between sticky top-0 bg-background z-10",
      className
    )}>
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-soothing-gradient flex items-center justify-center text-white">
          <HeartPulse className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-semibold text-lg">SentiAI Chat</h1>
          <p className="text-xs text-muted-foreground">AI-powered emotional support</p>
        </div>
      </div>
      
      <div className="flex items-center">
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse-slow mr-2"></span>
        <span className="text-sm text-muted-foreground">Online</span>
      </div>
    </div>
  );
};

export default ChatHeader;
