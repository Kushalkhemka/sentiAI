
import React from "react";
import { AlertCircle } from "lucide-react";
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ChatDisclaimerProps {
  onAccept: () => void;
}

const ChatDisclaimer: React.FC<ChatDisclaimerProps> = ({ onAccept }) => {
  return (
    <div className="p-4 max-w-2xl mx-auto animate-fade-in">
      <Alert className="bg-muted/70 border-primary/20">
        <AlertCircle className="h-5 w-5 text-primary" />
        <AlertTitle className="text-lg font-medium mb-2">
          Welcome to the Empathetic Chat Assistant
        </AlertTitle>
        <AlertDescription className="text-muted-foreground space-y-4">
          <p>
            This is an AI chat assistant designed to provide emotional support and engage in 
            empathetic conversation. Please be aware of the following:
          </p>
          
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Not a replacement for professional help</strong>: This tool does not replace 
              professional mental health services or emergency assistance.
            </li>
            <li>
              <strong>Privacy</strong>: Your conversations are analyzed to provide appropriate responses 
              but are not permanently stored.
            </li>
            <li>
              <strong>In case of emergency</strong>: If you're experiencing a crisis or emergency, 
              please contact a crisis helpline or emergency services immediately.
            </li>
          </ul>
          
          <div className="pt-4">
            <Button 
              onClick={onAccept}
              className="w-full bg-soothing-gradient hover:opacity-90 transition-opacity"
            >
              I understand, let's start chatting
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ChatDisclaimer;
