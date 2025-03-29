
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from 'lucide-react';
import { textToSpeech } from '@/utils/openaiService';
import { toast } from '@/components/ui/use-toast';

interface TextToSpeechProps {
  text: string;
  disabled?: boolean;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text, disabled = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      
      const audioData = await textToSpeech(text);
      
      // Create audio blob and URL
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      
      // Create and play audio element
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
        
        // Add event listener for when audio ends
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
        });
      } else {
        audioRef.current.src = url;
      }
      
      audioRef.current.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      
      toast({
        title: "Text-to-Speech Error",
        description: "There was an error generating the audio. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Clean up audio resources when component unmounts
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={`rounded-full h-7 w-7 ${isPlaying ? 'bg-primary/20' : ''}`}
      onClick={handlePlay}
      disabled={disabled || !text}
    >
      {isPlaying ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      <span className="sr-only">
        {isPlaying ? "Stop speaking" : "Listen"}
      </span>
    </Button>
  );
};

export default TextToSpeech;
