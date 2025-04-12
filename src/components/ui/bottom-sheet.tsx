
import * as React from "react";
import { X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  trigger,
  title,
  description,
  children,
  footer,
  className,
}: BottomSheetProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className={cn("bg-white/80 backdrop-blur-lg border-t border-gray-200/50 shadow-lg", className)}>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader className="relative">
            <DrawerClose className="absolute right-2 top-2 rounded-full p-2 text-muted-foreground hover:bg-gray-100">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DrawerClose>
            {title && <DrawerTitle className="text-xl font-medium">{title}</DrawerTitle>}
            {description && (
              <DrawerDescription className="text-sm text-muted-foreground">
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
          <div className="px-4 py-2 space-y-4">{children}</div>
          {footer && <DrawerFooter className="border-t border-gray-100 pt-4">{footer}</DrawerFooter>}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

interface BottomSheetActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function BottomSheetAction({
  children,
  onClick,
  variant = "default",
}: BottomSheetActionProps) {
  return (
    <Button variant={variant} onClick={onClick} className="w-full">
      {children}
    </Button>
  );
}
