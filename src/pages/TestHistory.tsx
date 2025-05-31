"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EnhancedPageHeader } from "@/components/enhanced-page-header";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { exportTestToPDF } from "@/services/pdfService";
import { useIsMobile } from "@/hooks/use-mobile";
import { TestRecordDb, StudentRecord, SubjectStat } from "@/types";
import { FileText, Share2, Download, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { CartesianGrid, Line, LineChart, XAxis, Bar, BarChart, Rectangle, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Define the motion component
const AnimatedDiv = motion.div;

// Updated mock student data to match the StudentRecord type
const mockStudent: StudentRecord = {
  id: "1",
  full_name: "Ananya Sharma",
  class: 10,
  roll_number: 1001,
  date_of_birth: "2008-05-15",
  address: "123 Main Street, Mumbai",
  guardian_name: "Rajesh Sharma",
  contact_number: "9876543210",
  whatsapp_number: "9876543210",
  fee_status: "Paid",
  total_fees: 50000,
  paid_fees: 45000,
  attendance_percentage: 95,
  join_date: "2023-04-01",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  gender: "Female"
};

// Sample mock data for test records
const mockTestRecords = [{
  id: "1",
  student_id: "1",
  subject: "Mathematics",
  test_name: "Algebra Unit Test",
  test_type: "Chapter-wise Test",
  test_date: "2025-04-15",
  marks: 85,
  total_marks: 100,
  comments: "Excellent understanding of algebraic concepts"
}, {
  id: "2",
  student_id: "1",
  subject: "Physics",
  test_name: "Mechanics Final",
  test_type: "Term Exam",
  test_date: "2025-04-10",
  marks: 78,
  total_marks: 100,
  comments: "Good understanding of core concepts, needs work on numerical problems"
}, {
  id: "3",
  student_id: "1",
  subject: "Chemistry",
  test_name: "Organic Chemistry",
  test_type: "Chapter-wise Test",
  test_date: "2025-04-05",
  marks: 92,
  total_marks: 100,
  comments: "Outstanding knowledge of organic reactions"
}, {
  id: "4",
  student_id: "1",
  subject: "English",
  test_name: "Literature Assessment",
  test_type: "Class Test",
  test_date: "2025-04-01",
  marks: 88,
  total_marks: 100,
  comments: "Excellent analysis of literary themes"
}, {
  id: "5",
  student_id: "1",
  subject: "Biology",
  test_name: "Human Physiology",
  test_type: "Chapter-wise Test",
  test_date: "2025-03-25",
  marks: 95,
  total_marks: 100,
  comments: "Thorough understanding of human systems"
}];

// Create performance progress chart data
const progressChartData = [{
  month: "January",
  score: 76,
  subject: "Physics"
}, {
  month: "February",
  score: 85,
  subject: "Mathematics"
}, {
  month: "March",
  score: 92,
  subject: "Chemistry"
}, {
  month: "April",
  score: 88,
  subject: "English"
}, {
  month: "May",
  score: 95,
  subject: "Biology"
}, {
  month: "June",
  score: 80,
  subject: "History"
}];
const progressChartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))"
  }
} satisfies ChartConfig;

// Create subject performance chart data
const subjectChartData = [{
  subject: "mathematics",
  score: 85,
  fill: "var(--color-mathematics)"
}, {
  subject: "physics",
  score: 78,
  fill: "var(--color-physics)"
}, {
  subject: "chemistry",
  score: 92,
  fill: "var(--color-chemistry)"
}, {
  subject: "english",
  score: 88,
  fill: "var(--color-english)"
}, {
  subject: "biology",
  score: 95,
  fill: "var(--color-biology)"
}];
const subjectChartConfig = {
  score: {
    label: "Score"
  },
  mathematics: {
    label: "Mathematics",
    color: "hsl(var(--chart-1))"
  },
  physics: {
    label: "Physics",
    color: "hsl(var(--chart-2))"
  },
  chemistry: {
    label: "Chemistry",
    color: "hsl(var(--chart-3))"
  },
  english: {
    label: "English",
    color: "hsl(var(--chart-4))"
  },
  biology: {
    label: "Biology",
    color: "hsl(var(--chart-5))"
  }
} satisfies ChartConfig;
export default function TestHistory() {
  const {
    studentId
  } = useParams<{
    studentId: string;
  }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Use mock data or fetch from API based on environment or feature flags
  const {
    data: student,
    isLoading: studentLoading
  } = useQuery<StudentRecord | null>({
    queryKey: ['student', studentId],
    queryFn: async () => {
      // For demonstration, using mock data
      return mockStudent;
    }
  });

  // Use mock test records or fetch from API
  const {
    data: testRecords = [],
    isLoading: testsLoading
  } = useQuery<TestRecordDb[]>({
    queryKey: ['student_test_records', studentId],
    queryFn: async () => {
      // For demonstration, using mock data
      return mockTestRecords as TestRecordDb[];
    }
  });

  // Calculate stats with strong typing using our interfaces
  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['test_stats', studentId, testRecords],
    queryFn: () => {
      const totalTests = testRecords.length;
      const averageScore = testRecords.length > 0 ? Math.round(testRecords.reduce((acc, test) => acc + test.marks / test.total_marks * 100, 0) / testRecords.length) : 0;
      const subjects = Array.from(new Set(testRecords.map(test => test.subject)));

      // Grade distribution
      const gradeDistribution = [{
        name: 'A (90-100%)',
        count: 0,
        color: '#22c55e'
      }, {
        name: 'B (75-89%)',
        count: 0,
        color: '#0EA5E9'
      }, {
        name: 'C (60-74%)',
        count: 0,
        color: '#EAB308'
      }, {
        name: 'D (40-59%)',
        count: 0,
        color: '#F97316'
      }, {
        name: 'F (0-39%)',
        count: 0,
        color: '#EF4444'
      }];
      testRecords.forEach(test => {
        const percent = test.marks / test.total_marks * 100;
        if (percent >= 90) gradeDistribution[0].count++;else if (percent >= 75) gradeDistribution[1].count++;else if (percent >= 60) gradeDistribution[2].count++;else if (percent >= 40) gradeDistribution[3].count++;else gradeDistribution[4].count++;
      });

      // Progress over time chart data
      const progressData = testRecords.sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime()).map(test => ({
        date: format(new Date(test.test_date), 'dd MMM'),
        score: Math.round(test.marks / test.total_marks * 100),
        subject: test.subject,
        test: test.test_name
      }));

      // Subject performance data
      const subjectPerformance: SubjectStat[] = subjects.map(subject => {
        const subjectTests = testRecords.filter(test => test.subject === subject);
        const averagePercent = subjectTests.length > 0 ? Math.round(subjectTests.reduce((acc, test) => acc + test.marks / test.total_marks * 100, 0) / subjectTests.length) : 0;

        // Colors for subjects
        const subjectColors: Record<string, string> = {
          Mathematics: '#D946EF',
          English: '#0EA5E9',
          Science: '#06B6D4',
          Physics: '#3B82F6',
          Chemistry: '#F97316',
          Biology: '#22C55E',
          History: '#8B5CF6',
          Geography: '#EAB308'
        };
        return {
          name: subject,
          score: averagePercent,
          fill: subjectColors[subject] || '#8B5CF6'
        };
      });

      // Find best subject
      const bestSubject = subjectPerformance.length > 0 ? subjectPerformance.sort((a, b) => b.score - a.score)[0] : null;

      // Find latest test
      const latestTest = testRecords.length > 0 ? testRecords.sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime())[0] : null;
      return {
        totalTests,
        averageScore,
        subjects,
        gradeDistribution,
        progressData,
        subjectPerformance,
        bestSubject,
        latestTest
      };
    },
    enabled: !testsLoading && testRecords.length > 0
  });
  const handleBack = () => {
    navigate(-1);
  };

  // Functions to get grade and color based on marks
  const getGrade = (marks: number, totalMarks: number) => {
    const percent = marks / totalMarks * 100;
    if (percent >= 90) return {
      grade: 'A',
      color: 'bg-emerald-500 text-white'
    };
    if (percent >= 75) return {
      grade: 'B',
      color: 'bg-blue-500 text-white'
    };
    if (percent >= 60) return {
      grade: 'C',
      color: 'bg-yellow-500 text-white'
    };
    if (percent >= 40) return {
      grade: 'D',
      color: 'bg-orange-500 text-white'
    };
    return {
      grade: 'F',
      color: 'bg-red-500 text-white'
    };
  };

  // Handle PDF export for all tests
  const handleExportAllTests = () => {
    if (!student || testRecords.length === 0) {
      toast.error("No test data available to export");
      return;
    }
    exportTestToPDF({
      test: testRecords[0],
      student,
      title: "Academic Records Report",
      subtitle: `Complete Test History for ${student.full_name}`,
      allTests: testRecords
    });
    toast.success("Academic records PDF generated successfully");
  };

  // Handle single test export
  const handleExportTest = (test: TestRecordDb) => {
    if (!student) {
      toast.error("Student information not available");
      return;
    }
    exportTestToPDF({
      test,
      student,
      title: "Test Result Report",
      subtitle: `${test.subject} - ${test.test_name}`
    });
    toast.success("PDF generated successfully");
  };

  // Loading state
  if (studentLoading || testsLoading) {
    return <div className="space-y-6 px-4 md:px-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>;
  }

  // We extract real data or use empty defaults when stats aren't loaded yet
  const {
    totalTests = 0,
    averageScore = 0,
    subjectPerformance = [],
    progressData = [],
    bestSubject = null
  } = stats || {};
  return <div className="w-full sm:px-6 lg:px-8 px-0">
      <AnimatedDiv initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.3
    }} className="space-y-6">
        {/* Page Header with updated title */}
        <EnhancedPageHeader title="Academic Records" showBackButton={true} onBack={handleBack} />
        
        {/* Student Summary Card - Enhanced design */}
        {student && <AnimatedDiv initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3,
        delay: 0.1
      }} className="mb-4">
            <Card className="overflow-hidden bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 shadow-md border-purple-200/50 dark:border-purple-800/30">
              <CardContent className="p-4 md:p-6 rounded-md py-[20px] bg-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-lg">
                      {student.full_name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold">{student.full_name}</h2>
                    </div>
                  </div>
                  
                  {averageScore > 0 && <div className="mt-2 md:mt-0 flex items-center gap-2">
                      <div className="text-3xl font-bold font-spotify">{averageScore}%</div>
                      <div className="text-sm text-muted-foreground">Average Score</div>
                    </div>}
                </div>
              </CardContent>
            </Card>
          </AnimatedDiv>}

        {/* Stats Cards - Redesigned and improved for better UX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatedDiv initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.1
        }}>
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-4 border-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="p-2 bg-blue-500/10 text-blue-600 rounded-full">
                    <FileText className="h-5 w-5" />
                  </div>
                  Total Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-spotify">{totalTests}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {stats?.subjects?.length || 0} subjects
                </p>
              </CardContent>
            </Card>
          </AnimatedDiv>
          
          <AnimatedDiv initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.2
        }}>
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b-4 border-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="p-2 bg-green-500/10 text-green-600 rounded-full">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-spotify">{averageScore}%</div>
                {averageScore > 0 && <div className="mt-2">
                    <Progress value={averageScore} className="h-2" />
                  </div>}
              </CardContent>
            </Card>
          </AnimatedDiv>
          
          <AnimatedDiv initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.3
        }} className="sm:col-span-2 md:col-span-1">
            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b-4 border-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="p-2 bg-purple-500/10 text-purple-600 rounded-full">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  Best Subject
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-spotify">{bestSubject?.name || "N/A"}</div>
                {bestSubject && <div className="mt-2 flex items-center gap-2">
                    <Progress value={bestSubject.score} className="h-2 flex-1" />
                    <span className="text-xs font-medium">{bestSubject.score}%</span>
                  </div>}
              </CardContent>
            </Card>
          </AnimatedDiv>
        </div>
        
        {/* REORDERED: Test Records Table now comes first - With redesigned Card UI */}
        <AnimatedDiv initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3,
        delay: 0.4
      }}>
          <Card className="overflow-hidden shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Test Records</CardTitle>
                <CardDescription className="text-left font-thin text-sm my-[8px]">
                  Complete history of all tests taken
                </CardDescription>
              </div>
              {!isMobile && <Button size="sm" variant="outline" onClick={handleExportAllTests} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" disabled={testRecords.length === 0}>
                  <Download className="h-4 w-4" />
                  Export All
                </Button>}
            </CardHeader>
            <CardContent>
              {testRecords.length > 0 ? isMobile ?
            // Enhanced Mobile view: Cards for each test with improved UX
            <div className="divide-y divide-border/60">
                    {testRecords.sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime()).map((test, index) => {
                const {
                  grade,
                  color
                } = getGrade(test.marks, test.total_marks);
                const percent = Math.round(test.marks / test.total_marks * 100);
                return <AnimatedDiv key={test.id} initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} transition={{
                  duration: 0.3,
                  delay: index * 0.05
                }} className="p-4 px-[5px] py-[16px]">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium text-base">{test.subject}</h4>
                                <p className="text-sm text-muted-foreground">{test.test_name}</p>
                              </div>
                              <Badge className={color}>{grade}</Badge>
                            </div>
                            
                            <div className="mt-3 bg-muted/30 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                  {format(new Date(test.test_date), 'dd MMM yyyy')}
                                </div>
                                <div className="font-medium text-base font-spotify">
                                  {test.marks}/{test.total_marks}
                                </div>
                              </div>
                              <div className="mt-1">
                                <div className="flex justify-between text-xs mb-0.5">
                                  <span className="text-muted-foreground">Score</span>
                                  <span className="font-medium">{percent}%</span>
                                </div>
                                <Progress value={percent} className="h-2" indicatorClassName={percent >= 90 ? "bg-emerald-500" : percent >= 75 ? "bg-blue-500" : percent >= 60 ? "bg-yellow-500" : percent >= 40 ? "bg-orange-500" : "bg-red-500"} />
                              </div>
                            </div>
                            
                            <div className="mt-3 flex justify-between items-center">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full text-primary" onClick={() => handleExportTest(test)}>
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                              
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full text-primary" onClick={() => {
                      if (navigator.share) {
                        const {
                          grade
                        } = getGrade(test.marks, test.total_marks);
                        const percent = Math.round(test.marks / test.total_marks * 100);
                        navigator.share({
                          title: `${test.subject} Test Results`,
                          text: `${student?.full_name || 'Student'} scored ${test.marks}/${test.total_marks} (${percent}%, Grade ${grade}) in ${test.test_name} on ${format(new Date(test.test_date), 'dd MMM yyyy')}`
                        }).catch(console.error);
                      } else {
                        handleExportTest(test);
                      }
                    }}>
                                <Share2 className="h-4 w-4" />
                                <span className="sr-only">Share</span>
                              </Button>
                            </div>
                          </AnimatedDiv>;
              })}
                  </div> :
            // Desktop view: Table with modern shadcn styling
            <div className="rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Test Name</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testRecords.sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime()).map((test, index) => {
                    const {
                      grade,
                      color
                    } = getGrade(test.marks, test.total_marks);
                    const percent = Math.round(test.marks / test.total_marks * 100);
                    return <TableRow key={test.id} className="hover:bg-muted/50">
                                <TableCell className="font-medium">{test.subject}</TableCell>
                                <TableCell>{test.test_name}</TableCell>
                                <TableCell>{format(new Date(test.test_date), 'dd MMM yyyy')}</TableCell>
                                <TableCell>
                                  <div className="font-spotify">{test.marks}/{test.total_marks}</div>
                                  <div className="w-24 mt-1">
                                    <Progress value={percent} className="h-1.5" indicatorClassName={percent >= 90 ? "bg-emerald-500" : percent >= 75 ? "bg-blue-500" : percent >= 60 ? "bg-yellow-500" : percent >= 40 ? "bg-orange-500" : "bg-red-500"} />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={color}>{grade}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={() => handleExportTest(test)}>
                                      <FileText className="h-4 w-4 mr-2" />
                                      Export
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full flex items-center justify-center" onClick={() => {
                            if (navigator.share) {
                              const {
                                grade
                              } = getGrade(test.marks, test.total_marks);
                              const percent = Math.round(test.marks / test.total_marks * 100);
                              navigator.share({
                                title: `${test.subject} Test Results`,
                                text: `${student?.full_name || 'Student'} scored ${test.marks}/${test.total_marks} (${percent}%, Grade ${grade}) in ${test.test_name} on ${format(new Date(test.test_date), 'dd MMM yyyy')}`
                              }).catch(console.error);
                            } else {
                              handleExportTest(test);
                            }
                          }}>
                                      <Share2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>;
                  })}
                      </TableBody>
                    </Table>
                  </div> : <div className="text-center py-10">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No test records found</h3>
                  <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
                    This student has not taken any tests yet or records were not found.
                  </p>
                </div>}
              
              {/* Add Export All button at the bottom for mobile */}
              {isMobile && testRecords.length > 0 && <div className="mt-4 flex justify-center">
                  <Button onClick={handleExportAllTests} variant="outline" className="gap-2 w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground">
                    <Download className="h-4 w-4" />
                    Export All Tests
                  </Button>
                </div>}
            </CardContent>
          </Card>
        </AnimatedDiv>
        
        {/* Charts Section - Now appears after Test Records */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Progress Chart - Optimized for responsiveness */}
          <AnimatedDiv initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.5
        }}>
            <Card>
              <CardHeader>
                <CardTitle>Performance Progress</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={progressChartConfig}>
                  <LineChart accessibilityLayer data={progressChartData} margin={{
                  left: 12,
                  right: 12,
                  top: 20,
                  bottom: 10
                }} height={isMobile ? 250 : 300}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={value => value.slice(0, 3)} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line dataKey="score" type="monotone" stroke="var(--color-score)" strokeWidth={3} dot={{
                    r: 4,
                    strokeWidth: 1,
                    fill: "var(--color-score)"
                  }} activeDot={{
                    r: 6,
                    strokeWidth: 0,
                    fill: "var(--color-score)"
                  }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
              <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 font-medium leading-none">
                      Improving by {averageScore > 80 ? "8.3" : "5.2"}% this term <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 leading-none text-muted-foreground">
                      Showing academic performance for the last 6 months
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </AnimatedDiv>
          
          {/* Subject Performance Chart - Enhanced sizing for mobile */}
          <AnimatedDiv initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.6
        }}>
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
                <CardDescription>Academic Year 2024</CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <ChartContainer config={subjectChartConfig}>
                  <BarChart accessibilityLayer data={subjectChartData} layout="vertical" margin={{
                  left: 80,
                  right: 12,
                  top: 20,
                  bottom: 10
                }} height={isMobile ? 250 : 300}>
                    <CartesianGrid horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={value => `${value}%`} tickLine={false} axisLine={false} />
                    <YAxis dataKey="subject" type="category" tickLine={false} axisLine={false} width={80} tickFormatter={value => subjectChartConfig[value as keyof typeof subjectChartConfig]?.label || value} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="score" strokeWidth={isMobile ? 3 : 2} radius={[0, 8, 8, 0]} barSize={isMobile ? 30 : 24} activeBar={({
                    ...props
                  }) => <Rectangle {...props} fillOpacity={0.8} stroke={props.payload.fill} strokeDasharray={4} strokeDashoffset={4} />} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                  {bestSubject ? bestSubject.name : "Biology"} is the strongest subject <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                  Showing performance across all academic subjects
                </div>
              </CardFooter>
            </Card>
          </AnimatedDiv>
        </div>
      </AnimatedDiv>
    </div>;
}