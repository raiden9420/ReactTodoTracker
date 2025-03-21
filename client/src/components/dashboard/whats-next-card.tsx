import { BookOpen, Play, Briefcase } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type WhatsNextProps = {
  course: {
    title: string;
  };
  video: {
    title: string;
  };
};

export function WhatsNextCard({ course, video }: WhatsNextProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalized Recommendations</CardTitle>
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
          
          <div>
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Career Guidance Video</h4>
                <p className="text-sm text-muted-foreground">{video.title}</p>
              </div>
            </div>
            <div className="relative mt-3 rounded-md overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1560264280-88b68371db39?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Interview preparation" 
                className="w-full h-32 object-cover" 
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="rounded-full bg-background/80 p-3">
                  <Play className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
          
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
            <Briefcase className="h-4 w-4" />
            View Suggested Job Matches
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
