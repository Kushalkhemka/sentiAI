
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useOpenAI from '@/hooks/useOpenAI';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const { saveApiKey, apiKeySet, clearApiKey } = useOpenAI();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveApiKey(apiKey)) {
      setApiKey('');
      onClose();
    }
  };

  const handleClearApiKey = () => {
    clearApiKey();
    setApiKey('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>OpenAI API Key</DialogTitle>
          <DialogDescription>
            Enter your OpenAI API key to enable advanced features like sentiment analysis,
            language detection, and text-to-speech capabilities.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apiKey" className="text-right col-span-1">
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="col-span-3"
                required
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Your API key is stored locally in your browser and is never sent to our servers.
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            {apiKeySet && (
              <Button type="button" variant="outline" onClick={handleClearApiKey}>
                Remove Key
              </Button>
            )}
            <Button type="submit">Save API Key</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
