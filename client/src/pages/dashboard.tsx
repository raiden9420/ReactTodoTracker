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

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { toast } = useToast();
  
  // Fetch user data from API
  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const response = await fetch('http://localhost:5001/api/user');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
        // Return default data on error
        return null;
      }
    },
  });

  // Default profile data (used until API data loads)
  const [profile, setProfile] = useState({
    name: "Career Explorer",
    journey: "Getting Started",
    progress: 0,
  });
  
  // Update profile when user data is loaded
  useEffect(() => {
    if (userData) {
      setProfile({
        name: userData.username || "Career Explorer",
        journey: userData.level || "Getting Started",
        progress: userData.progress || 0,
      });
    }
  }, [userData]);
  
  // Generate goals based on user profile
  const generateGoals = () => {
    if (userData && userData.subjects && userData.subjects.length > 0) {
      const mainSubject = userData.subjects[0];
      return [
        { id: "1", title: `Learn more about ${mainSubject} careers`, completed: false, progress: 0 },
        { id: "2", title: "Create a portfolio of skills", completed: false, progress: 0 },
        { id: "3", title: "Research internship opportunities", completed: false, progress: 0 },
      ];
    }
    return [
      { id: "1", title: "Complete your profile", completed: false, progress: 0 },
      { id: "2", title: "Identify top skills to develop", completed: false, progress: 0 },
      { id: "3", title: "Research career paths", completed: false, progress: 0 },
    ];
  };
  
  const [goals] = useState(generateGoals());
  
  // Course recommendations
  const [whatNext] = useState({
    course: { title: "Exploring Career Paths" },
    video: { title: "How to Build a Professional Portfolio" },
  });
  
  // Trending topics in career development
  const [trends] = useState([
    { id: "1", name: "Remote Work", primary: true, percentage: 78 },
    { id: "2", name: "Digital Skills", percentage: 65 },
    { id: "3", name: "Career Transition" },
    { id: "4", name: "Freelancing" },
    { id: "5", name: "Personal Branding" },
  ]);
  
  // Recent user activities
  const [activities] = useState([
    { 
      id: "1", 
      type: "lesson" as const, 
      title: "Career Exploration Workshop", 
      time: "Just now",
      isRecent: true 
    },
    { 
      id: "2", 
      type: "badge" as const, 
      title: "Profile Completion Badge", 
      time: "Today",
      isRecent: true
    },
    { 
      id: "3", 
      type: "course" as const, 
      title: "Introduction to Career Planning", 
      time: "Today",
      isRecent: true 
    },
  ]);

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
          <WelcomeSection username={profile.name} progress={profile.progress} />

          {/* Dashboard Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <GoalsCard goals={goals} />
            <WhatsNextCard course={whatNext.course} video={whatNext.video} />
            <TrendingTopicsCard topics={trends} />
            <RecentActivityCard activities={activities} />
          </div>
        </div>
      </main>
    </div>
  );
}
