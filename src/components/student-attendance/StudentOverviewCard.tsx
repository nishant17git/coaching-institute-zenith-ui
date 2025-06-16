
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, Award, CreditCard, TrendingUp } from "lucide-react";

interface StudentOverviewCardProps {
  student: any;
  attendanceStats: {
    present: number;
    absent: number;
    leave: number;
    holiday: number;
    total: number;
    percentage: number;
  } | null;
  attendanceHistory: any[];
}

export function StudentOverviewCard({
  student,
  attendanceStats,
  attendanceHistory
}: StudentOverviewCardProps) {
  // Calculate overview cards data from the passed props
  const overviewCards = [
    {
      title: "Attendance",
      value: `${attendanceStats?.percentage || 0}%`,
      description: `${attendanceStats?.present || 0} of ${attendanceStats?.total || 0} days`,
      icon: <Calendar className="h-5 w-5" />,
      color: "blue"
    },
    {
      title: "Test Average",
      value: "N/A",
      description: "No test data",
      icon: <Award className="h-5 w-5" />,
      color: "green"
    },
    {
      title: "Fee Status",
      value: student?.fee_status || "Unknown",
      description: `₹${student?.paid_fees || 0} of ₹${student?.total_fees || 0}`,
      icon: <CreditCard className="h-5 w-5" />,
      color: student?.fee_status === 'Paid' ? 'green' : student?.fee_status === 'Partial' ? 'yellow' : 'red'
    },
    {
      title: "Class Rank",
      value: "#-",
      description: "Coming soon",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "purple"
    }
  ];

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {overviewCards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </div>
              <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", getColorClasses(card.color))}>
                {card.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
