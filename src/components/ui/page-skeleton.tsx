
import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
  showHeader?: boolean;
  headerTitle?: string;
  headerDescription?: string;
  showBackButton?: boolean;
}

export function PageSkeleton({ 
  showHeader = true, 
  headerTitle = "Loading...", 
  headerDescription,
  showBackButton = false 
}: PageSkeletonProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && <Skeleton className="h-8 w-8 rounded-full" />}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">{headerTitle}</h1>
              {headerDescription && (
                <p className="text-muted-foreground">{headerDescription}</p>
              )}
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      )}
      
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
