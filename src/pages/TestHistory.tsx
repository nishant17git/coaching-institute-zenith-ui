
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion } from "framer-motion";

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

// Charts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// Services and Types
import { supabase } from "@/integrations/supabase/client";
import { HistoryStats, TestRecordDb, ChartDataPoint } from "@/types";

// Icons
import { ArrowLeft, TrendingUp, Trophy, BookOpen, Calendar, Target } from "lucide-react";

export default function TestHistory() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch student data
  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => {
      if (!studentId) throw new Error('Student ID is required');
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!studentId
  });

  // Fetch test results
  const { data: testResults = [], isLoading: resultsLoading } = useQuery({
    queryKey: ['testResults', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from('test_results')
        .select(`
          *,
          tests (
            test_name,
            subject,
            test_date,
            class,
            total_marks
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!studentId
  });

  // Calculate statistics
  const stats: HistoryStats = React.useMemo(() => {
    if (!testResults.length) {
      return {
        totalTests: 0,
        averageScore: 0,
        subjects: [],
        gradeDistribution: [],
        progressData: [],
        subjectPerformance: [],
        bestSubject: null,
        latestTest: null
      };
    }

    const totalTests = testResults.length;
    const averageScore = Math.round(
      testResults.reduce((sum, result) => sum + (result.percentage || 0), 0) / totalTests
    );

    const subjects = [...new Set(testResults.map(result => result.tests?.subject).filter(Boolean))];

    // Grade distribution
    const gradeDistribution = [
      { name: 'A+ (90-100%)', count: testResults.filter(r => (r.percentage || 0) >= 90).length, color: '#10B981' },
      { name: 'A (80-89%)', count: testResults.filter(r => (r.percentage || 0) >= 80 && (r.percentage || 0) < 90).length, color: '#3B82F6' },
      { name: 'B (70-79%)', count: testResults.filter(r => (r.percentage || 0) >= 70 && (r.percentage || 0) < 80).length, color: '#F59E0B' },
      { name: 'C (60-69%)', count: testResults.filter(r => (r.percentage || 0) >= 60 && (r.percentage || 0) < 70).length, color: '#EF4444' },
      { name: 'Below 60%', count: testResults.filter(r => (r.percentage || 0) < 60).length, color: '#9CA3AF' }
    ];

    // Progress data for line chart
    const progressData: ChartDataPoint[] = testResults
      .slice()
      .reverse()
      .map(result => ({
        subject: result.tests?.subject || 'Unknown',
        test: result.tests?.test_name || 'Unknown Test',
        date: result.tests?.test_date || new Date().toISOString(),
        score: result.percentage || 0
      }));

    // Subject performance
    const subjectPerformance = subjects.map(subject => {
      const subjectResults = testResults.filter(r => r.tests?.subject === subject);
      const avgScore = Math.round(
        subjectResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / subjectResults.length
      );
      
      return {
        name: subject,
        score: avgScore,
        fill: `hsl(${Math.random() * 360}, 70%, 50%)`
      };
    });

    const bestSubject = subjectPerformance.reduce((best, current) => 
      current.score > (best?.score || 0) ? current : best, subjectPerformance[0] || null
    );

    const latestTest = testResults[0] || null;

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
  }, [testResults]);

  const isLoading = studentLoading || resultsLoading;

  if (!studentId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Invalid Student ID</h3>
          <p className="text-muted-foreground">Please select a valid student.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <EnhancedPageHeader 
        title={`Test History - ${student?.full_name || 'Loading...'}`}
        action={
          <Button 
            variant="outline" 
            onClick={() => navigate('/tests')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tests
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState />
      ) : !student ? (
        <EmptyState 
          icon={<BookOpen className="h-10 w-10 text-muted-foreground" />}
          title="Student not found"
          description="The requested student could not be found."
        />
      ) : (
        <>
          {/* Student Info Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                  {student.full_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{student.full_name}</h2>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Class {student.class}</span>
                    <span>Roll No: {student.roll_number}</span>
                    <span>Admission: {format(new Date(student.admission_date), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-4 border-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                  <BookOpen className="h-4 w-4" /> Total Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTests}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b-4 border-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                  <TrendingUp className="h-4 w-4" /> Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                <div className="text-xs text-muted-foreground">All tests</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b-4 border-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                  <Trophy className="h-4 w-4" /> Best Subject
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold truncate">{stats.bestSubject?.name || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">{stats.bestSubject?.score || 0}% average</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b-4 border-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                  <Target className="h-4 w-4" /> Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.subjects.length}</div>
                <div className="text-xs text-muted-foreground">Covered</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="tests">All Tests</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grade Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Grade Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.gradeDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={stats.gradeDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ name, count }) => count > 0 ? `${count}` : ''}
                          >
                            {stats.gradeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name, props) => [value, props.payload.name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-48 text-muted-foreground">
                        No test data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Subject Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Subject Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.subjectPerformance.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={stats.subjectPerformance}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="score" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-48 text-muted-foreground">
                        No subject data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Score Progression</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.progressData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats.progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                        />
                        <YAxis domain={[0, 100]} />
                        <Tooltip 
                          labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                          formatter={(value, name, props) => [`${value}%`, props.payload.test]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#3B82F6" 
                          strokeWidth={2}
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      No progress data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Tests Tab */}
            <TabsContent value="tests" className="space-y-4">
              {testResults.length > 0 ? (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold">{result.tests?.test_name || 'Unknown Test'}</h3>
                              <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                                <span>{result.tests?.subject || 'Unknown Subject'}</span>
                                <span>{format(new Date(result.tests?.test_date || ''), 'MMM dd, yyyy')}</span>
                                <span>Class {result.tests?.class || 'N/A'}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {result.marks_obtained}/{result.total_marks}
                              </div>
                              <Badge 
                                variant={
                                  (result.percentage || 0) >= 90 ? "success" :
                                  (result.percentage || 0) >= 70 ? "warning" :
                                  "danger"
                                }
                              >
                                {result.percentage?.toFixed(1) || 0}%
                              </Badge>
                            </div>
                          </div>
                          {result.percentage && (
                            <div className="mt-3">
                              <Progress value={result.percentage} className="h-2" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={<BookOpen className="h-10 w-10 text-muted-foreground" />}
                  title="No test records found"
                  description="This student hasn't taken any tests yet."
                />
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
