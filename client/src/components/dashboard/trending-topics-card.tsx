
import { TrendingUp, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

type Trend = {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'article' | 'post';
};

type TrendingTopicsProps = {
  userId: string;
};

async function fetchTrends(subject: string) {
  const response = await fetch(`/api/career-trends/${encodeURIComponent(subject)}`);
  if (!response.ok) throw new Error('Failed to fetch trends');
  return response.json();
}

export function TrendingTopicsCard({ userId }: TrendingTopicsProps) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['career-trends', userId],
    queryFn: () => fetchTrends('Biology'), // Replace with actual subject from user profile
    enabled: !!userId,
  });

  const trends = data?.data || [];
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>What's Hot</CardTitle>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trends.map((trend: Trend) => (
            <div key={trend.id} className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{trend.title}</h4>
                  <p className="text-sm text-muted-foreground">{trend.description}</p>
                  <Button 
                    variant="link" 
                    className="px-0 mt-2"
                    onClick={() => window.open(trend.url, '_blank')}
                  >
                    Read more
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {!isLoading && trends.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">No trends available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
