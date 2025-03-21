
import { useState } from 'react';
import { BookOpen, Play, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

type WhatsNextProps = {
  userId: number;
  course: {
    title: string;
  };
  video: {
    title: string;
    description: string;
    url: string;
  };
};

export function WhatsNextCard({ userId, course, video }: WhatsNextProps) {
  const [isLoading, setIsLoading] = useState(false);

  const refreshRecommendations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/personalized-recommendations/${userId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }

      toast({
        title: "Recommendations refreshed",
        description: "Your personalized recommendations have been updated."
      });
      
      // Trigger parent component to refresh data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Personalized Recommendations</CardTitle>
        <Button 
          variant="outline" 
          size="icon"
          onClick={refreshRecommendations}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-accent/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Recommended Course</h4>
                <p className="text-sm text-muted-foreground">{course.title}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-3">
              Explore Course
            </Button>
          </div>
          
          <div className="bg-accent/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Career Guidance Video</h4>
                <p className="text-sm text-muted-foreground">{video.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{video.description}</p>
                <a 
                  href={video.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline mt-2 inline-block"
                >
                  Watch Video
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
