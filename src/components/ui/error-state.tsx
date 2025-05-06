
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  retry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  action,
  className,
  retry,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex flex-col items-center justify-center p-6 text-center rounded-lg border border-destructive/30 bg-destructive/5",
        className
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      
      {retry && !action && (
        <button
          onClick={retry}
          className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-white bg-destructive hover:bg-destructive/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      )}
      
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
};
