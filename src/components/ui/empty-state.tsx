
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed",
        className
      )}
    >
      {icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
          {icon}
        </div>
      )}
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
};
