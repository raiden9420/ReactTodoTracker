import { useState } from "react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LayoutDashboard, Briefcase, GraduationCap, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button"; // Added import statement

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
  profile: Profile;
  onCareerCoachClick?: () => void;
};

export function Sidebar({ isOpen, onOpenChange, profile, onCareerCoachClick }: SidebarProps) {
  const [recentItems] = useState([
    { id: 1, name: "Career Assessments", href: "#assessments" },
    { id: 2, name: "Industry Insights", href: "#insights" },
    { id: 3, name: "Mock Interviews", href: "#interviews" },
  ]);

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/", icon: <LayoutDashboard className="w-4 h-4" />, active: true },
    { 
      label: "Job Matches", 
      href: "#", 
      icon: <Briefcase className="w-4 h-4" />,
      onClick: () => {
        const searchQuery = profile.subjects?.join(' ') || profile.journey || '';
        window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchQuery)}`, '_blank');
      }
    },
    { label: "Learning", href: "#learning", icon: <GraduationCap className="w-4 h-4" /> },
    { label: "Career Coach", href: "#", icon: <MessageSquare className="w-4 h-4" />, onClick: onCareerCoachClick },
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

        <div className="mt-auto pt-6">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}