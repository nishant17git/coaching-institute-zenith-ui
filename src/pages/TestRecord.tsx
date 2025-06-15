
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useIsMobile } from "@/hooks/use-mobile";
import { TestForm } from "@/components/tests/TestForm";
import { TestAddForm } from "@/components/tests/TestAddForm";
import { TestResultForm } from "@/components/tests/TestResultForm";
import { TestResults } from "@/components/tests/TestResults";

// Icons
import { Search, Plus, ClipboardList, BookOpen, Trophy, FileText } from "lucide-react";

import { useDebounce } from "@/hooks/useDebounce";

export default function TestRecord() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "marks">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isCreateTestDialogOpen, setIsCreateTestDialogOpen] = useState(false);
  const [isAddTestResultDialogOpen, setIsAddTestResultDialogOpen] = useState(false);
  const [isAddRecordDialogOpen, setIsAddRecordDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"tests" | "results" | "records">("records");
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Fetch students data
  const {
    data: students = [],
    isLoading: studentsLoading
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('class', { ascending: true })
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch tests data
  const {
    data: tests = [],
    isLoading: testsLoading
  } = useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('test_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch test results data
  const {
    data: testResults = [],
    isLoading: testResultsLoading
  } = useQuery({
    queryKey: ['testResults'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Create test mutation
  const createTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      console.log('Creating test with data:', testData);

      const formattedData = {
        test_name: testData.test_name,
        subject: testData.subject,
        test_date: format(testData.test_date, 'yyyy-MM-dd'),
        test_type: testData.test_type,
        total_marks: testData.total_marks,
        duration_minutes: testData.duration_minutes,
        class: testData.class,
      };

      const { data, error } = await supabase
        .from('tests')
        .insert(formattedData)
        .select()
        .single();

      if (error) {
        console.error('Test creation error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      setIsCreateTestDialogOpen(false);
      toast.success("Test created successfully", {
        description: "The test has been added to the system"
      });
    },
    onError: (error: any) => {
      console.error('Test creation error:', error);
      toast.error(`Failed to create test: ${error.message}`);
    }
  });

  // Add test result mutation
  const addTestResultMutation = useMutation({
    mutationFn: async (resultData: any) => {
      console.log('Adding test result with data:', resultData);

      const { data, error } = await supabase
        .from('test_results')
        .insert(resultData)
        .select()
        .single();

      if (error) {
        console.error('Test result creation error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testResults'] });
      setIsAddTestResultDialogOpen(false);
      toast.success("Test result added successfully", {
        description: "The test result has been recorded"
      });
    },
    onError: (error: any) => {
      console.error('Test result creation error:', error);
      toast.error(`Failed to add test result: ${error.message}`);
    }
  });

  // Add test record mutation
  const addTestRecordMutation = useMutation({
    mutationFn: async (recordData: any) => {
      console.log('Adding test record with data:', recordData);

      // First create the test result record
      const resultData = {
        student_id: recordData.student_id,
        test_id: null, // We'll create a test or use existing one
        marks_obtained: recordData.marks_obtained,
        total_marks: recordData.total_marks,
        percentage: Math.round((recordData.marks_obtained / recordData.total_marks) * 100),
      };

      const { data, error } = await supabase
        .from('test_results')
        .insert(resultData)
        .select()
        .single();

      if (error) {
        console.error('Test record creation error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testResults'] });
      setIsAddRecordDialogOpen(false);
      toast.success("Test record added successfully", {
        description: "The test record has been saved"
      });
    },
    onError: (error: any) => {
      console.error('Test record creation error:', error);
      toast.error(`Failed to add test record: ${error.message}`);
    }
  });

  // Filter and sort test results
  const filteredTestResults = testResults.filter(result => {
    const student = students.find(s => s.id === result.student_id);
    const test = tests.find(t => t.id === result.test_id);
    const searchLower = debouncedSearchQuery.toLowerCase().trim();
    
    const studentMatches = !searchLower || (
      student?.full_name?.toLowerCase().includes(searchLower) ||
      student?.class?.toString().includes(searchLower)
    );
    
    const testMatches = !searchLower || (
      test?.test_name?.toLowerCase().includes(searchLower) ||
      test?.subject?.toLowerCase().includes(searchLower)
    );

    const subjectMatches = subjectFilter === "all" || test?.subject === subjectFilter;
    const classMatches = classFilter === "all" || student?.class?.toString() === classFilter;

    return (studentMatches || testMatches) && subjectMatches && classMatches;
  }).sort((a, b) => {
    if (sortField === "date") {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortField === "marks") {
      const percentA = a.percentage || 0;
      const percentB = b.percentage || 0;
      return sortDirection === "asc" ? percentA - percentB : percentB - percentA;
    }
    return 0;
  });

  // Get grade and color for a test result
  const getGrade = (marks: number, totalMarks: number) => {
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 90) return { grade: 'A+', color: 'bg-green-500' };
    if (percentage >= 80) return { grade: 'A', color: 'bg-green-400' };
    if (percentage >= 70) return { grade: 'B+', color: 'bg-blue-500' };
    if (percentage >= 60) return { grade: 'B', color: 'bg-blue-400' };
    if (percentage >= 50) return { grade: 'C', color: 'bg-yellow-500' };
    if (percentage >= 40) return { grade: 'D', color: 'bg-orange-500' };
    return { grade: 'F', color: 'bg-red-500' };
  };

  // Handle sort toggle
  const handleSort = (field: "date" | "marks") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Placeholder functions for TestResults component
  const onExportPDF = (test: any) => {
    console.log('Export PDF for test:', test);
    toast.info("PDF export feature coming soon");
  };

  const onViewHistory = (studentId: string) => {
    console.log('View history for student:', studentId);
    toast.info("Student history feature coming soon");
  };

  const onEditTest = (test: any) => {
    console.log('Edit test:', test);
    toast.info("Edit test feature coming soon");
  };

  const onDeleteTest = (testId: string) => {
    console.log('Delete test:', testId);
    toast.info("Delete test feature coming soon");
  };

  // Get unique subjects and classes for filters
  const uniqueSubjects = [...new Set(tests.map(t => t.subject))];
  const uniqueClasses = [...new Set(students.map(s => s.class?.toString()))];

  return (
    <div className="space-y-6 animate-fade-in">
      <EnhancedPageHeader 
        title="Test Records" 
        action={
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsCreateTestDialogOpen(true)} 
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white"
            >
              <BookOpen className="h-4 w-4 mr-2" /> Add Test
            </Button>
            <Button 
              onClick={() => setIsAddTestResultDialogOpen(true)} 
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white"
            >
              <Trophy className="h-4 w-4 mr-2" /> Add Result
            </Button>
            <Button 
              onClick={() => setIsAddRecordDialogOpen(true)} 
              className="bg-black hover:bg-black/80"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Record
            </Button>
          </div>
        } 
      />

      {/* Filters and Search */}
      <div className="bg-background/60 backdrop-blur-sm p-5 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search students, tests, subjects..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-10 h-11 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:scale-[1.01]" 
            />
          </div>

          <div className="flex flex-row gap-3 w-full sm:w-auto">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {uniqueSubjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map(cls => (
                  <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="records" value={activeTab} onValueChange={value => setActiveTab(value as "tests" | "results" | "records")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="records">Test Records</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* Test Records Tab */}
        <TabsContent value="records" className="mt-4">
          {testResultsLoading || studentsLoading || testsLoading ? (
            <LoadingState />
          ) : (
            <TestResults
              tests={filteredTestResults}
              students={students}
              getGrade={getGrade}
              handleSort={handleSort}
              isMobile={isMobile}
              onExportPDF={onExportPDF}
              onViewHistory={onViewHistory}
              onEditTest={onEditTest}
              onDeleteTest={onDeleteTest}
            />
          )}
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests" className="mt-4">
          <Card className="shadow-sm border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Available Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testsLoading ? (
                <LoadingState />
              ) : tests.length === 0 ? (
                <EmptyState 
                  icon={<BookOpen className="h-10 w-10 text-muted-foreground" />} 
                  title="No tests found" 
                  description="No tests have been created yet." 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tests.map(test => (
                    <Card key={test.id} className="border">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{test.test_name}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p><span className="font-medium">Subject:</span> {test.subject}</p>
                          <p><span className="font-medium">Class:</span> {test.class}</p>
                          <p><span className="font-medium">Date:</span> {format(new Date(test.test_date), 'dd MMM yyyy')}</p>
                          <p><span className="font-medium">Total Marks:</span> {test.total_marks}</p>
                          <p><span className="font-medium">Duration:</span> {test.duration_minutes} min</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="mt-4">
          <Card className="shadow-sm border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResultsLoading ? (
                <LoadingState />
              ) : testResults.length === 0 ? (
                <EmptyState 
                  icon={<Trophy className="h-10 w-10 text-muted-foreground" />} 
                  title="No results found" 
                  description="No test results have been recorded yet." 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {testResults.map(result => {
                    const student = students.find(s => s.id === result.student_id);
                    const test = tests.find(t => t.id === result.test_id);
                    const { grade, color } = getGrade(result.marks_obtained, result.total_marks);
                    
                    return (
                      <Card key={result.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{student?.full_name}</h3>
                            <span className={`${color} text-white px-2 py-1 rounded text-sm font-medium`}>
                              {grade}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p><span className="font-medium">Test:</span> {test?.test_name || 'N/A'}</p>
                            <p><span className="font-medium">Subject:</span> {test?.subject || 'N/A'}</p>
                            <p><span className="font-medium">Score:</span> {result.marks_obtained}/{result.total_marks}</p>
                            <p><span className="font-medium">Percentage:</span> {result.percentage}%</p>
                            <p><span className="font-medium">Date:</span> {format(new Date(result.created_at), 'dd MMM yyyy')}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Test Dialog */}
      <Dialog open={isCreateTestDialogOpen} onOpenChange={setIsCreateTestDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Test</DialogTitle>
            <DialogDescription>
              Add a new test to the system with all necessary details.
            </DialogDescription>
          </DialogHeader>
          <TestForm onSubmit={createTestMutation.mutateAsync} />
        </DialogContent>
      </Dialog>

      {/* Add Test Result Dialog */}
      <Dialog open={isAddTestResultDialogOpen} onOpenChange={setIsAddTestResultDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Test Result</DialogTitle>
            <DialogDescription>
              Record a test result for a student.
            </DialogDescription>
          </DialogHeader>
          <TestResultForm 
            onSubmit={addTestResultMutation.mutateAsync}
            students={students}
            tests={tests}
          />
        </DialogContent>
      </Dialog>

      {/* Add Test Record Dialog */}
      <Dialog open={isAddRecordDialogOpen} onOpenChange={setIsAddRecordDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Test Record</DialogTitle>
            <DialogDescription>
              Add a new test record for a student.
            </DialogDescription>
          </DialogHeader>
          <TestAddForm 
            onSubmit={addTestRecordMutation.mutateAsync}
            students={students}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
