// This is a minimal sonner toast component implementation
// Typically, sonner is a toast notification library, but we're creating a simplified version

import { useToast } from "@/hooks/use-toast";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

export function Toaster() {
  // We're using the existing toast system from shadcn/ui
  // This is just a compatibility layer to avoid errors
  // In a real implementation, you would integrate the full sonner library
  useToast();
  
  return null;
}