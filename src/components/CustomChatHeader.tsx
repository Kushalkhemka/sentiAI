
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Info } from "lucide-react";
import ChatSettings from './ChatSettings';
import ApiKeyModal from './ApiKeyModal';
import { UserPreferences } from '@/types/chat';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CustomChatHeaderProps {
  preferences: UserPreferences;
  onUpdatePreferences: (preferences: Partial<UserPreferences>) => void;
}

const CustomChatHeader: React.FC<CustomChatHeaderProps> = ({
  preferences,
  onUpdatePreferences
}) => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-bold">Empathetic AI Chat</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Info className="h-5 w-5" />
                <span className="sr-only">About</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-80">
                This AI assistant is designed to be empathetic and supportive.
                It can detect emotions, respond in multiple languages, and
                provide crisis resources when needed. Your conversations are
                private and stored locally.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex items-center space-x-2">
        <ChatSettings 
          preferences={preferences}
          onUpdatePreferences={onUpdatePreferences}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        />
      </div>
      
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
};

export default CustomChatHeader;
