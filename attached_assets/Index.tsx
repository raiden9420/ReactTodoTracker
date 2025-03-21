
import * as React from "react";
import { useState } from "react";
import { MoonIcon } from "@radix-ui/react-icons";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Index = () => {
  const [profile] = useState({ journey: "Newbie at Python", progress: 33 });
  const [goals] = useState([
    "Learn Python Basics",
    "Complete Tutorial",
    "Build Project"
  ]);
  const [whatNext] = useState({ 
    course: "Python for Beginners", 
    video: "Functions and Classes" 
  });
  const [trends] = useState([
    "Python",
    "JavaScript",
    "React",
    "Node.js"
  ]);

  return (
    <div className="min-h-screen flex dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar text-sidebar-foreground p-4 flex flex-col border-r border-sidebar-border">
        <div className="flex items-center gap-2 px-2">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold">Coding Journey</span>
            <span className="text-sm text-sidebar-foreground/60">
              {profile.journey}
            </span>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="px-2">
            <h2 className="mb-2 font-semibold">Progress</h2>
            <div className="h-2 bg-sidebar-accent rounded-full">
              <div
                className="h-full bg-sidebar-primary rounded-full"
                style={{ width: `${profile.progress}%` }}
              />
            </div>
          </div>

          <div>
            <h2 className="px-2 mb-2 font-semibold">Quick Actions</h2>
            <div className="space-y-1">
              {["Dashboard", "Projects", "Learning", "Settings"].map((item) => (
                <button
                  key={item}
                  className="w-full px-2 py-1 text-left rounded hover:bg-sidebar-accent"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="w-full h-10 border-b mb-4"></div>

        {/* Grid Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Goals */}
          <div className="bg-card p-4 rounded-lg border">
            <h2 className="font-semibold mb-4">Learning Goals</h2>
            <div className="space-y-2">
              {goals.map((goal, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded hover:bg-accent"
                >
                  <span>{goal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-card p-4 rounded-lg border">
            <h2 className="font-semibold mb-4">What's Next</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Recommended Course</h3>
                <p className="text-muted-foreground">{whatNext.course}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Next Video</h3>
                <p className="text-muted-foreground">{whatNext.video}</p>
              </div>
            </div>
          </div>

          {/* Trends */}
          <div className="bg-card p-4 rounded-lg border">
            <h2 className="font-semibold mb-4">Trending Topics</h2>
            <div className="flex flex-wrap gap-2">
              {trends.map((trend, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-accent rounded text-sm"
                >
                  {trend}
                </span>
              ))}
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="bg-card p-4 rounded-lg border">
            <h2 className="font-semibold mb-4">Appearance</h2>
            <button className="flex items-center gap-2 p-2 rounded hover:bg-accent">
              <MoonIcon className="h-4 w-4" />
              <span>Toggle theme</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
