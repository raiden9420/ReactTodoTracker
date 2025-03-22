
import { TrendingUp, RefreshCw, BookOpen, Twitter } from "lucide-react";
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
    queryFn: async () => {
      const userResponse = await fetch(`/api/user/${userId}`);
      const userData = await userResponse.json();
      const subject = userData.user.subjects?.[0] || 'Career Development';
      return fetchTrends(subject);
    },
    enabled: !!userId,
    refetchInterval: 1000 * 60 * 30, // Refresh every 30 minutes
  });

  const trends = data?.data || [];
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          What's Hot
        </CardTitle>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => refetch()}
          disabled={isLoading}
          title="Refresh trends"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trends.map((trend: Trend) => (
            <div key={trend.id} className="bg-accent/50 rounded-lg p-4 hover:bg-accent/70 transition-colors">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  {trend.type === 'article' ? (
                    <BookOpen className="h-5 w-5 text-primary" />
                  ) : (
                    <Twitter className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium leading-tight">{trend.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{trend.description}</p>
                  <a 
                    href={trend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary hover:underline mt-2"
                  >
                    {trend.type === 'article' ? 'Read article' : 'View post'} →
                  </a>
                </div>
              </div>
            </div>
          ))}
          {!isLoading && trends.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No trends available. Try refreshing.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
