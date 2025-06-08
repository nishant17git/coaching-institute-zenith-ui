
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown, Award, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface Student {
  id: string;
  full_name: string;
  class: number;
}

interface TestResult {
  id: string;
  student_id: string;
  marks_obtained: number;
  total_marks: number;
  percentage?: number;
  created_at: string;
}

interface PerformanceInsightsProps {
  testRecords: TestResult[];
  students: Student[];
}

export function PerformanceInsights({ testRecords, students }: PerformanceInsightsProps) {
  // Calculate performance metrics for each student
  const studentPerformance = students.map(student => {
    const studentTests = testRecords.filter(test => test.student_id === student.id);
    
    if (studentTests.length === 0) {
      return {
        student,
        averageScore: 0,
        totalTests: 0,
        trend: 0,
        recentScores: []
      };
    }

    // Sort tests by date (most recent first)
    const sortedTests = studentTests.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const scores = sortedTests.map(test => 
      Math.round((test.marks_obtained / test.total_marks) * 100)
    );

    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    
    // Calculate trend (recent 3 tests vs previous 3 tests)
    let trend = 0;
    if (scores.length >= 3) {
      const recentAvg = scores.slice(0, 3).reduce((sum, score) => sum + score, 0) / 3;
      const previousAvg = scores.length >= 6 
        ? scores.slice(3, 6).reduce((sum, score) => sum + score, 0) / 3
        : scores.slice(3).reduce((sum, score) => sum + score, 0) / (scores.length - 3);
      
      if (scores.length > 3) {
        trend = recentAvg - previousAvg;
      }
    }

    return {
      student,
      averageScore,
      totalTests: studentTests.length,
      trend,
      recentScores: scores.slice(0, 5) // Last 5 scores
    };
  });

  // Filter performance categories
  const poorPerformers = studentPerformance
    .filter(p => p.averageScore < 60 && p.totalTests >= 2)
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 10);

  const topPerformers = studentPerformance
    .filter(p => p.averageScore >= 85 && p.totalTests >= 2)
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 10);

  const rapidImprovers = studentPerformance
    .filter(p => p.trend >= 10 && p.totalTests >= 3)
    .sort((a, b) => b.trend - a.trend)
    .slice(0, 10);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 5) return "text-green-600";
    if (trend < -5) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Poor Performance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Poor Performance ({poorPerformers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {poorPerformers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No students need attention</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Tests Taken</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {poorPerformers.map((performer) => (
                    <TableRow key={performer.student.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-red-100 text-red-700">
                              {getInitials(performer.student.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{performer.student.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Class {performer.student.class}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-500">
                          {performer.averageScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>{performer.totalTests}</TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${getTrendColor(performer.trend)}`}>
                          {getTrendIcon(performer.trend)}
                          <span className="text-sm font-medium">
                            {performer.trend > 0 ? '+' : ''}{performer.trend.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Performers Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Award className="h-5 w-5" />
              Top Performers ({topPerformers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No top performers yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Tests Taken</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformers.map((performer, index) => (
                    <TableRow key={performer.student.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-green-100 text-green-700">
                              {getInitials(performer.student.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{performer.student.full_name}</span>
                          {index < 3 && (
                            <Badge className="bg-yellow-500 text-xs">#{index + 1}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Class {performer.student.class}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">
                          {performer.averageScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>{performer.totalTests}</TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${getTrendColor(performer.trend)}`}>
                          {getTrendIcon(performer.trend)}
                          <span className="text-sm font-medium">
                            {performer.trend > 0 ? '+' : ''}{performer.trend.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Rapid Improvers Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <TrendingUp className="h-5 w-5" />
              Rapid Improvers ({rapidImprovers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rapidImprovers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No rapid improvers identified</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Tests Taken</TableHead>
                    <TableHead>Improvement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rapidImprovers.map((performer) => (
                    <TableRow key={performer.student.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                              {getInitials(performer.student.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{performer.student.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Class {performer.student.class}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500">
                          {performer.averageScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>{performer.totalTests}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-bold">
                            +{performer.trend.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
