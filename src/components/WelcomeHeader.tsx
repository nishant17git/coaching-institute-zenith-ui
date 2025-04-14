
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
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        {showGreeting && user?.first_name && (
          <p className="text-sm text-apple-blue font-medium">{greeting()}, {user.first_name} Sir</p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      {icon && <div>{icon}</div>}
    </div>
  );
}
