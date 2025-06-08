import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { Clock, User, CreditCard, BookOpen, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
export function RecentActivity() {
  const {
    students
  } = useData();
  const navigate = useNavigate();

  // Mock recent activities - in a real app, this would come from an activity log
  const recentActivities = [{
    id: 1,
    type: "payment",
    description: "Fee payment received",
    student: students[0]?.name || "John Doe",
    amount: "₹5,000",
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    // 2 hours ago
    icon: <CreditCard className="h-4 w-4" />,
    color: "text-green-600"
  }, {
    id: 2,
    type: "admission",
    description: "New student enrolled",
    student: students[1]?.name || "Jane Smith",
    time: new Date(Date.now() - 4 * 60 * 60 * 1000),
    // 4 hours ago
    icon: <User className="h-4 w-4" />,
    color: "text-blue-600"
  }, {
    id: 3,
    type: "test",
    description: "Test scores updated",
    student: students[2]?.name || "Mike Johnson",
    time: new Date(Date.now() - 6 * 60 * 60 * 1000),
    // 6 hours ago
    icon: <BookOpen className="h-4 w-4" />,
    color: "text-purple-600"
  }, {
    id: 4,
    type: "payment",
    description: "Fee payment received",
    student: students[3]?.name || "Sarah Wilson",
    amount: "₹3,500",
    time: new Date(Date.now() - 8 * 60 * 60 * 1000),
    // 8 hours ago
    icon: <CreditCard className="h-4 w-4" />,
    color: "text-green-600"
  }];
  return <Card className="glass-card">
      <CardHeader>
        <CardTitle className="font-geist text-xl">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map(activity => <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
              <div className={`p-2 rounded-full bg-secondary/80 ${activity.color}`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium font-geist">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground font-geist">{activity.student}</p>
                  {activity.amount && <Badge variant="secondary" className="text-xs font-geist">
                      {activity.amount}
                    </Badge>}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-geist">
                <Clock className="h-3 w-3" />
                {format(activity.time, "HH:mm")}
              </div>
            </div>)}
        </div>
        <Button variant="ghost" className="w-full mt-4 font-geist" onClick={() => navigate('/dashboard')}>
          View All Activity <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>;
}