import { Code2, Play } from "lucide-react";
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
        <CardTitle>What's Next</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-accent/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Recommended Course</h4>
                <p className="text-sm text-muted-foreground">{course.title}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-3">
              Continue
            </Button>
          </div>
          
          <div>
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Next Video</h4>
                <p className="text-sm text-muted-foreground">{video.title}</p>
              </div>
            </div>
            <div className="relative mt-3 rounded-md overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                alt="Python code preview" 
                className="w-full h-32 object-cover" 
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="rounded-full bg-background/80 p-3">
                  <Play className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
