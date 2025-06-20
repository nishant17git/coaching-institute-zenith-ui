
import React from "react";
import { ChevronLeft } from "lucide-react";
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
  backButtonAction?: () => void;
  headerSize?: "2xl" | "3xl"; // Add header size prop
}

export function EnhancedPageHeader({
  title,
  description,
  showBackButton = false,
  action,
  breadcrumb,
  className,
  onBack,
  backButtonAction,
  headerSize = "3xl", // Default to 3xl
  ...props
}: EnhancedPageHeaderProps) {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backButtonAction) {
      backButtonAction();
    } else {
      navigate(-1);
    }
  };

  const titleSizeClass = headerSize === "2xl" ? "text-2xl" : "text-3xl";

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }} 
      className={cn("flex flex-col space-y-2 md:space-y-4", className)} 
      {...props}
    >
      {breadcrumb && (
        <div className="text-sm text-muted-foreground">
          {breadcrumb}
        </div>
      )}
      
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button 
              onClick={handleBack} 
              variant="ghost" 
              size="icon" 
              className="h-12 w-12 rounded-full shrink-0 font-normal text-base transition-all duration-200 ease-in-out" 
              aria-label="Back"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <h1 className={cn("tracking-tight py-0 my-0 mx-0 font-semibold", titleSizeClass)}>
            {title}
          </h1>
        </div>
        
        {action && <div>{action}</div>}
      </div>
      
      {description}
    </motion.div>
  );
}
