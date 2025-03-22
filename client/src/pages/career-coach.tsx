
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { SendIcon } from "lucide-react";

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export default function CareerCoach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user profile data
  const { data: userData } = useQuery({
    queryKey: ['/api/user/1'],
    queryFn: async () => {
      const response = await fetch('/api/user/1');
      return response.json();
    }
  });

  useEffect(() => {
    // Set initial welcome message
    setMessages([{
      role: 'assistant',
      content: "I am Emerge, let's rise! How can I help you today?"
    }]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/career-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          profile: userData?.user // Send user profile for context
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background p-4">
      <Card className="flex-1 flex flex-col p-4 mb-4">
        <ScrollArea className="flex-1 pr-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-4 ${
                msg.role === 'assistant'
                  ? 'bg-muted p-4 rounded-lg'
                  : 'bg-primary/10 p-4 rounded-lg ml-auto max-w-[80%]'
              }`}
            >
              {msg.content}
            </div>
          ))}
        </ScrollArea>
        <div className="flex gap-2 mt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about your career..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading}>
            <SendIcon className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
