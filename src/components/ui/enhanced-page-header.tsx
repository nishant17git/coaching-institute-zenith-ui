
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EnhancedPageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  action?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
}

export function EnhancedPageHeader({
  title,
  description,
  showBackButton = false,
  action,
  breadcrumb,
  className,
  ...props
}: EnhancedPageHeaderProps) {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col space-y-4",
        className
      )}
      {...props}
    >
      {breadcrumb && (
        <div className="text-sm text-muted-foreground">{breadcrumb}</div>
      )}
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        
        {action && (
          <div className="mt-2 sm:mt-0 w-full sm:w-auto flex justify-end">
            {action}
          </div>
        )}
      </div>
    </motion.div>
  );
}
