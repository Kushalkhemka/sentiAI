import { useState, useEffect } from 'react';
import { isApiKeySet } from '@/utils/openaiService';
import { toast } from '@/components/ui/use-toast';

export const useOpenAI = () => {
  const [apiKeySet, setApiKeySet] = useState<boolean>(true); // Start with true since we're using a fixed key

  useEffect(() => {
    // Check if API key is valid (should always be true now)
    setApiKeySet(isApiKeySet());
  }, []);

  // Keeping these functions for backward compatibility
  const saveApiKey = (apiKey: string) => {
    toast({
      title: "Using Built-in API Key",
      description: "The application is using a built-in API key for all operations",
    });
    return true;
  };

  const clearApiKey = () => {
    toast({
      title: "Using Built-in API Key",
      description: "The application is using a built-in API key that cannot be removed",
    });
    return true;
  };

  return {
    apiKeySet,
    isApiKeySet,
    saveApiKey,
    clearApiKey
  };
};

export default useOpenAI;
