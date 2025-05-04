
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface PageHeaderProps extends Omit<HTMLMotionProps<"div">, "title"> {
  title: string;
  description?: string;
  showBackButton?: boolean;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  showBackButton = true,
  action,
  className,
  ...props
}: PageHeaderProps) {
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
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2",
        className
      )}
      {...props}
    >
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
    </motion.div>
  );
}
