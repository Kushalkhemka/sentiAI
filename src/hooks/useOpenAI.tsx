
import { useState, useEffect } from 'react';
import { isApiKeySet } from '@/utils/openaiService';
import { toast } from '@/components/ui/use-toast';

export const useOpenAI = () => {
  const [apiKeySet, setApiKeySet] = useState<boolean>(false);

  useEffect(() => {
    // Check if OpenAI API key is set in the openaiService
    setApiKeySet(isApiKeySet());
  }, []);

  return {
    apiKeySet,
    isApiKeySet
  };
};

export default useOpenAI;
