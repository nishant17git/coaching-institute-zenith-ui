
import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface LoadingStateProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  delay?: number; // Add delay prop to prevent flickering for fast operations
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  text = "Loading...",
  size = "md",
  className,
  delay = 200, // Default small delay to prevent flickering
}) => {
  const [shouldRender, setShouldRender] = React.useState(delay === 0);
  
  React.useEffect(() => {
    if (delay === 0) return;
    
    // Only show loader after specified delay to avoid flashing during quick loads
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  if (!shouldRender) return null;

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  const containerSizes = {
    sm: "min-h-[80px]",
    md: "min-h-[120px]",
    lg: "min-h-[160px]",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex flex-col items-center justify-center p-4 text-center",
        containerSizes[size],
        className
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", iconSizes[size])} />
      {text && (
        <p className="mt-3 text-sm text-muted-foreground">
          {text}
        </p>
      )}
    </motion.div>
  );
};
