
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function CareerCoach() {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Your AI Career Coach</h1>
            <p className="text-muted-foreground text-lg">
              Get personalized career guidance and professional advice
            </p>
          </div>

          <Card className="relative min-h-[600px] p-6">
            <ScrollArea className="h-[500px] pr-4 mb-16">
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

            <div className="absolute bottom-6 left-6 right-6 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask your career question..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button onClick={sendMessage} disabled={isLoading}>
                Send
              </Button>
            </div>
          </Card>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Career Planning</h3>
              <p className="text-muted-foreground">Get guidance on your career path and development</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Resume Review</h3>
              <p className="text-muted-foreground">Get feedback on your resume and cover letter</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Interview Prep</h3>
              <p className="text-muted-foreground">Practice common interview questions and scenarios</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
