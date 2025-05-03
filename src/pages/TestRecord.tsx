import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ArrowUpDown, Plus, Download, Calendar, FileText, Users, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Define mock test records data structure
interface TestRecord {
  id: string;
  student_id: string;
  subject: string;
  test_date: string;
  test_name: string;
  marks: number;
  total_marks: number;
}

export default function TestRecord() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "marks">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const isMobile = useIsMobile();
  
  // Mock data for test records (replace with actual implementation using Supabase when the table exists)
  const { data: testRecords = [], isLoading: testsLoading } = useQuery({
    queryKey: ['test_records_mock'],
    queryFn: async () => {
      // In a real implementation, this would fetch from the test_records table
      // Since the table doesn't exist yet, we're using mock data
      // You'll need to create this table first
      
      // Attempt to get data from localStorage first (for persistence between page loads)
      const storedTestRecords = localStorage.getItem('mockTestRecords');
      if (storedTestRecords) {
        return JSON.parse(storedTestRecords);
      }
      
      // Generate mock data
      const mockData: TestRecord[] = [
        {
          id: "1",
          student_id: "1",
          subject: "Mathematics",
          test_date: "2024-04-15",
          test_name: "Algebra Quiz",
          marks: 42,
          total_marks: 50
        },
        {
          id: "2",
          student_id: "2",
          subject: "Physics",
          test_date: "2024-04-10",
          test_name: "Mechanics Test",
          marks: 35,
          total_marks: 40
        },
        {
          id: "3",
          student_id: "3",
          subject: "Chemistry",
          test_date: "2024-04-05",
          test_name: "Periodic Table Quiz",
          marks: 28,
          total_marks: 30
        },
        {
          id: "4",
          student_id: "1",
          subject: "English",
          test_date: "2024-04-01",
          test_name: "Grammar Test",
          marks: 38,
          total_marks: 50
        },
        {
          id: "5",
          student_id: "4",
          subject: "Mathematics",
          test_date: "2024-04-12",
          test_name: "Geometry Quiz",
          marks: 18,
          total_marks: 30
        },
      ];
      
      // Store in localStorage for persistence
      localStorage.setItem('mockTestRecords', JSON.stringify(mockData));
      
      return mockData;
    }
  });
  
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Generate some statistics
  const subjects = Array.from(new Set(testRecords.map((record: any) => record.subject)));
  const totalTests = testRecords.length;
  const averageScore = testRecords.length > 0 
    ? Math.round(testRecords.reduce((acc: number, record: any) => acc + record.marks, 0) / testRecords.length) 
    : 0;

  // Grade distribution
  const gradeDistribution = [
    { name: 'A (90-100%)', value: 0, color: '#22c55e' }, 
    { name: 'B (75-89%)', value: 0, color: '#3b82f6' },
    { name: 'C (60-74%)', value: 0, color: '#eab308' },
    { name: 'D (40-59%)', value: 0, color: '#f97316' },
    { name: 'F (0-39%)', value: 0, color: '#ef4444' }
  ];
  
  testRecords.forEach((record: any) => {
    const percent = (record.marks / record.total_marks) * 100;
    if (percent >= 90) gradeDistribution[0].value++;
    else if (percent >= 75) gradeDistribution[1].value++;
    else if (percent >= 60) gradeDistribution[2].value++;
    else if (percent >= 40) gradeDistribution[3].value++;
    else gradeDistribution[4].value++;
  });

  // Subject performance
  const subjectPerformance = subjects.map(subject => {
    const subjectTests = testRecords.filter((record: any) => record.subject === subject);
    const averagePercent = subjectTests.length > 0 
      ? Math.round(
          subjectTests.reduce((acc: number, record: any) => 
            acc + (record.marks / record.total_marks) * 100, 0) / subjectTests.length
        ) 
      : 0;
      
    return {
      name: subject,
      score: averagePercent,
      fill: `hsl(${Math.random() * 360}, 70%, 60%)`
    };
  });
  
  // Filter and sort test records
  const filteredTests = testRecords
    .filter((test: any) => {
      const student = students.find(s => s.id === test.student_id);
      const studentMatches = student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const subjectMatches = subjectFilter === "all" || test.subject === subjectFilter;
      const classMatches = classFilter === "all" || student?.class?.toString() === classFilter;
      
      return studentMatches && subjectMatches && classMatches;
    })
    .sort((a: any, b: any) => {
      if (sortField === "date") {
        const dateA = new Date(a.test_date).getTime();
        const dateB = new Date(b.test_date).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        // Sort by percentage score
        const percentA = (a.marks / a.total_marks) * 100;
        const percentB = (b.marks / b.total_marks) * 100;
        return sortDirection === "asc" ? percentA - percentB : percentB - percentA;
      }
    });
    
  // Toggle sort direction
  const handleSort = (field: "date" | "marks") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Functions to get grade and color based on marks
  const getGrade = (marks: number, totalMarks: number) => {
    const percent = (marks / totalMarks) * 100;
    if (percent >= 90) return { grade: 'A', color: 'bg-emerald-500' };
    if (percent >= 75) return { grade: 'B', color: 'bg-blue-500' };
    if (percent >= 60) return { grade: 'C', color: 'bg-yellow-500' };
    if (percent >= 40) return { grade: 'D', color: 'bg-orange-500' };
    return { grade: 'F', color: 'bg-red-500' };
  };
  
  // Loading state
  if (testsLoading || studentsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading test records...</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <EnhancedPageHeader 
        title="Test Records" 
        description="Track and manage student performance"
        showBackButton
        action={
          <div className="flex gap-2">
            <Button className="bg-green-500 hover:bg-green-600">
              <Plus className="h-4 w-4 mr-2" /> Add Test
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{totalTests}</div>
            <p className="text-sm text-muted-foreground mt-1">Across all subjects and classes</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{averageScore}%</div>
            <p className="text-sm text-muted-foreground mt-1">Overall student performance</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{subjects.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Different subjects tested</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">Test Records</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tests" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject: any) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {Array.from({ length: 9 }, (_, i) => i + 2).map((cls) => (
                    <SelectItem key={cls} value={cls.toString()}>Class {cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            {isMobile ? (
              <AnimatePresence>
                {filteredTests.map((test: any, index) => {
                  const student = students.find(s => s.id === test.student_id);
                  const { grade, color } = getGrade(test.marks, test.total_marks);
                  
                  return (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{student?.full_name || "Unknown Student"}</p>
                              <p className="text-sm text-muted-foreground">Class {student?.class || "N/A"}</p>
                            </div>
                            <Badge className={color}>{grade}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Subject</p>
                              <p>{test.subject}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Date</p>
                              <p>{format(new Date(test.test_date), 'dd MMM yyyy')}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Test Name</p>
                              <p>{test.test_name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Score</p>
                              <p className="font-medium">
                                {test.marks}/{test.total_marks} ({Math.round((test.marks / test.total_marks) * 100)}%)
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            ) : (
              <Card>
                <div className="rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>
                          <div className="flex items-center cursor-pointer" onClick={() => handleSort("date")}>
                            Date <ArrowUpDown className="ml-2 h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Test Name</TableHead>
                        <TableHead>
                          <div className="flex items-center cursor-pointer" onClick={() => handleSort("marks")}>
                            Score <ArrowUpDown className="ml-2 h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredTests.map((test: any, index) => {
                          const student = students.find(s => s.id === test.student_id);
                          const { grade, color } = getGrade(test.marks, test.total_marks);
                          const percent = Math.round((test.marks / test.total_marks) * 100);
                          
                          return (
                            <motion.tr
                              key={test.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.02 }}
                            >
                              <TableCell>
                                <div className="font-medium">{student?.full_name || "Unknown"}</div>
                                <div className="text-xs text-muted-foreground">Class {student?.class || "N/A"}</div>
                              </TableCell>
                              <TableCell>{test.subject}</TableCell>
                              <TableCell>{format(new Date(test.test_date), 'dd MMM yyyy')}</TableCell>
                              <TableCell>{test.test_name}</TableCell>
                              <TableCell>
                                <div className="font-medium">{test.marks}/{test.total_marks}</div>
                                <div className="text-xs text-muted-foreground">{percent}%</div>
                              </TableCell>
                              <TableCell>
                                <Badge className={color}>{grade}</Badge>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                      
                      {filteredTests.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No test records found matching your search criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Distribution of grades across all tests</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} tests`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
                <CardDescription>Average scores by subject</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={subjectPerformance}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Average Score']} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {subjectPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
