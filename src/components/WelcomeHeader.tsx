
import { useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";

interface WelcomeHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  showGreeting?: boolean;
}

export function WelcomeHeader({ 
  title, 
  subtitle, 
  icon, 
  showGreeting = true 
}: WelcomeHeaderProps) {
  const { user } = useAuth();
  
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex flex-col">
        {showGreeting && user?.first_name && (
          <p className="text-sm text-apple-blue font-medium">{greeting()}, {user.first_name} Sir</p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
      </div>
      {icon && <div className="mt-1 sm:mt-0">{icon}</div>}
    </div>
  );
}
