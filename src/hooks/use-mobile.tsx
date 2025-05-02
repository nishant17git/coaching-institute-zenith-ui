
import { useMediaQuery } from "@/hooks/useMediaQuery";

export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)");
}
