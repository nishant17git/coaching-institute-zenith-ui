
// This file re-exports the useToast hook from /hooks
import { toast, useToast } from "@/hooks/use-toast";
import type { ToastProps } from "@/hooks/use-toast";

// Re-export everything
export { toast, useToast };
export type { ToastProps };
