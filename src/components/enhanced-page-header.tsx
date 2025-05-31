
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EnhancedPageHeaderProps {
  title: string;
  description?: string | React.ReactNode;
  showBackButton?: boolean;
  action?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
  onBack?: () => void;
}

export function EnhancedPageHeader({
  title,
  description,
  showBackButton = false,
  action,
  breadcrumb,
  className,
  onBack,
  ...props
}: EnhancedPageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn("flex flex-col space-y-2 md:space-y-3 w-full", className)}
      {...props}
    >
      {breadcrumb && (
        <div className="text-sm text-muted-foreground font-geist">{breadcrumb}</div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 my-0">
          {showBackButton && (
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full shrink-0 font-normal text-base transition-all duration-200 ease-in-out"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="font-semibold tracking-tight text-2xl font-geist">{title}</h1>
            {description && (
              <div className="font-geist">{description}</div>
            )}
          </div>
        </div>
        
        {action && (
          <div className="flex justify-start sm:justify-end mt-2 sm:mt-0">
            {action}
          </div>
        )}
      </div>
    </motion.div>
  );
}
