
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingDown, TrendingUp, Award, Users, Target, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface PerformanceInsightsProps {
  testRecords: any[];
  students: any[];
}

export function PerformanceInsights({ testRecords, students }: PerformanceInsightsProps) {
  // Calculate student performance data
  const studentPerformance = students.map(student => {
    const studentTests = testRecords.filter(test => test.student_id === student.id);
    
    if (studentTests.length === 0) {
      return {
        student,
        averageScore: 0,
        totalTests: 0,
        trend: 0,
        recentTests: []
      };
    }

    const averageScore = Math.round(
      studentTests.reduce((acc, test) => acc + (test.percentage || 0), 0) / studentTests.length
    );

    // Calculate trend (compare last 2 tests)
    const sortedTests = studentTests.sort((a, b) => 
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    
    let trend = 0;
    if (sortedTests.length >= 2) {
      const recent = sortedTests[0].percentage || 0;
      const previous = sortedTests[1].percentage || 0;
      trend = recent - previous;
    }

    return {
      student,
      averageScore,
      totalTests: studentTests.length,
      trend,
      recentTests: sortedTests.slice(0, 3)
    };
  });

  // Filter categories
  const poorPerformers = studentPerformance
    .filter(p => p.averageScore < 50 && p.totalTests > 0)
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 5);

  const topPerformers = studentPerformance
    .filter(p => p.averageScore >= 80 && p.totalTests > 0)
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5);

  const rapidImprovers = studentPerformance
    .filter(p => p.trend > 10 && p.totalTests >= 2)
    .sort((a, b) => b.trend - a.trend)
    .slice(0, 5);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <BarChart3 className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 5) return "text-green-600 bg-green-50";
    if (trend < -5) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  const PerformanceCard = ({ 
    title, 
    description, 
    icon, 
    students, 
    emptyMessage,
    showTrend = false,
    primaryMetric = "averageScore"
  }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    students: any[];
    emptyMessage: string;
    showTrend?: boolean;
    primaryMetric?: string;
  }) => (
    <Card className="overflow-hidden shadow-sm border bg-card hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {students.length === 0 ? (
          <div className="text-center py-8">
            <div className="rounded-full bg-muted p-3 mx-auto mb-3 w-fit">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((item, index) => (
              <motion.div
                key={item.student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <Avatar className="h-10 w-10 bg-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                    {getInitials(item.student.full_name || 'UN')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm text-foreground truncate">
                      {item.student.full_name || 'Unknown'}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Class {item.student.class || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.totalTests} test{item.totalTests !== 1 ? 's' : ''}</span>
                    {showTrend && item.trend !== 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(item.trend)}
                          <span className={getTrendColor(item.trend)}>
                            {item.trend > 0 ? '+' : ''}{Math.round(item.trend)}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">
                    {primaryMetric === "trend" ? 
                      `${item.trend > 0 ? '+' : ''}${Math.round(item.trend)}%` :
                      `${item[primaryMetric]}%`
                    }
                  </div>
                  {primaryMetric !== "trend" && (
                    <div className="text-xs text-muted-foreground">
                      Average
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Performance Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="overflow-hidden shadow-sm border bg-gradient-to-br from-red-50 to-red-100/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-900">Needs Attention</p>
                <p className="text-2xl font-bold text-red-700">{poorPerformers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden shadow-sm border bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">Top Performers</p>
                <p className="text-2xl font-bold text-green-700">{topPerformers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden shadow-sm border bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">Improving</p>
                <p className="text-2xl font-bold text-blue-700">{rapidImprovers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Categories */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <PerformanceCard
          title="Poor Performance"
          description="Students scoring below 50%"
          icon={<TrendingDown className="h-5 w-5 text-red-600" />}
          students={poorPerformers}
          emptyMessage="No students need immediate attention"
          showTrend={true}
        />

        <PerformanceCard
          title="Top Performers"
          description="Students scoring 80% or above"
          icon={<Award className="h-5 w-5 text-green-600" />}
          students={topPerformers}
          emptyMessage="No top performers yet"
          showTrend={true}
        />

        <PerformanceCard
          title="Rapid Improvers"
          description="Students with 10%+ improvement"
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          students={rapidImprovers}
          emptyMessage="No rapid improvement detected"
          primaryMetric="trend"
        />
      </div>
    </div>
  );
}
