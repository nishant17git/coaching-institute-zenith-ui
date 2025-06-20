import React from "react";
import { ChevronLeft } from "lucide-react";
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
  return <div className="flex flex-row items-center justify-between gap-3 mb-3">
      <div className="flex items-center ">
        {showBackButton && <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full h-10 w-10 text-2xl font-bold ">
            <ChevronLeft className="h-7 w-7" />
          </Button>}
        <div>
          <h1 className="tracking-tight font-semibold text-2xl">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action && <div className="flex items-center">{action}</div>}
    </div>;
};