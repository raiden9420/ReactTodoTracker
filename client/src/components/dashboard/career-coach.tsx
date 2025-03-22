
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send } from "lucide-react";

type Message = {
  id: number;
  message: string;
  sender: 'user' | 'bot';
  timestamp: string;
};

type UserData = {
  id: number;
  username: string;
  subjects: string[] | null;
  interests: string[] | null;
  skills: string[] | null;
  goal: string | null;
  thinkingStyle: string | null;
  extraInfo: string | null;
};

interface CareerCoachProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CareerCoach({ isOpen, onClose }: CareerCoachProps) {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch user data
  const { data: userData } = useQuery<UserData>({
    queryKey: ['/api/user/1'], // Using default user ID 1
  });

  // Send message mutation
  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/career-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          userData // Include user data for context
        })
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: Date.now(),
            message: data.response,
            sender: 'bot',
            timestamp: new Date().toISOString()
          }
        ]);
        scrollToBottom();
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response. Please try again."
      });
    }
  });

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 0,
        message: "Hi! I'm your AI career coach. I can help you explore career paths, develop skills, and achieve your professional goals. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isSending) return;

    const userMessage = {
      id: Date.now(),
      message: userInput,
      sender: 'user' as const,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    scrollToBottom();
    sendMessage(userInput);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="bg-card shadow-sm py-4 px-4 flex items-center border-b border-border">
        <button 
          className="text-muted-foreground hover:text-foreground mr-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
          onClick={onClose}
          aria-label="Back"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Career Coach</h1>
      </header>

      <ScrollArea className="flex-1 p-4">
        <div ref={chatContainerRef} className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'bot' ? 'items-start space-x-3' : 'flex-row-reverse items-start'} max-w-3xl ${message.sender === 'user' ? 'ml-auto' : ''}`}
            >
              <div className={`flex-shrink-0 h-10 w-10 rounded-full ${message.sender === 'bot' ? 'bg-primary/20' : 'bg-green-500/20'} flex items-center justify-center`}>
                <span className={message.sender === 'bot' ? 'text-primary font-semibold' : 'text-green-500 font-semibold'}>
                  {message.sender === 'bot' ? 'E' : 'U'}
                </span>
              </div>
              <div className={`${message.sender === 'bot' ? 'bg-card border border-border' : 'bg-muted'} p-4 rounded-lg shadow-sm max-w-sm sm:max-w-md md:max-w-lg ${message.sender === 'user' ? 'mr-3' : ''}`}>
                <p className="text-foreground whitespace-pre-line">{message.message}</p>
              </div>
            </div>
          ))}
          
          {isSending && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold">E</span>
              </div>
              <Card className="p-3">
                <div className="flex space-x-1">
                  <div className="bg-primary/30 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="bg-primary/30 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="bg-primary/30 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 bg-card border-t border-border">
        <form className="flex items-center space-x-2" onSubmit={handleSubmit}>
          <Input 
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your question..."
            disabled={isSending}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!userInput.trim() || isSending}
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
