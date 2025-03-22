
import { useState, useEffect } from "react";
import { BookOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

type WhatsNextProps = {
  userId: number;
};

export function WhatsNextCard({ userId }: WhatsNextProps) {
  const [video, setVideo] = useState<{ title: string; description: string; url: string } | null>(null);
  const [course, setCourse] = useState<{ title: string; description: string; duration: string; level: string } | null>(null);
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
          description: "Please complete your profile survey to get recommendations.",
          variant: "default"
        });
        return;
      }

      // Fetch video recommendation
      const videoResponse = await fetch(`/api/personalized-recommendations/${userId}`);
      const videoData = await videoResponse.json();

      if (videoData.success && videoData.data.video) {
        setVideo(videoData.data.video);
      }

      // Fetch course recommendation
      const courseResponse = await fetch(`/api/course-recommendation/${userId}`);
      const courseData = await courseResponse.json();
      
      if (courseData.success && courseData.course) {
        setCourse(courseData.course);
      } else {
        toast({
          title: "Course Recommendation",
          description: "Unable to load course recommendation. Please try again.",
          variant: "default"
        });
      }

      if (courseData.success && courseData.course) {
        setCourse(courseData.course);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load recommendations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
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
          {course && (
            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{course.title}</h4>
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-primary/10 px-2 py-1 rounded">{course.duration}</span>
                    <span className="text-xs bg-primary/10 px-2 py-1 rounded">{course.level}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-3">
                Start Learning
              </Button>
            </div>
          )}
          {video && (
            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Recommended Video</h4>
                  <p className="text-sm text-muted-foreground">{video.title}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-3" onClick={() => window.open(video.url, '_blank')}>
                Watch Video
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
