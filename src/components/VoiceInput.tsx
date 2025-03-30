
import React, { useState, useEffect, useCallback } from "react";
import { Mic, MicOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceRecognitionState } from "@/types/chat";
import { toast } from "@/components/ui/use-toast";

interface VoiceInputProps {
  onTranscriptComplete: (transcript: string) => void;
  isDisabled?: boolean;
  onCancel?: () => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onTranscriptComplete,
  isDisabled = false,
  onCancel
}) => {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    transcript: "",
    error: null
  });

  // Define proper type for SpeechRecognition
  type SpeechRecognition = any;
  
  // Check if browser supports speech recognition
  const browserSupportsSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const startListening = useCallback(() => {
    if (!browserSupportsSpeechRecognition) {
      setState(prev => ({
        ...prev,
        error: "Your browser doesn't support speech recognition."
      }));
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Try using Chrome or Edge.",
        variant: "destructive"
      });
      return;
    }

    // Create speech recognition instance with proper type handling
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Default to English
    
    recognition.onstart = () => {
      setState(prev => ({
        ...prev,
        isListening: true,
        transcript: "",
        error: null
      }));
    };
    
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join("");
      
      setState(prev => ({
        ...prev,
        transcript
      }));
    };
    
    recognition.onerror = (event: any) => {
      setState(prev => ({
        ...prev,
        error: event.error
      }));
    };
    
    recognition.onend = () => {
      setState(prev => {
        // Only update if we were listening (avoid duplicate callbacks)
        if (prev.isListening && prev.transcript) {
          onTranscriptComplete(prev.transcript);
        }
        return {
          ...prev,
          isListening: false
        };
      });
    };
    
    try {
      recognition.start();
      
      // Store recognition instance to stop it later
      (window as any).currentRecognition = recognition;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Error starting speech recognition"
      }));
    }
  }, [browserSupportsSpeechRecognition, onTranscriptComplete]);

  const stopListening = useCallback(() => {
    if ((window as any).currentRecognition) {
      (window as any).currentRecognition.stop();
      delete (window as any).currentRecognition;
    }
  }, []);

  const handleCancel = () => {
    stopListening();
    if (onCancel) {
      onCancel();
    }
  };

  // Auto-start listening when the component mounts
  useEffect(() => {
    startListening();
    return stopListening;
  }, [startListening, stopListening]);

  return (
    <div className="relative flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
      <Button
        type="button"
        size="icon"
        variant={state.isListening ? "destructive" : "outline"}
        className="rounded-full h-10 w-10"
        onClick={state.isListening ? stopListening : startListening}
        disabled={isDisabled || !browserSupportsSpeechRecognition}
      >
        {state.isListening ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
        <span className="sr-only">
          {state.isListening ? "Stop voice input" : "Start voice input"}
        </span>
      </Button>
      
      <div className="flex-1">
        {state.isListening ? (
          <div className="text-sm">
            <div className="flex space-x-1 mb-1">
              <div className="h-2 w-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="h-2 w-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="h-2 w-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
              {state.transcript || "Listening..."}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Voice input ready</p>
        )}
      </div>

      <Button 
        size="icon"
        variant="ghost"
        className="rounded-full h-8 w-8"
        onClick={handleCancel}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Cancel</span>
      </Button>
    </div>
  );
};

export default VoiceInput;
