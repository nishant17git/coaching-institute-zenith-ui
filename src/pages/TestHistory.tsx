
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { testService } from "@/services/testService";
import { studentService } from "@/services/studentService";
import { format } from "date-fns";

// Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Charts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// Icons
import { TrendingUp, Award, Calendar, BookOpen, ArrowLeft } from "lucide-react";

export default function TestHistory() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState("all");

  // Fetch student data
  const {
    data: student,
    isLoading: isLoadingStudent
  } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentService.getStudentById(studentId!),
    enabled: !!studentId
  });

  // Fetch test history and statistics
  const {
    data: testHistory,
    isLoading: isLoadingHistory
  } = useQuery({
    queryKey: ['testHistory', studentId],
    queryFn: () => testService.getStudentTestHistory(studentId!),
    enabled: !!studentId
  });

  // Fetch test records for detailed view
  const {
    data: testRecords = [],
    isLoading: isLoadingRecords
  } = useQuery({
    queryKey: ['studentTests', studentId],
    queryFn: () => testService.getStudentTestRecords(studentId!),
    enabled: !!studentId
  });

  if (isLoadingStudent || isLoadingHistory || isLoadingRecords) {
    return <LoadingState />;
  }

  if (!student || !testHistory) {
    return (
      <EmptyState 
        icon={<BookOpen className="h-10 w-10 text-muted-foreground" />}
        title="Student not found"
        description="The requested student could not be found."
      />
    );
  }

  // Filter test records by subject
  const filteredRecords = selectedSubject === "all" 
    ? testRecords 
    : testRecords.filter(record => record.subject === selectedSubject);

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 80) return "bg-blue-500";
    if (percentage >= 70) return "bg-purple-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    return "D";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <EnhancedPageHeader 
        title={`Test History - ${student.full_name}`}
        action={
          <Button 
            variant="outline" 
            onClick={() => navigate('/test-records')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Tests
          </Button>
        }
      />

      {/* Student Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{testHistory.totalTests}</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{testHistory.averageScore}%</div>
              <div className="text-sm text-muted-foreground">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{testHistory.subjects.length}</div>
              <div className="text-sm text-muted-foreground">Subjects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {testHistory.bestSubject?.name || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Best Subject</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {testHistory.gradeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={testHistory.gradeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {testHistory.gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
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
            {testHistory.subjectPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={testHistory.subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {testHistory.subjectPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                No subject data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testHistory.progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={testHistory.progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                  formatter={(value, name) => [`${value}%`, 'Score']}
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
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No progress data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Test Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Test Records
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {testHistory.subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length > 0 ? (
            <div className="space-y-3">
              {filteredRecords.map(record => {
                const percentage = Math.round((record.marks / record.total_marks) * 100);
                const grade = getGrade(percentage);
                
                return (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{record.test_name}</h4>
                        <Badge variant="outline">{record.subject}</Badge>
                        <Badge className={`${getGradeColor(percentage)} text-white`}>
                          {grade}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(record.test_date), 'MMM dd, yyyy')} • {record.test_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{record.marks}/{record.total_marks}</div>
                      <div className="text-sm text-muted-foreground">{percentage}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState 
              icon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
              title="No test records found"
              description={selectedSubject === "all" 
                ? "No test records available for this student." 
                : `No test records found for ${selectedSubject}.`}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
