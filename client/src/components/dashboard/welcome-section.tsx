import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type WelcomeSectionProps = {
  username: string;
  progress: number;
};

export function WelcomeSection({ username, progress }: WelcomeSectionProps) {
  return (
    <Card className="overflow-hidden mb-6 bg-gradient-to-r from-primary/10 to-primary/5">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back{username ? `, ${username}` : ''}!</h2>
            <p className="text-muted-foreground mt-1">
              You've completed {progress}% of your career preparation journey. Your next opportunity awaits!
            </p>
          </div>
          <Button size="sm" className="w-full sm:w-auto">
            Continue Planning
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
