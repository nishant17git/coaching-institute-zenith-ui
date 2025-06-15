import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useIsMobile } from "@/hooks/use-mobile";
import { TestAddForm } from "@/components/tests/TestAddForm";
import { TestResultForm } from "@/components/tests/TestResultForm";
import { TestCard } from "@/components/tests/TestCard";
import { TestResultCard } from "@/components/tests/TestResultCard";

// Icons
import { Search, Download, Plus, BookOpen, ClipboardList, Award } from "lucide-react";

import { useDebounce } from "@/hooks/useDebounce";

export default function TestRecord() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "score" | "name">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isAddTestDialogOpen, setIsAddTestDialogOpen] = useState(false);
  const [isAddResultDialogOpen, setIsAddResultDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"tests" | "results">("tests");
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
    isLoading: resultsLoading
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

  // Add test mutation
  const addTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      const { data, error } = await supabase
        .from('tests')
        .insert({
          test_name: testData.test_name,
          subject: testData.subject,
          class: testData.class,
          test_date: testData.test_date,
          test_type: testData.test_type,
          total_marks: testData.total_marks
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      setIsAddTestDialogOpen(false);
      toast.success("Test added successfully", {
        description: "The test has been created",
        action: {
          label: "View",
          onClick: () => setActiveTab("tests")
        }
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to add test: ${error.message}`);
    }
  });

  // Add test result mutation
  const addTestResultMutation = useMutation({
    mutationFn: async (resultData: any) => {
      const { data, error } = await supabase
        .from('test_results')
        .insert({
          student_id: resultData.student_id,
          test_id: resultData.test_id,
          marks_obtained: resultData.marks_obtained,
          total_marks: resultData.total_marks,
          percentage: resultData.percentage
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testResults'] });
      setIsAddResultDialogOpen(false);
      toast.success("Test result added successfully", {
        description: "The test result has been recorded",
        action: {
          label: "View",
          onClick: () => setActiveTab("results")
        }
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to add test result: ${error.message}`);
    }
  });

  // Update test mutation
  const updateTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      const { data, error } = await supabase
        .from('tests')
        .update({
          test_name: testData.test_name,
          subject: testData.subject,
          class: testData.class,
          test_date: testData.test_date,
          test_type: testData.test_type,
          total_marks: testData.total_marks
        })
        .eq('id', selectedTest.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      setIsAddTestDialogOpen(false);
      setSelectedTest(null);
      toast.success("Test updated successfully", {
        description: "The test has been updated",
        action: {
          label: "View",
          onClick: () => setActiveTab("tests")
        }
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to update test: ${error.message}`);
    }
  });

  // Update test result mutation
  const updateTestResultMutation = useMutation({
    mutationFn: async (resultData: any) => {
      const { data, error } = await supabase
        .from('test_results')
        .update({
          student_id: resultData.student_id,
          test_id: resultData.test_id,
          marks_obtained: resultData.marks_obtained,
          total_marks: resultData.total_marks,
          percentage: resultData.percentage
        })
        .eq('id', selectedResult.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testResults'] });
      setIsAddResultDialogOpen(false);
      setSelectedResult(null);
      toast.success("Test result updated successfully", {
        description: "The test result has been updated",
        action: {
          label: "View",
          onClick: () => setActiveTab("results")
        }
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to update test result: ${error.message}`);
    }
  });

  // Delete test mutation
  const deleteTestMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTest) throw new Error("No test selected");

      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', selectedTest.id);

      if (error) throw error;
      return selectedTest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.invalidateQueries({ queryKey: ['testResults'] });
      setIsAddTestDialogOpen(false);
      setSelectedTest(null);
      toast.success("Test deleted successfully", {
        description: "The test and associated results have been removed"
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete test: ${error.message}`);
    }
  });

  // Delete test result mutation
  const deleteTestResultMutation = useMutation({
    mutationFn: async () => {
      if (!selectedResult) throw new Error("No test result selected");

      const { error } = await supabase
        .from('test_results')
        .delete()
        .eq('id', selectedResult.id);

      if (error) throw error;
      return selectedResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testResults'] });
      setIsAddResultDialogOpen(false);
      setSelectedResult(null);
      toast.success("Test result deleted successfully", {
        description: "The test result has been removed"
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete test result: ${error.message}`);
    }
  });

  // Filter tests based on search and filters
  const filteredTests = tests.filter(test => {
    const searchLower = debouncedSearchQuery.toLowerCase().trim();
    
    // Search matching
    const nameMatches = !searchLower || test.test_name?.toLowerCase().includes(searchLower);
    const subjectMatches = !searchLower || test.subject?.toLowerCase().includes(searchLower);
    const classMatches = !searchLower || test.class?.toString().includes(searchLower);
    
    // Filter matching
    const subjectFilterMatches = subjectFilter === "all" || test.subject === subjectFilter;
    const classFilterMatches = classFilter === "all" || test.class?.toString() === classFilter;

    return (nameMatches || subjectMatches || classMatches) && subjectFilterMatches && classFilterMatches;
  }).sort((a, b) => {
    // Handle sorting
    if (sortField === "date") {
      const dateA = new Date(a.test_date).getTime();
      const dateB = new Date(b.test_date).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortField === "name") {
      return sortDirection === "asc" 
        ? a.test_name.localeCompare(b.test_name) 
        : b.test_name.localeCompare(a.test_name);
    }
    return 0;
  });

  // Filter test results based on search and filters
  const filteredResults = testResults.filter(result => {
    const student = students.find(s => s.id === result.student_id);
    const test = tests.find(t => t.id === result.test_id);
    const searchLower = debouncedSearchQuery.toLowerCase().trim();
    
    // Search matching
    const studentMatches = !searchLower || student?.full_name?.toLowerCase().includes(searchLower);
    const testMatches = !searchLower || test?.test_name?.toLowerCase().includes(searchLower);
    const subjectMatches = !searchLower || test?.subject?.toLowerCase().includes(searchLower);
    const scoreMatches = !searchLower || result.marks_obtained?.toString().includes(searchLower);
    
    // Filter matching
    const subjectFilterMatches = subjectFilter === "all" || test?.subject === subjectFilter;
    const classFilterMatches = classFilter === "all" || student?.class?.toString() === classFilter;

    return (studentMatches || testMatches || subjectMatches || scoreMatches) && 
           subjectFilterMatches && classFilterMatches;
  }).sort((a, b) => {
    // Handle sorting
    if (sortField === "date") {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortField === "score") {
      const scoreA = a.percentage || 0;
      const scoreB = b.percentage || 0;
      return sortDirection === "asc" ? scoreA - scoreB : scoreB - scoreA;
    } else if (sortField === "name") {
      const studentA = students.find(s => s.id === a.student_id)?.full_name || "";
      const studentB = students.find(s => s.id === b.student_id)?.full_name || "";
      return sortDirection === "asc" ? studentA.localeCompare(studentB) : studentB.localeCompare(studentA);
    }
    return 0;
  });

  // Toggle sort direction
  const handleSort = (field: "date" | "score" | "name") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Export test data as CSV
  const exportTestData = () => {
    try {
      // Create CSV content
      let csvContent = "Test Name,Subject,Class,Date,Type,Total Marks\n";
      tests.forEach(test => {
        const row = [
          test.test_name,
          test.subject,
          `Class ${test.class}`,
          new Date(test.test_date).toLocaleDateString(),
          test.test_type || "Standard",
          test.total_marks
        ].map(item => `"${item}"`).join(",");
        csvContent += row + "\n";
      });

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `tests_${format(new Date(), 'yyyyMMdd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Test data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export test data");
    }
  };

  // Export test results data as CSV
  const exportResultsData = () => {
    try {
      // Create CSV content
      let csvContent = "Student,Class,Test,Subject,Marks Obtained,Total Marks,Percentage\n";
      testResults.forEach(result => {
        const student = students.find(s => s.id === result.student_id);
        const test = tests.find(t => t.id === result.test_id);
        if (student && test) {
          const row = [
            student.full_name,
            `Class ${student.class}`,
            test.test_name,
            test.subject,
            result.marks_obtained,
            result.total_marks,
            `${result.percentage}%`
          ].map(item => `"${item}"`).join(",");
          csvContent += row + "\n";
        }
      });

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `test_results_${format(new Date(), 'yyyyMMdd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Test results data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export test results data");
    }
  };

  const handleEditTest = (test: any) => {
    setSelectedTest(test);
    setIsAddTestDialogOpen(true);
  };

  const handleEditResult = (result: any) => {
    setSelectedResult(result);
    setIsAddResultDialogOpen(true);
  };

  // Handle test form submission
  const handleTestFormSubmit = async (data: any) => {
    if (selectedTest) {
      return updateTestMutation.mutate({
        ...data,
        id: selectedTest.id
      });
    } else {
      return addTestMutation.mutate(data);
    }
  };

  // Handle test result form submission
  const handleResultFormSubmit = async (data: any) => {
    if (selectedResult) {
      return updateTestResultMutation.mutate({
        ...data,
        id: selectedResult.id
      });
    } else {
      return addTestResultMutation.mutate(data);
    }
  };

  const handleDeleteTest = () => {
    return deleteTestMutation.mutate();
  };

  const handleDeleteResult = () => {
    return deleteTestResultMutation.mutate();
  };

  // Get unique subjects for filter
  const uniqueSubjects = Array.from(new Set(tests.map(test => test.subject))).filter(Boolean);
  
  // Get unique classes for filter
  const uniqueClasses = Array.from(new Set(students.map(student => student.class))).filter(Boolean);

  // Determine if there are pending operations
  const isPending = 
    addTestMutation.isPending || 
    updateTestMutation.isPending || 
    deleteTestMutation.isPending ||
    addTestResultMutation.isPending ||
    updateTestResultMutation.isPending ||
    deleteTestResultMutation.isPending;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Test Records" 
        description="Manage tests and student results"
        action={
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setSelectedTest(null);
                setIsAddTestDialogOpen(true);
              }} 
              variant="outline"
              className="gap-1"
            >
              <BookOpen className="h-4 w-4" /> Add Test
            </Button>
            <Button 
              onClick={() => {
                setSelectedResult(null);
                setIsAddResultDialogOpen(true);
              }} 
              className="bg-black hover:bg-black/80 gap-1"
            >
              <Award className="h-4 w-4" /> Add Result
            </Button>
          </div>
        } 
      />

      {/* Enhanced Filters and Search */}
      <div className="bg-background/60 backdrop-blur-sm p-5 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tests, subjects, students..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-10 h-11 text-base transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:scale-[1.01]" 
            />
            {debouncedSearchQuery && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                {activeTab === "tests" ? filteredTests.length : filteredResults.length} found
              </div>
            )}
          </div>

          <div className="flex flex-row gap-3 w-full sm:w-auto">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
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
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map(classNum => (
                  <SelectItem key={classNum} value={classNum.toString()}>Class {classNum}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs for Tests and Results */}
      <Tabs defaultValue="tests" value={activeTab} onValueChange={value => setActiveTab(value as "tests" | "results")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        {/* Tests Tab */}
        <TabsContent value="tests" className="mt-4">
          <Card className="shadow-sm border-muted">
            <CardContent className="p-4">
              {testsLoading ? (
                <LoadingState />
              ) : filteredTests.length === 0 ? (
                <EmptyState 
                  icon={<BookOpen className="h-10 w-10 text-muted-foreground" />} 
                  title="No tests found" 
                  description="No tests match your current filters." 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTests.map(test => (
                    <TestCard
                      key={test.id}
                      test={test}
                      onEdit={() => handleEditTest(test)}
                    />
                  ))}
                </div>
              )}

              {filteredTests.length > 0 && (
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={exportTestData} className="gap-2">
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="results" className="mt-4">
          <Card className="shadow-sm border-muted">
            <CardContent className="p-4">
              {resultsLoading || testsLoading || studentsLoading ? (
                <LoadingState />
              ) : filteredResults.length === 0 ? (
                <EmptyState 
                  icon={<ClipboardList className="h-10 w-10 text-muted-foreground" />} 
                  title="No test results found" 
                  description="No test results match your current filters." 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResults.map(result => (
                    <TestResultCard
                      key={result.id}
                      result={result}
                      student={students.find(s => s.id === result.student_id)}
                      test={tests.find(t => t.id === result.test_id)}
                      onEdit={() => handleEditResult(result)}
                    />
                  ))}
                </div>
              )}

              {filteredResults.length > 0 && (
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={exportResultsData} className="gap-2">
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Test Dialog */}
      <Dialog 
        open={isAddTestDialogOpen} 
        onOpenChange={open => {
          if (!isPending) {
            setIsAddTestDialogOpen(open);
            if (!open) {
              setSelectedTest(null);
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedTest ? "Edit Test" : "Add Test"}</DialogTitle>
            <DialogDescription>
              {selectedTest ? "Update an existing test." : "Create a new test for students."}
            </DialogDescription>
          </DialogHeader>
          <TestAddForm 
            onSubmit={handleTestFormSubmit} 
            students={students}
            initialData={selectedTest} 
            isEditing={!!selectedTest} 
          />
        </DialogContent>
      </Dialog>

      {/* Add/Edit Test Result Dialog */}
      <Dialog 
        open={isAddResultDialogOpen} 
        onOpenChange={open => {
          if (!isPending) {
            setIsAddResultDialogOpen(open);
            if (!open) {
              setSelectedResult(null);
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedResult ? "Edit Test Result" : "Add Test Result"}</DialogTitle>
            <DialogDescription>
              {selectedResult ? "Update an existing test result." : "Record a new test result for a student."}
            </DialogDescription>
          </DialogHeader>
          <TestResultForm 
            onSubmit={handleResultFormSubmit} 
            students={students}
            tests={tests}
            initialData={selectedResult} 
            isEditing={!!selectedResult} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
