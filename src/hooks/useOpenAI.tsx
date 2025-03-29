
import { useState, useEffect } from 'react';
import { setOpenAIApiKey, isApiKeySet } from '@/utils/openaiService';
import { toast } from '@/components/ui/use-toast';

export const useOpenAI = () => {
  const [apiKeySet, setApiKeySet] = useState<boolean>(false);

  useEffect(() => {
    // Check if API key is in local storage
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setOpenAIApiKey(storedApiKey);
      setApiKeySet(true);
    }
  }, []);

  const saveApiKey = (apiKey: string) => {
    if (!apiKey || apiKey.trim() === '') {
      toast({
        title: "Invalid API Key",
        description: "Please provide a valid OpenAI API key",
        variant: "destructive",
      });
      return false;
    }

    try {
      setOpenAIApiKey(apiKey);
      localStorage.setItem('openai_api_key', apiKey);
      setApiKeySet(true);
      
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error saving API key:", error);
      
      toast({
        title: "Error Saving API Key",
        description: "There was an error saving your API key",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const clearApiKey = () => {
    try {
      setOpenAIApiKey('');
      localStorage.removeItem('openai_api_key');
      setApiKeySet(false);
      
      toast({
        title: "API Key Removed",
        description: "Your OpenAI API key has been removed",
      });
      
      return true;
    } catch (error) {
      console.error("Error removing API key:", error);
      return false;
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
