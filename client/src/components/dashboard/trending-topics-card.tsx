import { TrendingUp, InfoIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Topic = {
  id: string;
  name: string;
  primary?: boolean;
  percentage?: number;
};

type TrendingTopicsProps = {
  topics: Topic[];
};

export function TrendingTopicsCard({ topics }: TrendingTopicsProps) {
  const topicsWithStats = topics.filter(topic => topic.percentage !== undefined);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Career Market Trends</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Growing industries and skills in your field
        </p>
        
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <Badge 
              key={topic.id} 
              variant={topic.primary ? "default" : "secondary"}
            >
              {topic.name}
            </Badge>
          ))}
        </div>
        
        {topicsWithStats.length > 0 && (
          <div className="mt-6 space-y-4">
            {topicsWithStats.map((topic) => (
              <div key={`stat-${topic.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${topic.primary ? 'bg-primary' : 'bg-secondary'}`}></div>
                    <span className="text-sm">{topic.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">{topic.percentage}% growth</span>
                    <InfoIcon className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="h-2 w-full bg-accent rounded-full mt-2">
                  <div 
                    className={`h-full ${topic.primary ? 'bg-primary' : 'bg-secondary'} rounded-full`} 
                    style={{ width: `${topic.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Button variant="link" size="sm" className="mt-4 px-0">
          View complete industry report
        </Button>
      </CardContent>
    </Card>
  );
}
