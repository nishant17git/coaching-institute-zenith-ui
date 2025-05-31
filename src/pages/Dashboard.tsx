
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, DollarSign, Calendar, TrendingUp, Clock, BookOpen, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardStatCard } from "@/components/ui/dashboard-stat-card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { newStudentService } from "@/services/newStudentService";
import { useNewData } from "@/contexts/NewDataContext";

export default function Dashboard() {
  const { students, classes, isLoading } = useNewData();

  // Calculate dashboard statistics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.id).length; // All students from new service are active
  const totalClasses = classes.length;

  // Calculate fee statistics from students data
  const feeData = React.useMemo(() => {
    // Since we don't have fee data directly, we'll use placeholder calculations
    // In a real app, this would be calculated from fee transactions
    const totalCollected = students.length * 25000; // Assuming average paid fees
    const totalDue = students.length * 50000; // Assuming total fees per student
    const pendingStudents = Math.floor(students.length * 0.3); // 30% pending
    
    return {
      totalCollected,
      totalDue,
      pendingStudents,
      collectionPercentage: totalDue > 0 ? (totalCollected / totalDue) * 100 : 0
    };
  }, [students]);

  // Recent enrollments (last 30 days)
  const recentEnrollments = React.useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return students.filter(student => {
      const joinDate = new Date(student.joinDate || student.joinDate);
      return joinDate >= thirtyDaysAgo;
    });
  }, [students]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in font-spotify">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening at your institute.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStatCard
          type="students"
          label="Total Students"
          count={totalStudents}
          icon={<Users className="h-4 w-4" />}
          trend={recentEnrollments.length > 0 ? { value: recentEnrollments.length, isPositive: true } : { value: 0, isPositive: false }}
        />
        
        <DashboardStatCard
          type="classes"
          label="Active Classes"
          count={totalClasses}
          icon={<GraduationCap className="h-4 w-4" />}
          trend={{ value: 0, isPositive: true }}
        />
        
        <DashboardStatCard
          type="fees"
          label="Fee Collection"
          count={`₹${(feeData.totalCollected / 100000).toFixed(1)}L`}
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: Math.round(feeData.collectionPercentage), isPositive: feeData.collectionPercentage > 75 }}
        />
        
        <DashboardStatCard
          type="pending"
          label="Pending Fees"
          count={feeData.pendingStudents}
          icon={<Clock className="h-4 w-4" />}
          trend={{ value: feeData.pendingStudents, isPositive: false }}
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Enrollments
            </CardTitle>
            <CardDescription>
              Students enrolled in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentEnrollments.length > 0 ? (
              <div className="space-y-3">
                {recentEnrollments.slice(0, 5).map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.class}</p>
                    </div>
                    <Badge variant="outline">
                      {format(new Date(student.joinDate || new Date()), 'MMM dd')}
                    </Badge>
                  </div>
                ))}
                {recentEnrollments.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{recentEnrollments.length - 5} more students
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No recent enrollments
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/students">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Students
              </Button>
            </Link>
            <Link to="/fees">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Fee Collection
              </Button>
            </Link>
            <Link to="/attendance">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
            </Link>
            <Link to="/tests">
              <Button variant="outline" className="w-full justify-start">
                <Award className="h-4 w-4 mr-2" />
                Test Records
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Fee Collection Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Collection Overview</CardTitle>
          <CardDescription>
            Current academic year fee collection status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Collection Progress</span>
              <span className="text-sm text-muted-foreground">
                ₹{feeData.totalCollected.toLocaleString()} / ₹{feeData.totalDue.toLocaleString()}
              </span>
            </div>
            <Progress value={feeData.collectionPercentage} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{feeData.collectionPercentage.toFixed(1)}% collected</span>
              <span>{feeData.pendingStudents} students pending</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Class Distribution</CardTitle>
          <CardDescription>
            Number of students per class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {classes.map((cls) => (
              <div key={cls.id} className="text-center p-4 border rounded-lg">
                <p className="font-semibold text-lg">{cls.totalStudents}</p>
                <p className="text-sm text-muted-foreground">{cls.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
