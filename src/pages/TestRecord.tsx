import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ArrowUpDown, Plus, LibraryBig, Loader2, FileText, ArrowLeft, History, Trophy, BarChart3, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { exportTestToPDF } from "@/services/pdfService";
import { Skeleton } from "@/components/ui/skeleton";
import { TestAddForm } from "@/components/tests/TestAddForm";
import { TestResults } from "@/components/tests/TestResults";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StudentRecord, TestRecordDb } from "@/types";
import { GradeDistributionChart } from "@/components/charts/GradeDistributionChart";
import { SubjectPerformanceChart } from "@/components/charts/SubjectPerformanceChart";
import { TestDetailsView } from "@/components/tests/TestDetailsView";
import { PerformanceInsights } from "@/components/tests/PerformanceInsights";
import { TooltipProvider } from "@/components/ui/tooltip";

// Helper function to safely format dates
const formatSafeDate = (dateValue: string | null | undefined, formatString: string = 'dd MMM yyyy'): string => {
  if (!dateValue) return 'N/A';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};
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
  const queryClient = useQueryClient();

  // Fetch test records from Supabase using correct table name
  const {
    data: testRecords = [],
    isLoading: testsLoading,
    refetch: refetchTests
  } = useQuery({
    queryKey: ['test_results'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('test_results').select('*').order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching test results:', error);
        throw error;
      }
      return data || [];
    }
  });

  // Fetch students from Supabase (filter for Class 9 and 10 only)
  const {
    data: students = [],
    isLoading: studentsLoading
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('students').select('*').in('class', [9, 10]) // Only fetch Class 9 and 10 students
      .order('full_name', {
        ascending: true
      });
      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }
      return data || [];
    }
  });

  // Mutation for adding test records
  const addTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      console.log('Adding test with data:', testData);

      // First, create the test in the tests table
      const {
        data: testRecord,
        error: testError
      } = await supabase.from('tests').insert([{
        test_name: testData.test_name,
        subject: testData.subject,
        test_date: testData.test_date,
        test_type: testData.test_type,
        total_marks: testData.total_marks,
        class: testData.class
      }]).select().single();
      if (testError) {
        console.error('Error creating test:', testError);
        throw testError;
      }

      // Then, create the test result in the test_results table
      const {
        data: resultRecord,
        error: resultError
      } = await supabase.from('test_results').insert([{
        student_id: testData.student_id,
        test_id: testRecord.id,
        marks_obtained: testData.marks_obtained,
        total_marks: testData.total_marks,
        percentage: testData.marks_obtained && testData.total_marks ? Math.round(testData.marks_obtained / testData.total_marks * 100) : null,
        grade: null,
        rank: null,
        absent: false,
        remarks: null
      }]).select().single();
      if (resultError) {
        console.error('Error adding test result:', resultError);
        throw resultError;
      }
      return resultRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['test_results']
      });
      setIsAddTestOpen(false);
      toast.success("Test result added successfully");
    },
    onError: error => {
      console.error('Error adding test:', error);
      toast.error("Failed to add test result");
    }
  });

  // Mutation for updating test records
  const updateTestMutation = useMutation({
    mutationFn: async ({
      id,
      ...testData
    }: any) => {
      console.log('Updating test with data:', testData);
      const {
        data,
        error
      } = await supabase.from('test_results').update({
        marks_obtained: testData.marks_obtained,
        total_marks: testData.total_marks,
        percentage: testData.marks_obtained && testData.total_marks ? Math.round(testData.marks_obtained / testData.total_marks * 100) : null,
        remarks: testData.remarks || null
      }).eq('id', id).select().single();
      if (error) {
        console.error('Error updating test result:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['test_results']
      });
      setIsEditTestOpen(false);
      setEditingTest(null);
      toast.success("Test result updated successfully");
    },
    onError: error => {
      console.error('Error updating test:', error);
      toast.error("Failed to update test result");
    }
  });

  // Mutation for deleting test records
  const deleteTestMutation = useMutation({
    mutationFn: async (testId: string) => {
      const {
        error
      } = await supabase.from('test_results').delete().eq('id', testId);
      if (error) {
        console.error('Error deleting test result:', error);
        throw error;
      }
      return testId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['test_results']
      });
      toast.success("Test result deleted successfully");
    },
    onError: error => {
      console.error('Error deleting test:', error);
      toast.error("Failed to delete test result");
    }
  });

  // Generate statistics for Class 9 and 10 only
  const subjects = ['Mathematics', 'Science', 'Social Science', 'Hindi', 'English'];

  // Filter test records to only include Class 9 and 10 students
  const filteredTestRecords = testRecords.filter(record => {
    const student = students.find(s => s.id === record.student_id);
    return student && (student.class === 9 || student.class === 10);
  });
  const totalTests = filteredTestRecords.length;
  const averageScore = filteredTestRecords.length > 0 ? Math.round(filteredTestRecords.reduce((acc: number, record: TestRecordDb) => acc + (record.percentage || 0), 0) / filteredTestRecords.length) : 0;

  // Grade distribution with vibrant colors (Class 9 and 10 only)
  const gradeDistribution = [{
    name: 'A (90-100%)',
    value: 0,
    color: '#22c55e'
  }, {
    name: 'B (75-89%)',
    value: 0,
    color: '#0EA5E9'
  }, {
    name: 'C (60-74%)',
    value: 0,
    color: '#EAB308'
  }, {
    name: 'D (40-59%)',
    value: 0,
    color: '#F97316'
  }, {
    name: 'F (0-39%)',
    value: 0,
    color: '#EF4444'
  }];
  filteredTestRecords.forEach((record: TestRecordDb) => {
    const percent = record.percentage || 0;
    if (percent >= 90) gradeDistribution[0].value++;else if (percent >= 75) gradeDistribution[1].value++;else if (percent >= 60) gradeDistribution[2].value++;else if (percent >= 40) gradeDistribution[3].value++;else gradeDistribution[4].value++;
  });

  // Subject performance with vibrant colors (Class 9 and 10 only)
  const subjectPerformance = subjects.map((subject, index) => {
    const subjectTests = filteredTestRecords; // For now, showing all tests since we don't have subject filtering
    const averagePercent = subjectTests.length > 0 ? Math.round(subjectTests.reduce((acc: number, record: TestRecordDb) => acc + (record.percentage || 0), 0) / subjectTests.length) : 0;
    const vibrantColors = ['#0EA5E9', '#8B5CF6', '#F97316', '#22C55E', '#F43F5E'];
    return {
      name: subject,
      score: averagePercent,
      fill: vibrantColors[index % vibrantColors.length]
    };
  });

  // Handle new test creation
  const handleAddTest = async (testData: any): Promise<void> => {
    console.log('Handling add test:', testData);
    await addTestMutation.mutateAsync(testData);
  };

  // Handle test update
  const handleUpdateTest = async (testData: any): Promise<void> => {
    if (!editingTest) return;
    console.log('Handling update test:', testData);
    await updateTestMutation.mutateAsync({
      id: editingTest.id,
      ...testData
    });
  };

  // Handle test deletion
  const handleDeleteTest = async (testId: string) => {
    return deleteTestMutation.mutateAsync(testId);
  };

  // Handle editing a test
  const handleEditTest = (test: TestRecordDb) => {
    setEditingTest(test);
    setIsEditTestOpen(true);
  };

  // Filter and sort test records with safe date handling (Class 9 and 10 only)
  const filteredTests = filteredTestRecords.filter((test: TestRecordDb) => {
    const student = students.find(s => s.id === test.student_id);
    const searchLower = searchQuery.toLowerCase();
    const studentName = student && student.full_name && typeof student.full_name === 'string' ? student.full_name.toLowerCase() : '';
    const studentMatches = studentName.includes(searchLower);
    const subjectMatches = true; // Since we don't have subject in test_results
    const classMatches = classFilter === "all" || student && student.class !== undefined && student.class.toString() === classFilter;
    return studentMatches && subjectMatches && classMatches;
  }).sort((a: TestRecordDb, b: TestRecordDb) => {
    if (sortField === "date") {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      const percentA = a.percentage || 0;
      const percentB = b.percentage || 0;
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
    const percent = marks / totalMarks * 100;
    if (percent >= 90) return {
      grade: 'A',
      color: 'bg-emerald-500'
    };
    if (percent >= 75) return {
      grade: 'B',
      color: 'bg-blue-500'
    };
    if (percent >= 60) return {
      grade: 'C',
      color: 'bg-yellow-500'
    };
    if (percent >= 40) return {
      grade: 'D',
      color: 'bg-orange-500'
    };
    return {
      grade: 'F',
      color: 'bg-red-500'
    };
  };

  // Handle PDF export for a single test
  const handleExportPDF = (test: TestRecordDb) => {
    const student = students.find(s => s.id === test.student_id);
    if (student) {
      exportTestToPDF({
        test,
        student,
        title: "Test Result Report",
        subtitle: `Test Result - ${formatSafeDate(test.created_at)}`
      });
      toast.success("PDF generated successfully");
    } else {
      toast.error("Could not find student information");
    }
  };

  // Get test history for a student
  const getStudentTestHistory = (studentId: string) => {
    return testRecords.filter((test: TestRecordDb) => test.student_id === studentId);
  };

  // Handle exporting all test results for a student
  const handleExportStudentHistory = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const studentTests = getStudentTestHistory(studentId);
    if (student && studentTests.length > 0) {
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
      student_id: test.student_id,
      subject: 'Mathematics',
      // Default since we don't have subject in test_results
      test_name: 'Test',
      test_date: test.created_at ? new Date(test.created_at) : new Date(),
      test_type: "MCQs Test (Standard)",
      marks_obtained: test.marks_obtained,
      total_marks: test.total_marks
    };
  };

  // Loading state
  if (testsLoading || studentsLoading) {
    return <TestLoadingState />;
  }
  return <TooltipProvider>
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.3
    }} className="space-y-4 sm:space-y-6 p-4 sm:p-6 px-0 py-0">
        <PageHeader title="Tests" showBackButton={true} onBack={() => navigate(-1)} action={<Dialog open={isAddTestOpen} onOpenChange={setIsAddTestOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg">
                  <Plus className="h-4 w-4" /> Add Test
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[95vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Add New Test Record</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new test record below.
                  </DialogDescription>
                </DialogHeader>
                <TestAddForm onSubmit={handleAddTest} students={students} />
              </DialogContent>
            </Dialog>} />
        
        {/* Edit Test Dialog */}
        <Dialog open={isEditTestOpen} onOpenChange={open => {
        setIsEditTestOpen(open);
        if (!open) setEditingTest(null);
      }}>
          <DialogContent className="sm:max-w-[500px] max-h-[95vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit Test Record</DialogTitle>
              <DialogDescription>
                Update the details of this test record.
              </DialogDescription>
            </DialogHeader>
            {editingTest && <TestAddForm onSubmit={handleUpdateTest} students={students} initialData={convertTestToFormValues(editingTest)} isEditing={true} />}
          </DialogContent>
        </Dialog>
        
        {/* Student History Dialog */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>
                Test History
                {selectedStudentId && <span className="ml-2 text-muted-foreground font-normal">
                    {students.find(s => s.id === selectedStudentId)?.full_name || "Unknown Student"}
                  </span>}
              </DialogTitle>
              <DialogDescription>
                View all test records for this student
              </DialogDescription>
            </DialogHeader>
            
            {selectedStudentId && <>
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getStudentTestHistory(selectedStudentId).map((test: TestRecordDb) => {
                    const {
                      grade,
                      color
                    } = getGrade(test.marks_obtained, test.total_marks);
                    const percent = test.percentage || Math.round(test.marks_obtained / test.total_marks * 100);
                    return <TableRow key={test.id}>
                            <TableCell>{test.test_id}</TableCell>
                            <TableCell>{formatSafeDate(test.created_at)}</TableCell>
                            <TableCell>
                              {test.marks_obtained}/{test.total_marks} ({percent}%)
                            </TableCell>
                            <TableCell>
                              <Badge className={color}>{grade}</Badge>
                            </TableCell>
                          </TableRow>;
                  })}
                    </TableBody>
                  </Table>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsHistoryDialogOpen(false)}>
                    Close
                  </Button>
                  <Button className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" onClick={() => handleExportStudentHistory(selectedStudentId)}>
                    <FileText className="h-4 w-4" /> Export All Tests
                  </Button>
                </DialogFooter>
              </>}
          </DialogContent>
        </Dialog>
        
        {/* Stacked Layout for Stats Cards */}
        <div className="space-y-3 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:space-y-0">
          <StatCard title="Total Tests" value={totalTests} description="Class 9 & 10 only" icon={<FileText className="h-5 w-5" />} />
          
          <StatCard title="Average Score" value={`${averageScore}%`} description="Overall performance" icon={<Trophy className="h-5 w-5" />} />
          
          <StatCard title="Subjects" value={subjects.length} description="Different subjects" icon={<LibraryBig className="h-5 w-5" />} />

          <StatCard title="Pass Rate" value={`${Math.round(filteredTestRecords.filter(test => (test.percentage || 0) >= 40).length / Math.max(filteredTestRecords.length, 1) * 100)}%`} description="Students scoring 40%+" icon={<BarChart3 className="h-5 w-5" />} />
        </div>
        
        <Tabs defaultValue="records" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-4 rounded-lg bg-muted/50 p-1 h-auto">
            <TabsTrigger value="records" className="font-medium rounded-md">Records</TabsTrigger>
            <TabsTrigger value="details" className="font-medium rounded-md">Details</TabsTrigger>
            <TabsTrigger value="performance" className="font-medium rounded-md">Performance</TabsTrigger>
            <TabsTrigger value="analytics" className="font-medium rounded-md">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="records" className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search student name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-background/50 backdrop-blur-sm transition-all focus:bg-background" />
              </div>
              
              <div className="flex gap-2">
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-full sm:w-[130px] bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-all">
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
            
            <TestResults tests={filteredTests} students={students} getGrade={getGrade} handleSort={handleSort} isMobile={isMobile} onExportPDF={handleExportPDF} onViewHistory={handleViewHistory} onEditTest={handleEditTest} onDeleteTest={handleDeleteTest} />
          </TabsContent>

          <TabsContent value="details" className="animate-fade-in">
            <TestDetailsView testRecords={filteredTestRecords} students={students} onExportPDF={handleExportPDF} />
          </TabsContent>

          <TabsContent value="performance" className="animate-fade-in">
            <PerformanceInsights testRecords={filteredTestRecords} students={students} />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <GradeDistributionChart data={gradeDistribution} />
              <SubjectPerformanceChart data={subjectPerformance} />
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </TooltipProvider>;
}

// Loading state component
function TestLoadingState() {
  return <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 sm:h-10 w-32 sm:w-48" />
        <Skeleton className="h-8 sm:h-10 w-24 sm:w-32" />
      </div>
      
      <div className="space-y-3 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:space-y-0">
        <Skeleton className="h-24 sm:h-32" />
        <Skeleton className="h-24 sm:h-32" />
        <Skeleton className="h-24 sm:h-32" />
        <Skeleton className="h-24 sm:h-32" />
      </div>
      
      <Skeleton className="h-8 sm:h-10 w-48 sm:w-64" />
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Skeleton className="h-8 sm:h-10 flex-1" />
          <div className="flex gap-2">
            <Skeleton className="h-8 sm:h-10 w-full sm:w-[150px]" />
            <Skeleton className="h-8 sm:h-10 w-full sm:w-[130px]" />
          </div>
        </div>
        
        <Skeleton className="h-64 sm:h-[400px]" />
      </div>
    </div>;
}
