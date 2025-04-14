
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { studentService } from "@/services/studentService";
import { StudentRecord } from "@/types";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, School, LogOut, Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [classDistribution, setClassDistribution] = useState<any[]>([]);
  
  // Fetch students data
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents
  });

  // Calculate statistics when students data changes
  useEffect(() => {
    if (students.length > 0) {
      // Calculate class distribution for chart
      const distribution = Array.from({ length: 9 }, (_, i) => i + 2).map(classNum => {
        const count = students.filter(student => student.class === classNum).length;
        return {
          class: `Class ${classNum}`,
          count
        };
      });
      setClassDistribution(distribution);
    }
  }, [students]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Total Students"
          value={students.length}
          icon={<Users className="h-4 w-4" />}
          description="All registered students"
        />
        
        <StatCard 
          title="Total Classes"
          value="9"
          icon={<GraduationCap className="h-4 w-4" />}
          description="Classes 2-10"
        />
        
        <StatCard 
          title="Most Populated Class"
          value={classDistribution.length > 0 
            ? classDistribution.reduce((max, obj) => obj.count > max.count ? obj : max, classDistribution[0]).class 
            : "N/A"
          }
          icon={<School className="h-4 w-4" />}
          description={classDistribution.length > 0 
            ? `${classDistribution.reduce((max, obj) => obj.count > max.count ? obj : max, classDistribution[0]).count} students` 
            : "No data"
          }
        />
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Class Distribution</CardTitle>
          <CardDescription>
            Number of students in each class
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading chart data...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="class" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0A84FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
