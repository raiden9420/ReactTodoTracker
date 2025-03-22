import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { GoalsCard } from "@/components/dashboard/goals-card";
import { WhatsNextCard } from "@/components/dashboard/whats-next-card";
import { TrendingTopicsCard } from "@/components/dashboard/trending-topics-card";
import { ThemeToggleCard } from "@/components/dashboard/theme-toggle-card";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card";
import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Get userId from localStorage
  const userId = localStorage.getItem('userId') || '1'; // Default to 1 if not found
  
  // Fetch dashboard data from API
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: [`/api/dashboard/${userId}`],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/dashboard/${userId}`);
        if (!response.ok) {
          if (response.status === 404) {
            // If profile not found, redirect to survey page
            toast({
              title: "Profile Needed",
              description: "Please complete the survey to personalize your experience.",
            });
            navigate("/survey");
            return null;
          }
          throw new Error('Failed to fetch dashboard data');
        }
        const result = await response.json();
        return result.success ? result.data : null;
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
        return null;
      }
    },
  });

  // Initialize empty states
  const [profile, setProfile] = useState({
    name: "",
    journey: "",
    progress: 0,
  });
  
  const [goals, setGoals] = useState([]);
  const [whatNext, setWhatNext] = useState({
    course: { title: "" },
    video: { title: "" },
  });
  const [trends, setTrends] = useState([]);
  const [activities, setActivities] = useState([]);
  
  // Update dashboard data when received from API
  useEffect(() => {
    if (dashboardData) {
      setProfile({
        name: dashboardData.username || "Career Explorer",
        journey: "Getting Started",
        progress: dashboardData.progress || 25,
      });
      
      if (dashboardData.goals) {
        setGoals(dashboardData.goals);
      }
      
      if (dashboardData.nextSteps) {
        setWhatNext(dashboardData.nextSteps);
      }
      
      if (dashboardData.trendingTopics) {
        setTrends(dashboardData.trendingTopics);
      }
      
      if (dashboardData.activities) {
        setActivities(dashboardData.activities);
      }
    }
  }, [dashboardData]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        profile={profile}
      />

      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <Button 
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Emerge Career Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 space-y-6">
          <WelcomeSection username={profile.name} progress={profile.progress} avatar={profile.avatar} />

          {/* Dashboard Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <GoalsCard goals={goals} userId={parseInt(userId)} />
            <WhatsNextCard userId={parseInt(userId)} course={whatNext.course} />
            <TrendingTopicsCard userId={userId} />
            <RecentActivityCard activities={activities} />
          </div>
        </div>
      </main>
    </div>
  );
}
