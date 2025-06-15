"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
import { TestRecordDb, TestDb, StudentRecord, SubjectStat } from "@/types";
import { FileText, Share2, Download, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { CartesianGrid, Line, LineChart, XAxis, Bar, BarChart } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Define the motion component
const AnimatedDiv = motion.div;

// Enhanced test record with test details
interface EnhancedTestRecord extends TestRecordDb {
  test?: TestDb;
  subject?: string;
  test_name?: string;
  test_date?: string;
}

// Create performance progress chart data
const progressChartConfig = {
  score: {
    label: "Score",
    color: "#FF6B6B"
  }
} satisfies ChartConfig;

// Create subject performance chart data
const subjectChartConfig = {
  score: {
    label: "Score",
    color: "#4ECDC4"
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

  // Fetch student data from Supabase
  const {
    data: student,
    isLoading: studentLoading
  } = useQuery<StudentRecord | null>({
    queryKey: ['student', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const {
        data,
        error
      } = await supabase.from('students').select('*').eq('id', studentId).single();
      if (error) {
        console.error('Error fetching student:', error);
        throw error;
      }
      return data;
    },
    enabled: !!studentId
  });

  // Fetch test results with test details from Supabase
  const {
    data: testRecords = [],
    isLoading: testsLoading
  } = useQuery<EnhancedTestRecord[]>({
    queryKey: ['student_test_results', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const {
        data,
        error
      } = await supabase.from('test_results').select(`
          *,
          test:tests(*)
        `).eq('student_id', studentId).order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching test results:', error);
        throw error;
      }

      // Transform the data to include test details
      return (data || []).map(result => ({
        ...result,
        subject: result.test?.subject,
        test_name: result.test?.test_name,
        test_date: result.test?.test_date
      }));
    },
    enabled: !!studentId
  });

  // Calculate stats with strong typing using our interfaces
  const {
    data: stats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['test_stats', studentId, testRecords],
    queryFn: () => {
      const totalTests = testRecords.length;
      const averageScore = testRecords.length > 0 ? Math.round(testRecords.reduce((acc, test) => acc + (test.percentage || 0), 0) / testRecords.length) : 0;
      const subjects = Array.from(new Set(testRecords.map(test => test.subject).filter(Boolean)));

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
        const percent = test.percentage || 0;
        if (percent >= 90) gradeDistribution[0].count++;else if (percent >= 75) gradeDistribution[1].count++;else if (percent >= 60) gradeDistribution[2].count++;else if (percent >= 40) gradeDistribution[3].count++;else gradeDistribution[4].count++;
      });

      // Progress over time chart data
      const progressData = testRecords.filter(test => test.test_date).sort((a, b) => new Date(a.test_date!).getTime() - new Date(b.test_date!).getTime()).map(test => ({
        date: format(new Date(test.test_date!), 'dd MMM'),
        score: Math.round(test.percentage || 0),
        subject: test.subject || 'Unknown',
        test: test.test_name || 'Unknown Test'
      }));

      // Subject performance data
      const subjectPerformance: SubjectStat[] = subjects.map(subject => {
        const subjectTests = testRecords.filter(test => test.subject === subject);
        const averagePercent = subjectTests.length > 0 ? Math.round(subjectTests.reduce((acc, test) => acc + (test.percentage || 0), 0) / subjectTests.length) : 0;
        return {
          name: subject,
          score: averagePercent,
          fill: '#4ECDC4'
        };
      });

      // Find best subject
      const bestSubject = subjectPerformance.length > 0 ? subjectPerformance.sort((a, b) => b.score - a.score)[0] : null;

      // Find latest test
      const latestTest = testRecords.length > 0 ? testRecords.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0] : null;
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
    enabled: !testsLoading && testRecords.length >= 0
  });
  const handleBack = () => {
    navigate(-1);
  };

  // Functions to get grade and color based on percentage
  const getGrade = (percentage: number) => {
    if (percentage >= 90) return {
      grade: 'A',
      color: 'bg-emerald-500 text-white'
    };
    if (percentage >= 75) return {
      grade: 'B',
      color: 'bg-blue-500 text-white'
    };
    if (percentage >= 60) return {
      grade: 'C',
      color: 'bg-yellow-500 text-white'
    };
    if (percentage >= 40) return {
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

    // Convert to legacy format for PDF service
    const legacyFormat = {
      test_name: "Academic Records Report",
      subject: "All Subjects",
      test_date: new Date().toISOString(),
      marks: 0,
      total_marks: 100
    };
    exportTestToPDF({
      test: legacyFormat,
      student,
      title: "Academic Records Report",
      subtitle: `Complete Test History for ${student.full_name}`,
      allTests: testRecords.map(t => ({
        ...legacyFormat,
        test_name: t.test_name || 'Test',
        subject: t.subject || 'Subject',
        test_date: t.test_date || new Date().toISOString(),
        marks: t.marks_obtained,
        total_marks: t.total_marks
      }))
    });
    toast.success("Academic records PDF generated successfully");
  };

  // Handle single test export
  const handleExportTest = (test: EnhancedTestRecord) => {
    if (!student) {
      toast.error("Student information not available");
      return;
    }

    // Convert to legacy format for PDF service
    const legacyFormat = {
      test_name: test.test_name || 'Test',
      subject: test.subject || 'Subject',
      test_date: test.test_date || new Date().toISOString(),
      marks: test.marks_obtained,
      total_marks: test.total_marks
    };
    exportTestToPDF({
      test: legacyFormat,
      student,
      title: "Test Result Report",
      subtitle: `${test.subject} - ${test.test_name}`
    });
    toast.success("PDF generated successfully");
  };

  // Get student's first name
  const getStudentFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  // Enhanced loading skeleton with fixed stretching issues
  const LoadingSkeleton = () => <div className="space-y-6 px-4 md:px-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <Skeleton className="h-10 w-48 sm:w-64 flex-shrink-0" />
        </div>
        <Skeleton className="h-10 w-24 sm:w-32 flex-shrink-0" />
      </div>
      
      {/* Student Summary Card Skeleton */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <Skeleton className="h-6 w-32 sm:w-48" />
              <Skeleton className="h-4 w-24 sm:w-32" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 sm:w-24" />
              <Skeleton className="h-8 w-12 sm:w-16" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({
        length: 3
      }).map((_, i) => <div key={i} className="rounded-lg border bg-card shadow-sm">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 w-20 sm:w-24" />
              </div>
              <Skeleton className="h-8 w-12 sm:w-16" />
              <Skeleton className="h-2 w-full max-w-[200px]" />
            </div>
          </div>)}
      </div>
      
      {/* Test Records Table Skeleton */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2 flex-1 min-w-0">
              <Skeleton className="h-6 w-24 sm:w-32" />
              <Skeleton className="h-4 w-36 sm:w-48" />
            </div>
            <Skeleton className="h-10 w-20 sm:w-24 flex-shrink-0" />
          </div>
          
          <div className="space-y-3">
            {Array.from({
            length: 5
          }).map((_, i) => <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2 gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <Skeleton className="h-5 w-24 sm:w-32" />
                    <Skeleton className="h-4 w-20 sm:w-24" />
                  </div>
                  <Skeleton className="h-6 w-8 rounded-full flex-shrink-0" />
                </div>
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between items-center gap-2">
                    <Skeleton className="h-4 w-16 sm:w-20" />
                    <Skeleton className="h-4 w-12 sm:w-16" />
                  </div>
                  <Skeleton className="h-2 w-full max-w-[300px]" />
                </div>
              </div>)}
          </div>
        </div>
      </div>
      
      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({
        length: 2
      }).map((_, i) => <div key={i} className="rounded-lg border bg-card shadow-sm">
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 sm:w-40" />
                <Skeleton className="h-4 w-24 sm:w-32" />
              </div>
              <Skeleton className="h-48 sm:h-64 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-36 sm:w-48" />
                <Skeleton className="h-4 w-28 sm:w-36" />
              </div>
            </div>
          </div>)}
      </div>
    </div>;

  // Loading state
  if (studentLoading || testsLoading) {
    return <LoadingSkeleton />;
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
        {/* Page Header with student's name followed by 's Academics */}
        <EnhancedPageHeader title={student ? `${getStudentFirstName(student.full_name)}'s Academics` : "Academics"} showBackButton={true} onBack={handleBack} headerType="secondary" className="[&_h1]:text-3xl" />
        
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
                <div className="text-xl font-bold font-sf-pro ">{bestSubject?.name || "N/A"}</div>
                {bestSubject && <div className="mt-2 flex items-center gap-2">
                    <Progress value={bestSubject.score} className="h-2 flex-1" />
                    <span className="text-xs font-medium">{bestSubject.score}%</span>
                  </div>}
              </CardContent>
            </Card>
          </AnimatedDiv>
        </div>
        
        {/* Test Records Table */}
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
                <CardTitle className="text-xl">Test Records</CardTitle>
                <CardDescription className="text-left my-[8px] font-normal text-sm">
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
                    {testRecords.sort((a, b) => new Date(b.test_date || 0).getTime() - new Date(a.test_date || 0).getTime()).map((test, index) => {
                const percent = test.percentage || 0;
                const {
                  grade,
                  color
                } = getGrade(percent);
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
                                <h4 className="font-medium text-base">{test.subject || 'Unknown Subject'}</h4>
                                <p className="text-sm text-muted-foreground">{test.test_name || 'Unknown Test'}</p>
                              </div>
                              <Badge className={color}>{grade}</Badge>
                            </div>
                            
                            <div className="mt-3 bg-muted/30 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                  {test.test_date ? format(new Date(test.test_date), 'dd MMM yyyy') : 'No date'}
                                </div>
                                <div className="font-medium text-base font-spotify">
                                  {test.marks_obtained}/{test.total_marks}
                                </div>
                              </div>
                              <div className="mt-1">
                                <div className="flex justify-between text-xs mb-0.5">
                                  <span className="text-muted-foreground">Score</span>
                                  <span className="font-medium">{Math.round(percent)}%</span>
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
                        } = getGrade(percent);
                        navigator.share({
                          title: `${test.subject} Test Results`,
                          text: `${student?.full_name || 'Student'} scored ${test.marks_obtained}/${test.total_marks} (${Math.round(percent)}%, Grade ${grade}) in ${test.test_name} on ${test.test_date ? format(new Date(test.test_date), 'dd MMM yyyy') : 'Unknown date'}`
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
                        {testRecords.sort((a, b) => new Date(b.test_date || 0).getTime() - new Date(a.test_date || 0).getTime()).map((test, index) => {
                    const percent = test.percentage || 0;
                    const {
                      grade,
                      color
                    } = getGrade(percent);
                    return <TableRow key={test.id} className="hover:bg-muted/50">
                                <TableCell className="font-medium">{test.subject || 'Unknown Subject'}</TableCell>
                                <TableCell>{test.test_name || 'Unknown Test'}</TableCell>
                                <TableCell>{test.test_date ? format(new Date(test.test_date), 'dd MMM yyyy') : 'No date'}</TableCell>
                                <TableCell>
                                  <div className="font-spotify">{test.marks_obtained}/{test.total_marks}</div>
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
                              } = getGrade(percent);
                              navigator.share({
                                title: `${test.subject} Test Results`,
                                text: `${student?.full_name || 'Student'} scored ${test.marks_obtained}/${test.total_marks} (${Math.round(percent)}%, Grade ${grade}) in ${test.test_name} on ${test.test_date ? format(new Date(test.test_date), 'dd MMM yyyy') : 'Unknown date'}`
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
        {progressData.length > 0 && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Progress Chart - Updated Line Chart */}
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
                  <CardTitle className="text-xl">Performance Progress</CardTitle>
                  <CardDescription className="text-sm">Test performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={progressChartConfig}>
                    <LineChart accessibilityLayer data={progressData} margin={{
                  left: 12,
                  right: 12
                }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={value => value.slice(0, 6)} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Line dataKey="score" type="natural" stroke="#FF6B6B" strokeWidth={3} dot={{
                    r: 4,
                    strokeWidth: 2,
                    fill: "#FF6B6B"
                  }} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                  <div className="flex gap-2 leading-none font-medium">
                    Performance trend over time <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Showing test scores chronologically
                  </div>
                </CardFooter>
              </Card>
            </AnimatedDiv>
            
            {/* Subject Performance Chart - Updated Bar Chart */}
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
                  <CardTitle className="text-xl">Subject Performance</CardTitle>
                  <CardDescription className="text-sm">Average scores by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={subjectChartConfig}>
                    <BarChart accessibilityLayer data={subjectPerformance}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={value => value.slice(0, 8)} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Bar dataKey="score" fill="#4ECDC4" radius={8} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                  <div className="flex gap-2 leading-none font-medium">
                    {bestSubject ? bestSubject.name : "N/A"} is the strongest subject <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground leading-none">
                    Showing performance across all academic subjects
                  </div>
                </CardFooter>
              </Card>
            </AnimatedDiv>
          </div>}
      </AnimatedDiv>
    </div>;
}
