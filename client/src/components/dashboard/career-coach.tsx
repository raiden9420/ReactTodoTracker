
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function CareerCoach({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m your AI career coach. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        body: JSON.stringify({ message: input })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-[350px] bg-background border-l p-4 shadow-lg z-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Career Coach</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>×</Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-140px)] pr-4">
        {messages.map((msg, i) => (
          <Card key={i} className={`mb-2 p-3 ${msg.role === 'assistant' ? 'bg-muted' : 'bg-primary/10'}`}>
            {msg.content}
          </Card>
        ))}
      </ScrollArea>

      <div className="absolute bottom-4 left-4 right-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask your career question..."
          disabled={isLoading}
        />
        <Button onClick={sendMessage} disabled={isLoading}>
          Send
        </Button>
      </div>
    </div>
  );
}
