
import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface LoadingStateProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  text = "Loading...",
  size = "md",
  className,
}) => {
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const containerSizes = {
    sm: "min-h-[100px]",
    md: "min-h-[150px]",
    lg: "min-h-[200px]",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-lg",
        containerSizes[size],
        className
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", iconSizes[size])} />
      {text && (
        <p className="mt-4 text-sm text-muted-foreground">
          {text}
        </p>
      )}
    </motion.div>
  );
};
