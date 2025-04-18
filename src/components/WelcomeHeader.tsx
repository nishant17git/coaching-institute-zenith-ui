
import { ReactNode } from "react";

interface WelcomeHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
}

export function WelcomeHeader({ 
  title, 
  subtitle, 
  icon
}: WelcomeHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
      {icon && <div className="mt-1 sm:mt-0">{icon}</div>}
    </div>
  );
}
