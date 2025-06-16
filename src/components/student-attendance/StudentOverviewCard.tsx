
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StudentOverviewCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactElement;
  color: string;
}

export function StudentOverviewCard({
  title,
  value,
  description,
  icon,
  color
}: StudentOverviewCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-600 bg-blue-100';
      case 'green':
        return 'text-green-600 bg-green-100';
      case 'yellow':
        return 'text-yellow-600 bg-yellow-100';
      case 'red':
        return 'text-red-600 bg-red-100';
      case 'purple':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", getColorClasses(color))}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
