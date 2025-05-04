
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { motion, MotionProps, HTMLMotionProps } from "framer-motion";

type GlassCardProps = React.ComponentPropsWithoutRef<typeof Card> & {
  animate?: boolean;
  delay?: number;
  motionProps?: MotionProps;
};

const GlassCard = React.forwardRef<
  HTMLDivElement,
  GlassCardProps
>(({ className, animate = true, delay = 0, motionProps, ...props }, ref) => {
  if (animate) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: delay * 0.1 }}
        {...motionProps as HTMLMotionProps<"div">}
      >
        <Card
          className={cn(
            "border-opacity-40 bg-opacity-60 backdrop-blur-sm shadow-md",
            className
          )}
          {...props}
        />
      </motion.div>
    );
  }
  
  return (
    <div ref={ref}>
      <Card
        className={cn(
          "border-opacity-40 bg-opacity-60 backdrop-blur-sm shadow-md",
          className
        )}
        {...props}
      />
    </div>
  );
});
GlassCard.displayName = "GlassCard";

const GlassCardHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CardHeader>
>(({ className, ...props }, ref) => (
  <CardHeader ref={ref} className={cn("px-5 py-4", className)} {...props} />
));
GlassCardHeader.displayName = "GlassCardHeader";

const GlassCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof CardTitle>
>(({ className, ...props }, ref) => (
  <CardTitle ref={ref} className={cn("text-lg", className)} {...props} />
));
GlassCardTitle.displayName = "GlassCardTitle";

const GlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof CardDescription>
>(({ className, ...props }, ref) => (
  <CardDescription ref={ref} className={cn("text-sm", className)} {...props} />
));
GlassCardDescription.displayName = "GlassCardDescription";

const GlassCardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CardContent>
>(({ className, ...props }, ref) => (
  <CardContent ref={ref} className={cn("px-5 py-4", className)} {...props} />
));
GlassCardContent.displayName = "GlassCardContent";

const GlassCardFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CardFooter>
>(({ className, ...props }, ref) => (
  <CardFooter ref={ref} className={cn("px-5 py-4 flex justify-between", className)} {...props} />
));
GlassCardFooter.displayName = "GlassCardFooter";

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter
};
