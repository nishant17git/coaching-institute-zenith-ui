
import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ArrowUpDown, Plus, LibraryBig, Loader2, FileText, ArrowLeft, History, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { exportTestToPDF } from "@/services/pdfService";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TestAddForm } from "@/components/tests/TestAddForm";
import { TestResults } from "@/components/tests/TestResults";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StudentRecord, TestRecordDb } from "@/types";

export default function TestRecord() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "marks">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
  const [isEditTestOpen, setIsEditTestOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [editingTest, setEditingTest] = useState<TestRecordDb | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const { data: testRecords = [], isLoading: testsLoading, refetch: refetchTests } = useQuery<TestRecordDb[]>({
    queryKey: ['test_records_mock'],
    queryFn: async () => {
      // In a real implementation, this would fetch from the test_records table
      // Since the table doesn't exist yet, we're using mock data
      
      // Attempt to get data from localStorage first (for persistence between page loads)
      const storedTestRecords = localStorage.getItem('mockTestRecords');
      if (storedTestRecords) {
        return JSON.parse(storedTestRecords);
      }
      
      // Generate mock data
      const mockData: TestRecordDb[] = [
        {
          id: "1",
          student_id: "1",
          subject: "Mathematics",
          test_date: "2024-04-15",
          test_name: "Algebra Quiz",
          marks: 42,
          total_marks: 50,
          test_type: "Chapter-wise Test"
        },
        {
          id: "2",
          student_id: "2",
          subject: "Physics",
          test_date: "2024-04-10",
          test_name: "Mechanics Test",
          marks: 35,
          total_marks: 40,
          test_type: "Chapter-wise Test"
        },
        {
          id: "3",
          student_id: "3",
          subject: "Chemistry",
          test_date: "2024-04-05",
          test_name: "Periodic Table Quiz",
          marks: 28,
          total_marks: 30,
          test_type: "Chapter-wise Test"
        },
        {
          id: "4",
          student_id: "1",
          subject: "English",
          test_date: "2024-04-01",
          test_name: "Grammar Test",
          marks: 18,
          total_marks: 20,
          test_type: "MCQs Test (Normal)"
        },
        {
          id: "5",
          student_id: "4",
          subject: "Mathematics",
          test_date: "2024-04-12",
          test_name: "Geometry Quiz",
          marks: 18,
          total_marks: 20,
          test_type: "MCQs Test (Standard)"
        },
      ];
      
      // Store in localStorage for persistence
      localStorage.setItem('mockTestRecords', JSON.stringify(mockData));
      
      return mockData;
    }
  });
  
  const { data: students = [], isLoading: studentsLoading } = useQuery<StudentRecord[]>({
    queryKey: ['students'],
    queryFn: async () => {
      // Only fetch students from class 9 and 10 with proper numeric type
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .in('class', [9, 10]); // Using numbers for consistency
      
      if (error) {
        // Fallback to mock data if no data exists or there's an error
        return [
          { id: "1", full_name: "Rahul Sharma", class: 9, roll_number: 101, date_of_birth: "2008-05-15", address: "123 Main St", guardian_name: "Raj Sharma", contact_number: "9876543210", fee_status: "Paid", total_fees: 5000, paid_fees: 5000, attendance_percentage: 95, join_date: "2023-04-01", created_at: "2023-04-01", updated_at: "2023-04-01" },
          { id: "2", full_name: "Priya Patel", class: 9, roll_number: 102, date_of_birth: "2008-06-20", address: "456 Oak St", guardian_name: "Sanjay Patel", contact_number: "8765432109", fee_status: "Paid", total_fees: 5000, paid_fees: 5000, attendance_percentage: 98, join_date: "2023-04-01", created_at: "2023-04-01", updated_at: "2023-04-01" },
          { id: "3", full_name: "Amit Kumar", class: 10, roll_number: 201, date_of_birth: "2007-03-10", address: "789 Park Ave", guardian_name: "Vijay Kumar", contact_number: "7654321098", fee_status: "Partial", total_fees: 6000, paid_fees: 3000, attendance_percentage: 92, join_date: "2023-04-01", created_at: "2023-04-01", updated_at: "2023-04-01" },
          { id: "4", full_name: "Neha Singh", class: 10, roll_number: 202, date_of_birth: "2007-09-25", address: "101 Pine Rd", guardian_name: "Rajesh Singh", contact_number: "6543210987", fee_status: "Pending", total_fees: 6000, paid_fees: 0, attendance_percentage: 88, join_date: "2023-04-01", created_at: "2023-04-01", updated_at: "2023-04-01" },
        ] as unknown as StudentRecord[];
      }
      return data as unknown as StudentRecord[] || [];
    }
  });
  
  // Generate some statistics
  const subjects = Array.from(new Set(testRecords.map((record: TestRecordDb) => record.subject)));
  const totalTests = testRecords.length;
  const averageScore = testRecords.length > 0 
    ? Math.round(testRecords.reduce((acc: number, record: TestRecordDb) => acc + (record.marks / record.total_marks) * 100, 0) / testRecords.length) 
    : 0;

  // Grade distribution with more vibrant colors
  const gradeDistribution = [
    { name: 'A (90-100%)', value: 0, color: '#22c55e' }, // Green 
    { name: 'B (75-89%)', value: 0, color: '#0EA5E9' },  // Ocean Blue
    { name: 'C (60-74%)', value: 0, color: '#EAB308' },  // Yellow
    { name: 'D (40-59%)', value: 0, color: '#F97316' },  // Bright Orange
    { name: 'F (0-39%)', value: 0, color: '#EF4444' }    // Red
  ];
  
  testRecords.forEach((record: TestRecordDb) => {
    const percent = (record.marks / record.total_marks) * 100;
    if (percent >= 90) gradeDistribution[0].value++;
    else if (percent >= 75) gradeDistribution[1].value++;
    else if (percent >= 60) gradeDistribution[2].value++;
    else if (percent >= 40) gradeDistribution[3].value++;
    else gradeDistribution[4].value++;
  });

  // Subject performance with vibrant colors
  const subjectPerformance = subjects.map((subject, index) => {
    const subjectTests = testRecords.filter((record: TestRecordDb) => record.subject === subject);
    const averagePercent = subjectTests.length > 0 
      ? Math.round(
          subjectTests.reduce((acc: number, record: TestRecordDb) => 
            acc + (record.marks / record.total_marks) * 100, 0) / subjectTests.length
        ) 
      : 0;
      
    // Vibrant colors for subjects
    const vibrantColors = [
      '#0EA5E9', // Ocean Blue
      '#8B5CF6', // Vivid Purple
      '#F97316', // Bright Orange
      '#22C55E', // Green
      '#F43F5E', // Raspberry
      '#3B82F6', // Bright Blue
      '#EC4899', // Hot Pink
      '#EAB308', // Yellow
      '#06B6D4', // Cyan
      '#D946EF', // Magenta Pink (for math subject if it exists)
    ];
    
    // Special color for specific subjects
    let color = vibrantColors[index % vibrantColors.length];
    if (subject.toLowerCase().includes('math')) {
      color = '#D946EF'; // Magenta Pink for Math
    } else if (subject.toLowerCase().includes('science')) {
      color = '#06B6D4'; // Cyan for Science
    }
      
    return {
      name: subject,
      score: averagePercent,
      fill: color
    };
  });
  
  // Handle new test creation
  const handleAddTest = (testData: any) => {
    // Get existing tests
    const existingTests = JSON.parse(localStorage.getItem('mockTestRecords') || '[]');
    
    // Create new test object with explicit number conversions
    const newTest: TestRecordDb = {
      id: (existingTests.length + 1).toString(),
      student_id: testData.studentId,
      subject: testData.subject,
      test_date: testData.testDate,
      test_name: testData.testName,
      test_type: testData.testType,
      // Explicitly convert string values to numbers to fix the type errors
      marks: Number(testData.marks),
      total_marks: Number(testData.totalMarks)
    };
    
    // Save to localStorage
    localStorage.setItem('mockTestRecords', JSON.stringify([...existingTests, newTest]));
    
    // Close dialog and refetch data
    setIsAddTestOpen(false);
    refetchTests();
    
    // Show success notification
    toast.success("Test record added successfully");
  };
  
  // Handle test update
  const handleUpdateTest = (testData: any) => {
    if (!editingTest) return;
    
    // Get existing tests
    const existingTests = JSON.parse(localStorage.getItem('mockTestRecords') || '[]');
    
    // Update the test with explicit number conversions
    const updatedTests = existingTests.map((test: TestRecordDb) => {
      if (test.id === editingTest.id) {
        return {
          ...test,
          subject: testData.subject,
          test_date: testData.testDate,
          test_name: testData.testName,
          test_type: testData.testType,
          // Explicitly convert string values to numbers to fix the type errors
          marks: Number(testData.marks),
          total_marks: Number(testData.totalMarks)
        };
      }
      return test;
    });
    
    // Save to localStorage
    localStorage.setItem('mockTestRecords', JSON.stringify(updatedTests));
    
    // Close dialog, reset editing state, and refetch data
    setIsEditTestOpen(false);
    setEditingTest(null);
    refetchTests();
    
    // Show success notification
    toast.success("Test record updated successfully");
  };
  
  // Handle test deletion
  const handleDeleteTest = (testId: string) => {
    // Get existing tests
    const existingTests = JSON.parse(localStorage.getItem('mockTestRecords') || '[]');
    
    // Filter out the deleted test
    const updatedTests = existingTests.filter((test: TestRecordDb) => test.id !== testId);
    
    // Save to localStorage
    localStorage.setItem('mockTestRecords', JSON.stringify(updatedTests));
    
    // Refetch data
    refetchTests();
    
    // Show success notification
    toast.success("Test record deleted successfully");
  };
  
  // Handle editing a test
  const handleEditTest = (test: TestRecordDb) => {
    setEditingTest(test);
    setIsEditTestOpen(true);
  };
  
  // Filter and sort test records
  const filteredTests = testRecords
    .filter((test: TestRecordDb) => {
      const student = students.find(s => s.id === test.student_id);
      
      // Strongly type and check the search string
      const searchLower = searchQuery.toLowerCase();
      
      // Type guard to ensure student name is a string before using toLowerCase
      const studentName = student && student.full_name && typeof student.full_name === 'string' 
        ? student.full_name.toLowerCase() 
        : '';
        
      const studentMatches = studentName.includes(searchLower);
      const subjectMatches = subjectFilter === "all" || test.subject === subjectFilter;
      
      // Type-safe class comparison
      const classMatches = classFilter === "all" || 
        (student && student.class !== undefined && student.class.toString() === classFilter);
      
      return studentMatches && subjectMatches && classMatches;
    })
    .sort((a: TestRecordDb, b: TestRecordDb) => {
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
  
  // Handle PDF export for a single test
  const handleExportPDF = (test: TestRecordDb) => {
    const student = students.find(s => s.id === test.student_id);
    
    if (student) {
      exportTestToPDF({
        test,
        student,
        title: "Test Result Report",
        subtitle: `${test.subject} - ${test.test_name}`
      });
      
      toast.success("PDF generated successfully");
    } else {
      toast.error("Could not find student information");
    }
  };
  
  // New function to get test history for a student
  const getStudentTestHistory = (studentId: string) => {
    return testRecords.filter((test: TestRecordDb) => test.student_id === studentId);
  };
  
  // New function to handle exporting all test results for a student
  const handleExportStudentHistory = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const studentTests = getStudentTestHistory(studentId);
    
    if (student && studentTests.length > 0) {
      // Create a test summary for the student
      const testSummary = {
        studentName: student.full_name || "Unknown Student",
        class: student.class || "N/A",
        testCount: studentTests.length,
        averageScore: Math.round(
          studentTests.reduce((acc: number, test: TestRecordDb) => 
            acc + ((test.marks / test.total_marks) * 100), 0) / studentTests.length
        )
      };
      
      // Export all tests as a single PDF
      exportTestToPDF({
        test: studentTests[0],
        student,
        title: "Test History Report",
        subtitle: `Complete Test History for ${student.full_name}`,
        allTests: studentTests
      });
      
      toast.success("Test history PDF generated successfully");
    } else {
      toast.error("Could not find student information or test records");
    }
  };
  
  // Handle view history - redirect to test history page
  const handleViewHistory = (studentId: string) => {
    navigate(`/tests/history/${studentId}`);
  };
  
  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };
  
  // Convert test record for form
  const convertTestToFormValues = (test: TestRecordDb) => {
    return {
      studentId: test.student_id,
      subject: test.subject,
      testName: test.test_name,
      testDate: test.test_date,
      testType: test.test_type || "Chapter-wise Test",
      marks: test.marks.toString(),
      totalMarks: test.total_marks.toString()
    };
  };
  
  // Loading state
  if (testsLoading || studentsLoading) {
    return <TestLoadingState />;
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader 
        title="Test Records" 
        showBackButton={true} 
        onBack={() => navigate(-1)}
        action={
          <Dialog open={isAddTestOpen} onOpenChange={setIsAddTestOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-black hover:bg-black/80 text-white">
                <Plus className="h-4 w-4" /> Add Test
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Test Record</DialogTitle>
                <DialogDescription>
                  Enter the details for the new test record below.
                </DialogDescription>
              </DialogHeader>
              <TestAddForm onSubmit={handleAddTest} students={students} />
            </DialogContent>
          </Dialog>
        }
      />
      
      {/* Edit Test Dialog */}
      <Dialog open={isEditTestOpen} onOpenChange={(open) => {
        setIsEditTestOpen(open);
        if (!open) setEditingTest(null);
      }}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Test Record</DialogTitle>
            <DialogDescription>
              Update the details of this test record.
            </DialogDescription>
          </DialogHeader>
          {editingTest && (
            <TestAddForm 
              onSubmit={handleUpdateTest} 
              students={students} 
              initialData={convertTestToFormValues(editingTest)}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Student History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Test History
              {selectedStudentId && (
                <span className="ml-2 text-muted-foreground font-normal">
                  {students.find(s => s.id === selectedStudentId)?.full_name || "Unknown Student"}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              View all test records for this student
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudentId && (
            <>
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Test Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getStudentTestHistory(selectedStudentId).map((test: TestRecordDb) => {
                      const { grade, color } = getGrade(test.marks, test.total_marks);
                      const percent = Math.round((test.marks / test.total_marks) * 100);
                      
                      return (
                        <TableRow key={test.id}>
                          <TableCell>{test.subject}</TableCell>
                          <TableCell>{test.test_name}</TableCell>
                          <TableCell>{test.test_type || "Chapter-wise Test"}</TableCell>
                          <TableCell>{format(new Date(test.test_date), 'dd MMM yyyy')}</TableCell>
                          <TableCell>
                            {test.marks}/{test.total_marks} ({percent}%)
                          </TableCell>
                          <TableCell>
                            <Badge className={color}>{grade}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsHistoryDialogOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  onClick={() => handleExportStudentHistory(selectedStudentId)}
                >
                  <FileText className="h-4 w-4" /> Export All Tests
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Tests"
          value={totalTests}
          description="Across all subjects and classes"
          icon={<FileText className="h-5 w-5" />}
        />
        
        <StatCard
          title="Average Score"
          value={`${averageScore}%`}
          description="Overall student performance"
          icon={<Trophy className="h-5 w-5" />}
        />
        
        <StatCard
          title="Subjects"
          value={subjects.length}
          description="Different subjects tested"
          icon={<LibraryBig className="h-5 w-5" />}
        />
      </div>
      
      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2 rounded-lg bg-muted/80 backdrop-blur-sm">
          <TabsTrigger value="tests" className="font-medium">Test Records</TabsTrigger>
          <TabsTrigger value="analytics" className="font-medium">Performance Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tests" className="space-y-4 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 backdrop-blur-sm transition-all focus:bg-background"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[150px] bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-all">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject: string) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[130px] bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-all">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="9">Class 9</SelectItem>
                  <SelectItem value="10">Class 10</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <TestResults 
            tests={filteredTests}
            students={students}
            getGrade={getGrade}
            handleSort={handleSort}
            isMobile={isMobile}
            onExportPDF={handleExportPDF}
            onViewHistory={handleViewHistory}
            onEditTest={handleEditTest}
            onDeleteTest={handleDeleteTest}
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/40 dark:to-gray-900/40 border-b border-slate-200/70 dark:border-slate-700/30 pb-3">
                <CardTitle className="text-lg font-medium">Grade Distribution</CardTitle>
                <CardDescription>Distribution of grades across all tests</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[250px] sm:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 40 : 60}
                      outerRadius={isMobile ? 60 : 80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => isMobile ? 
                        `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)` : 
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => [`${value} tests`, 'Count']} 
                      contentStyle={{ 
                        background: 'rgba(255, 255, 255, 0.9)', 
                        border: 'none', 
                        borderRadius: '0.375rem', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        padding: '0.5rem 0.75rem'
                      }}
                    />
                    <Legend 
                      layout={isMobile ? "horizontal" : "vertical"} 
                      verticalAlign={isMobile ? "bottom" : "middle"} 
                      align={isMobile ? "center" : "right"}
                      wrapperStyle={isMobile ? { fontSize: '10px' } : { fontSize: '12px', right: 10 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/40 dark:to-gray-900/40 border-b border-slate-200/70 dark:border-slate-700/30 pb-3">
                <CardTitle className="text-lg font-medium">Subject Performance</CardTitle>
                <CardDescription>Average scores by subject</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[250px] sm:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={subjectPerformance}
                    layout="vertical"
                    margin={{ 
                      top: 20, 
                      right: isMobile ? 20 : 40, 
                      bottom: 20, 
                      left: isMobile ? 70 : 100 
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]}
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={isMobile ? 70 : 100}
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => [`${value}%`, 'Average Score']}
                      contentStyle={{ 
                        background: 'rgba(255, 255, 255, 0.9)', 
                        border: 'none', 
                        borderRadius: '0.375rem', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        padding: '0.5rem 0.75rem'
                      }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {subjectPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

// Loading state component
function TestLoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      
      <Skeleton className="h-10 w-64" />
      
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[150px]" />
            <Skeleton className="h-10 w-[130px]" />
          </div>
        </div>
        
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  );
}
