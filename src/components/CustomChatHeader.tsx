
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Info, User } from "lucide-react";
import ChatSettings from './ChatSettings';
import ApiKeyModal from './ApiKeyModal';
import UserProfile from './UserProfile';
import HappinessMeter from './HappinessMeter';
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
  messages: any[];
}

const CustomChatHeader: React.FC<CustomChatHeaderProps> = ({
  preferences,
  onUpdatePreferences,
  messages
}) => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
      
      <div className="hidden md:block w-56">
        <HappinessMeter messages={messages} />
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={() => setIsProfileModalOpen(true)}
        >
          <User className="h-5 w-5" />
          <span className="sr-only">Profile</span>
        </Button>
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
      
      <UserProfile
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        preferences={preferences}
        onUpdatePreferences={onUpdatePreferences}
      />
    </div>
  );
};

export default CustomChatHeader;
