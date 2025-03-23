import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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

interface CareerCoachChatbotProps {
  onClose: () => void;
}

export default function CareerCoachChatbot({ onClose }: CareerCoachChatbotProps) {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch user data
  const { data: userData, isLoading: isUserDataLoading, error: userDataError } = useQuery<UserData>({
    queryKey: ['/api/user'],
  });

  // Fetch chat history
  const { data: chatHistory, isLoading: isChatHistoryLoading } = useQuery<Message[]>({
    queryKey: ['/api/chat/history'],
  });

  // Send message mutation
  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/chat', { message });
      return response.json();
    },
    onSuccess: (data) => {
      // Add bot response to messages
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: data.id,
          message: data.message,
          sender: 'bot',
          timestamp: data.timestamp
        }
      ]);
      
      // Scroll to bottom after message is added
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: "Failed to get a response from the coach. Please try again."
      });
    }
  });

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Initialize chat with welcome message and history
  useEffect(() => {
    // Only set messages once when history is loaded
    if (chatHistory && messages.length === 0) {
      // Initialize messages with chat history
      setMessages(chatHistory);
      
      // If no history exists, add welcome message
      if (chatHistory.length === 0) {
        setMessages([{
          id: 0,
          message: "I am Emerge, let's rise! How can I help you today?",
          sender: 'bot',
          timestamp: new Date().toISOString()
        }]);
      }
      
      // Scroll to bottom after messages load
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [chatHistory, messages.length]);

  // Handle form submission
  const openLinkedInJobs = (subject: string) => {
    const searchQuery = encodeURIComponent(`${subject} jobs`);
    window.open(`https://www.linkedin.com/jobs/search/?keywords=${searchQuery}`, '_blank');
  };

  const handleJobSearch = () => {
    if (userData?.subjects && userData.subjects.length > 0) {
      const primarySubject = userData.subjects[0];
      openLinkedInJobs(primarySubject);
    } else {
      toast({
        title: "No subject selected",
        description: "Please complete your profile to search for relevant jobs.",
        variant: "default"
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim() || isSending) return;
    
    // Add user message to state immediately for UI responsiveness
    const userMessage: Message = {
      id: Date.now(), // Temporary ID
      message: userInput,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input field
    setUserInput('');
    
    // Scroll to bottom after user message is added
    setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    // Send message to API
    sendMessage(userInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm py-4 px-4 flex items-center border-b border-border">
        <button 
          className="text-muted-foreground hover:text-foreground mr-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
          onClick={onClose}
          aria-label="Back"
        >
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">Back</span>
        </button>
        <h1 className="text-xl font-semibold text-foreground">Career Coach</h1>
      </header>

      {/* Chat Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-background" 
      >
        {/* Loading State for User Data */}
        {isUserDataLoading && (
          <div className="flex justify-center py-6">
            <div className="animate-pulse flex space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>
          </div>
        )}

        {/* Error State for User Data */}
        {userDataError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p>Could not load your profile data. Using general career advice instead.</p>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.map((message, index) => (
          message.sender === 'bot' ? (
            // Bot Message
            <div key={index} className="flex items-start space-x-3 max-w-3xl">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold">E</span>
              </div>
              <div className="bg-card p-4 rounded-lg shadow-sm max-w-sm sm:max-w-md md:max-w-lg border border-border">
                <p className="text-foreground whitespace-pre-line">{message.message}</p>
              </div>
            </div>
          ) : (
            // User Message
            <div key={index} className="flex flex-row-reverse items-start max-w-3xl ml-auto">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-500 font-semibold">U</span>
              </div>
              <div className="bg-muted p-4 rounded-lg shadow-sm mr-3 max-w-sm sm:max-w-md md:max-w-lg">
                <p className="text-foreground">{message.message}</p>
              </div>
            </div>
          )
        ))}

        {/* Loading Message Indicator */}
        {isSending && (
          <div className="flex items-start space-x-3 max-w-3xl">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold">E</span>
            </div>
            <div className="bg-card p-3 rounded-lg shadow-sm border border-border">
              <div className="flex space-x-1">
                <div className="bg-primary/30 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="bg-primary/30 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="bg-primary/30 w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-card border-t border-border">
        <form 
          className="flex items-center space-x-2"
          onSubmit={handleSubmit}
        >
          <div className="relative flex-1">
            <Input 
              type="text" 
              id="user-input" 
              className="w-full px-4 py-3 bg-background border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors duration-200"
              placeholder="Type your question..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isSending}
              aria-label="Your message"
            />
          </div>
          <Button 
            type="submit" 
            className="inline-flex items-center justify-center p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!userInput.trim() || isSending}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
