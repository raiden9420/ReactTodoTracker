import { useState, useEffect } from 'react';
import { BookOpen, Play, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type WhatsNextProps = {
  userId: number;
  course: {
    title: string;
  };
};

export function WhatsNextCard({ userId, course }: WhatsNextProps) {
  const [video, setVideo] = useState<{ title: string; description: string; url: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const profileResponse = await fetch(`/api/user/${userId}`);
      const profileData = await profileResponse.json();

      if (!profileData.success || !profileData.user.hasProfile) {
        toast({
          title: "Profile Required",
          description: "Please complete your profile survey to get video recommendations.",
          variant: "default"
        });
        return;
      }

      const response = await fetch(`/api/personalized-recommendations/${userId}`);
      const data = await response.json();

      if (data.success && data.data.video) {
        setVideo(data.data.video);
      } else {
        throw new Error(data.message || 'Failed to load video recommendation');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: "Please ensure your profile is complete and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchRecommendationsIfProfileExists = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/personalized-recommendations/${userId}`);
        const data = await response.json();

        if (data.success) {
          if (data.data.needsProfile) {
            toast({
              title: "Profile Required",
              description: "Please complete your profile survey first to get personalized recommendations.",
              variant: "default"
            });
            return;
          }
          if (data.data.video) {
            setVideo(data.data.video);
          }
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        toast({
          title: "Error",
          description: "Unable to load recommendations. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendationsIfProfileExists();
  }, [userId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Personalized Recommendations</CardTitle>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchRecommendations}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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

          {video && (
            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Next Video</h4>
                  <a 
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {video.title}
                  </a>
                  <p className="text-xs text-muted-foreground mt-1">{video.description}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-3" asChild>
                <a href={video.url} target="_blank" rel="noopener noreferrer">
                  Watch Video
                </a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}