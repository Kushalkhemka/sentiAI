
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Info, User } from "lucide-react";
import ChatSettings from './ChatSettings';
import ApiKeyModal from './ApiKeyModal';
import HappinessMeter from './HappinessMeter';
import { UserPreferences, HappinessRecord, UserProfile } from '@/types/chat';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserProfileForm from './UserProfileForm';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CustomChatHeaderProps {
  preferences: UserPreferences;
  onUpdatePreferences: (preferences: Partial<UserPreferences>) => void;
  happinessRecords: HappinessRecord[];
  userProfile?: UserProfile;
  onUpdateUserProfile: (profile: UserProfile) => void;
}

const CustomChatHeader: React.FC<CustomChatHeaderProps> = ({
  preferences,
  onUpdatePreferences,
  happinessRecords,
  userProfile,
  onUpdateUserProfile
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
      
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="hidden sm:flex">
              Mood Tracker
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <HappinessMeter records={happinessRecords} />
          </PopoverContent>
        </Popover>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={() => setIsProfileModalOpen(true)}
        >
          <User className="h-5 w-5" />
          <span className="sr-only">User Profile</span>
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
      
      <UserProfileForm
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={onUpdateUserProfile}
        initialProfile={userProfile}
      />
    </div>
  );
};

export default CustomChatHeader;
