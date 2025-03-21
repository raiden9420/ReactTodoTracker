import { CheckIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Goal = {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
};

type GoalsCardProps = {
  goals: Goal[];
};

export function GoalsCard({ goals }: GoalsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-start gap-2">
              <div className={`flex h-5 w-5 items-center justify-center rounded-full border border-primary/50 ${goal.completed ? 'bg-primary/10' : ''}`}>
                {goal.completed && <CheckIcon className="h-3 w-3 text-primary" />}
              </div>
              <div className="w-full">
                <p className="text-sm">{goal.title}</p>
                <div className="h-1.5 w-full bg-accent rounded-full mt-2">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Button variant="ghost" size="sm" className="mt-4">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add New Goal
        </Button>
      </CardContent>
    </Card>
  );
}
