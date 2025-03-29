
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UserPreferences } from '@/types/chat';
import LanguageSelector from './LanguageSelector';

interface ChatSettingsProps {
  preferences: UserPreferences;
  onUpdatePreferences: (preferences: Partial<UserPreferences>) => void;
  onOpenApiKeyModal: () => void;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({
  preferences,
  onUpdatePreferences,
  onOpenApiKeyModal
}) => {
  const handleLanguageChange = (languageCode: string) => {
    onUpdatePreferences({ preferredLanguage: languageCode });
  };

  const handleToggleTextToSpeech = () => {
    onUpdatePreferences({ textToSpeechEnabled: !preferences.textToSpeechEnabled });
  };

  const handleToggleAutoTranslate = () => {
    onUpdatePreferences({ autoTranslateEnabled: !preferences.autoTranslateEnabled });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    onUpdatePreferences({ theme });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Chat Settings</SheetTitle>
          <SheetDescription>
            Configure your chat experience
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">API Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Connect your OpenAI API key to enable advanced features
            </p>
            <Button onClick={onOpenApiKeyModal} className="w-full">
              Configure API Key
            </Button>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Language</h3>
            <p className="text-sm text-muted-foreground">
              Select your preferred language
            </p>
            <LanguageSelector
              selectedLanguage={preferences.preferredLanguage}
              onSelectLanguage={handleLanguageChange}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Accessibility</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="text-to-speech">Text to Speech</Label>
                <p className="text-sm text-muted-foreground">
                  Enable speaking of AI responses
                </p>
              </div>
              <Switch
                id="text-to-speech"
                checked={preferences.textToSpeechEnabled}
                onCheckedChange={handleToggleTextToSpeech}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-translate">Auto Translate</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically translate messages to your preferred language
                </p>
              </div>
              <Switch
                id="auto-translate"
                checked={preferences.autoTranslateEnabled}
                onCheckedChange={handleToggleAutoTranslate}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Theme</h3>
            <div className="flex space-x-2">
              <Button
                variant={preferences.theme === 'light' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('light')}
                className="flex-1"
              >
                Light
              </Button>
              <Button
                variant={preferences.theme === 'dark' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('dark')}
                className="flex-1"
              >
                Dark
              </Button>
              <Button
                variant={preferences.theme === 'system' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('system')}
                className="flex-1"
              >
                System
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatSettings;
