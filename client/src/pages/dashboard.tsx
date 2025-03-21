import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { GoalsCard } from "@/components/dashboard/goals-card";
import { WhatsNextCard } from "@/components/dashboard/whats-next-card";
import { TrendingTopicsCard } from "@/components/dashboard/trending-topics-card";
import { ThemeToggleCard } from "@/components/dashboard/theme-toggle-card";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card";
import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Sample data - in a real app, this would come from an API
  const [profile] = useState({
    name: "Sarah Johnson",
    journey: "Biology Major",
    progress: 45,
  });
  
  const [goals] = useState([
    { id: "1", title: "Update Resume with Lab Skills", completed: true, progress: 100 },
    { id: "2", title: "Research 3 Biotech Companies", completed: true, progress: 85 },
    { id: "3", title: "Apply for Summer Internship", completed: false, progress: 25 },
  ]);
  
  const [whatNext] = useState({
    course: { title: "Career Paths in Biotechnology" },
    video: { title: "Interview Skills for Science Majors" },
  });
  
  const [trends] = useState([
    { id: "1", name: "Healthcare Tech", primary: true, percentage: 65 },
    { id: "2", name: "Biomedical Research", percentage: 52 },
    { id: "3", name: "Pharmaceutical" },
    { id: "4", name: "Genomics" },
    { id: "5", name: "Remote Lab Work" },
  ]);
  
  const [activities] = useState([
    { 
      id: "1", 
      type: "lesson" as const, 
      title: "Career Planning Workshop", 
      time: "Yesterday",
      isRecent: true 
    },
    { 
      id: "2", 
      type: "badge" as const, 
      title: "Resume Builder Achievement", 
      time: "3 days ago",
      isRecent: false
    },
    { 
      id: "3", 
      type: "course" as const, 
      title: "Science Communication Skills", 
      time: "1 week ago",
      isRecent: false 
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
