
import React, { useState, useEffect, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceRecognitionState } from "@/types/chat";
import { toast } from "@/components/ui/use-toast";

interface VoiceInputProps {
  onTranscriptComplete: (transcript: string) => void;
  isDisabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onTranscriptComplete,
  isDisabled = false
}) => {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    transcript: "",
    error: null
  });

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

    // Create speech recognition instance
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return (
    <div>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={`rounded-full h-10 w-10 ${state.isListening ? 'bg-red-100 text-red-500' : ''}`}
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
      
      {state.isListening && (
        <div className="text-xs mt-1 text-muted-foreground">
          <div className="flex space-x-1 justify-center">
            <div className="h-1.5 w-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="h-1.5 w-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="h-1.5 w-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
          <p>Listening...</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
