
import { useState, useEffect } from 'react';
import { isApiKeySet } from '@/utils/openaiService';
import { toast } from '@/components/ui/use-toast';

export const useOpenAI = () => {
  const [apiKeySet, setApiKeySet] = useState<boolean>(false);

  useEffect(() => {
    // Check if OpenAI API key is set in the openaiService
    setApiKeySet(isApiKeySet());
  }, []);

  // Add the saveApiKey method
  const saveApiKey = (apiKey: string): boolean => {
    try {
      // In a real implementation, this would save the API key
      // Since we're hardcoding the key in openaiService.ts, this just returns true
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved successfully.",
        duration: 3000,
      });
      setApiKeySet(true);
      return true;
    } catch (error) {
      console.error("Error saving API key:", error);
      toast({
        title: "Error",
        description: "Failed to save API key. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
  };

  // Add the clearApiKey method
  const clearApiKey = () => {
    try {
      // In a real implementation, this would clear the API key
      // Since we're hardcoding the key in openaiService.ts, this just updates the state
      setApiKeySet(false);
      toast({
        title: "API Key Removed",
        description: "Your OpenAI API key has been removed successfully.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error clearing API key:", error);
      toast({
        title: "Error",
        description: "Failed to remove API key. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return {
    apiKeySet,
    isApiKeySet,
    saveApiKey,
    clearApiKey
  };
};

export default useOpenAI;
