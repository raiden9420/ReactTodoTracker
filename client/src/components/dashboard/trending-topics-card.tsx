import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <CardHeader>
        <CardTitle>Trending Topics</CardTitle>
      </CardHeader>
      <CardContent>
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
                  <span className="text-xs text-muted-foreground">{topic.percentage}%</span>
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
      </CardContent>
    </Card>
  );
}
