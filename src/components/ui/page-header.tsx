import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
export interface PageHeaderProps {
  title: string;
  description?: string | React.ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  action?: React.ReactNode;
}
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  showBackButton = false,
  onBack,
  action
}) => {
  return <div className="flex flex-row items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        {showBackButton && <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>}
        <div>
          <h1 className="text-2xl tracking-tight font-semibold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action && <div className="flex items-center">{action}</div>}
    </div>;
};