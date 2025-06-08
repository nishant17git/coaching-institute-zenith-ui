
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Download, Filter, BarChart3, Users, BookOpen, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { format } from "date-fns";

interface TestDetailsViewProps {
  testRecords: any[];
  students: any[];
  onExportPDF: (test: any) => void;
}

export function TestDetailsView({ testRecords, students, onExportPDF }: TestDetailsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Get unique subjects and classes
  const subjects = Array.from(new Set(testRecords.map(test => "Mathematics"))); // Fallback since we don't have subject in test_results
  const classes = Array.from(new Set(students.map(student => student.class?.toString()).filter(Boolean)));

  // Filter and sort test records
  const filteredTests = testRecords
    .filter((test) => {
      const student = students.find(s => s.id === test.student_id);
      if (!student) return false;

      const searchLower = searchQuery.toLowerCase();
      const studentName = student.full_name?.toLowerCase() || '';
      const searchMatches = studentName.includes(searchLower);
      
      const classMatches = classFilter === "all" || student.class?.toString() === classFilter;
      
      return searchMatches && classMatches;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "score":
          return (b.percentage || 0) - (a.percentage || 0);
        case "name":
          const studentA = students.find(s => s.id === a.student_id);
          const studentB = students.find(s => s.id === b.student_id);
          return (studentA?.full_name || "").localeCompare(studentB?.full_name || "");
        case "date":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Calculate summary statistics
  const totalTests = filteredTests.length;
  const averageScore = totalTests > 0 
    ? Math.round(filteredTests.reduce((sum, test) => sum + (test.percentage || 0), 0) / totalTests)
    : 0;
  const passCount = filteredTests.filter(test => (test.percentage || 0) >= 40).length;
  const passRate = totalTests > 0 ? Math.round((passCount / totalTests) * 100) : 0;

  // Group tests by subject for subject-wise performance
  const subjectPerformance = subjects.map(subject => {
    const subjectTests = filteredTests; // All tests since we don't have subject filtering
    const avgScore = subjectTests.length > 0 
      ? Math.round(subjectTests.reduce((sum, test) => sum + (test.percentage || 0), 0) / subjectTests.length)
      : 0;
    
    return {
      subject,
      testCount: subjectTests.length,
      averageScore: avgScore,
      passRate: subjectTests.length > 0 
        ? Math.round((subjectTests.filter(test => (test.percentage || 0) >= 40).length / subjectTests.length) * 100)
        : 0
    };
  });

  // Group tests by class for class-wise performance
  const classPerformance = classes.map(className => {
    const classTests = filteredTests.filter(test => {
      const student = students.find(s => s.id === test.student_id);
      return student?.class?.toString() === className;
    });
    
    const avgScore = classTests.length > 0 
      ? Math.round(classTests.reduce((sum, test) => sum + (test.percentage || 0), 0) / classTests.length)
      : 0;
    
    return {
      class: className,
      testCount: classTests.length,
      averageScore: avgScore,
      passRate: classTests.length > 0 
        ? Math.round((classTests.filter(test => (test.percentage || 0) >= 40).length / classTests.length) * 100)
        : 0
    };
  });

  const formatSafeDate = (dateValue: string | null | undefined): string => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'N/A';
      return format(date, 'dd MMM yyyy');
    } catch (error) {
      return 'N/A';
    }
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'bg-green-500' };
    if (percentage >= 80) return { grade: 'A', color: 'bg-blue-500' };
    if (percentage >= 70) return { grade: 'B', color: 'bg-purple-500' };
    if (percentage >= 60) return { grade: 'C', color: 'bg-yellow-500' };
    if (percentage >= 40) return { grade: 'D', color: 'bg-orange-500' };
    return { grade: 'F', color: 'bg-red-500' };
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Tests</p>
                  <p className="text-2xl font-bold text-blue-900">{totalTests}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Average Score</p>
                  <p className="text-2xl font-bold text-green-900">{averageScore}%</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Pass Rate</p>
                  <p className="text-2xl font-bold text-purple-900">{passRate}%</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Subjects</p>
                  <p className="text-2xl font-bold text-orange-900">{subjects.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-wise Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subject-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subjectPerformance.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{subject.subject}</p>
                    <p className="text-sm text-muted-foreground">{subject.testCount} tests</p>
                  </div>
                  <div className="text-right">
                    <Badge className={subject.averageScore >= 75 ? 'bg-green-500' : subject.averageScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}>
                      {subject.averageScore}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{subject.passRate}% pass rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Class-wise Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Class-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {classPerformance.map((classData, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Class {classData.class}</p>
                    <p className="text-sm text-muted-foreground">{classData.testCount} tests</p>
                  </div>
                  <div className="text-right">
                    <Badge className={classData.averageScore >= 75 ? 'bg-green-500' : classData.averageScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}>
                      {classData.averageScore}%
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{classData.passRate}% pass rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(className => (
                  <SelectItem key={className} value={className}>Class {className}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Test Records Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.map((test) => {
                  const student = students.find(s => s.id === test.student_id);
                  const percentage = test.percentage || Math.round((test.marks_obtained / test.total_marks) * 100);
                  const { grade, color } = getGrade(percentage);
                  
                  return (
                    <TableRow key={test.id}>
                      <TableCell>
                        <div className="font-medium">{student?.full_name || "Unknown"}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Class {student?.class || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>{formatSafeDate(test.created_at)}</TableCell>
                      <TableCell>
                        <div className="font-medium">{test.marks_obtained}/{test.total_marks}</div>
                        <div className="text-sm text-muted-foreground">{percentage}%</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={color}>{grade}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onExportPDF(test)}
                          className="gap-2"
                        >
                          <Download className="h-3 w-3" />
                          Export
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
