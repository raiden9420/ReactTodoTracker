import { useState } from "react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LayoutDashboard, Briefcase, GraduationCap, MessageSquare, Settings } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
};

interface Profile {
  name: string;
  journey: string;
  progress: number;
  avatar?: string;
}

type SidebarProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCareerCoachClick: () => void;
  profile: Profile;
};

export function Sidebar({ isOpen, onOpenChange, profile }: SidebarProps) {
  const [recentItems] = useState([
    { id: 1, name: "Career Assessments", href: "#assessments" },
    { id: 2, name: "Industry Insights", href: "#insights" },
    { id: 3, name: "Mock Interviews", href: "#interviews" },
  ]);

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/", icon: <LayoutDashboard className="w-4 h-4" />, active: true },
    { label: "Job Matches", href: "#jobs", icon: <Briefcase className="w-4 h-4" /> },
    { label: "Learning", href: "#learning", icon: <GraduationCap className="w-4 h-4" /> },
    { label: "Career Coach", href: "#", icon: <MessageSquare className="w-4 h-4" />, onClick: onCareerCoachClick },
    { label: "Settings", href: "#settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div
      className={`w-full md:w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 z-50 md:relative absolute inset-y-0 left-0 transform md:translate-x-0 ${
        !isOpen ? "mobile-menu-closed" : ""
      }`}
    >
      <div className="sticky top-0 flex flex-col h-full p-4 overflow-y-auto">
        {/* User Profile */}
        <div className="flex items-center gap-3 px-2 py-3">
          <Avatar className="h-10 w-10 border border-border flex-shrink-0">
            <AvatarImage src={profile.avatar || "/default-avatar.png"} alt="User avatar" />
            <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate">{profile.name}</span>
            <span className="text-xs text-sidebar-foreground/60 truncate">{profile.journey}</span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-8 space-y-1.5 px-2">
          <div className="flex justify-between items-center mb-1.5">
            <h3 className="text-sm font-medium">Career Growth</h3>
            <span className="text-xs">{profile.progress}%</span>
          </div>
          <div className="h-2 w-full bg-sidebar-accent rounded-full overflow-hidden">
            <div 
              className="h-full bg-sidebar-primary rounded-full" 
              style={{ width: `${profile.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          <div className="px-2 mb-2">
            <h3 className="text-sm font-semibold mb-1">Quick Actions</h3>
          </div>
          
          {navItems.map((item) => (
            <Link 
              key={item.label} 
              href={item.href}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
                onOpenChange(false);
              }}
            >
              <div className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                item.active 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              }`}>
                {item.icon}
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
        
        {/* Recently Viewed */}
        <div className="mt-8 px-2">
          <h3 className="text-sm font-semibold mb-2">Recently Viewed</h3>
          <div className="space-y-1">
            {recentItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => window.location.href = item.href}
                className="block py-1 px-2 text-xs rounded hover:bg-sidebar-accent transition-colors cursor-pointer"
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-auto pt-6">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
