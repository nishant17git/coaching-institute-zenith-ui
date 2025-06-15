
import { Separator } from "@/components/ui/separator";
import { Heart } from "lucide-react";

export default function AboutFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="text-center py-8 px-2">
      <Separator className="max-w-xs mx-auto opacity-30 mb-6" />
      <div className="space-y-3">
        <div className="text-gray-600 dark:text-gray-400 font-medium text-sm">
          © {year} Molecules &amp; Infinity Classes. All rights reserved.
        </div>
        <div className="text-gray-500 dark:text-gray-500 text-xs font-medium">
          Infinity ATOM U-235 I — Where education meets innovation.
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 font-medium text-xs mt-5">
        <span>Built with</span>
        <Heart className="h-5 w-5 text-red-500 animate-pulse" />
        <span>for the future of education</span>
      </div>
    </footer>
  );
}
