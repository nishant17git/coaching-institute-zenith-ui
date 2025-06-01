import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { motion } from "framer-motion";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { TestAddForm } from "@/components/tests/TestAddForm";
import { TestResults } from "@/components/tests/TestResults";
import { useIsMobile } from "@/hooks/use-mobile";

// Icons
import { Search, Plus, FileText, TrendingUp, Users, Award, BookOpen } from "lucide-react";

export default function TestRecord() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [isAddTestDialogOpen, setIsAddTestDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Fetch tests data from Supabase
  const {
    data: tests = [],
    isLoading: testsLoading,
    refetch: refetchTests
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
        .select(`
          *,
          tests (
            test_name,
            subject,
            test_date,
            class
          ),
          students (
            full_name,
            class
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch students for the form
  const {
    data: students = [],
    isLoading: studentsLoading
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate statistics
  const totalTests = tests.length;
  const totalStudents = students.length;
  const averageScore = testResults.length > 0 
    ? Math.round(testResults.reduce((sum, result) => sum + (result.percentage || 0), 0) / testResults.length)
    : 0;
  const subjects = [...new Set(tests.map(test => test.subject))];

  // Filter tests
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.test_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === "all" || test.subject === subjectFilter;
    const matchesClass = classFilter === "all" || test.class.toString() === classFilter;
    
    return matchesSearch && matchesSubject && matchesClass;
  });

  // Helper function to get grade with color
  const getGradeWithColor = (marks: number, totalMarks: number) => {
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 90) return { grade: "A+", color: "text-green-600" };
    if (percentage >= 80) return { grade: "A", color: "text-green-500" };
    if (percentage >= 70) return { grade: "B", color: "text-blue-500" };
    if (percentage >= 60) return { grade: "C", color: "text-yellow-500" };
    return { grade: "D", color: "text-red-500" };
  };

  const handleAddTest = () => {
    refetchTests();
    setIsAddTestDialogOpen(false);
  };

  const isLoading = testsLoading || resultsLoading || studentsLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      <EnhancedPageHeader 
        title="Test Records" 
        action={
          <Button 
            onClick={() => setIsAddTestDialogOpen(true)} 
            className="bg-black hover:bg-black/80"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Test
          </Button>
        } 
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b-4 border-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400">
              <FileText className="h-4 w-4" /> Total Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Conducted</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 border-b-4 border-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <TrendingUp className="h-4 w-4" /> Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <div className="text-xs sm:text-sm text-muted-foreground">All tests</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-b-4 border-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
              <Users className="h-4 w-4" /> Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Participating</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b-4 border-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
              <BookOpen className="h-4 w-4" /> Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Different</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-background/60 backdrop-blur-sm p-5 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tests..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-10 h-11 text-base" 
            />
          </div>

          <div className="flex flex-row gap-3 w-full sm:w-auto">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
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
                {[...new Set(tests.map(test => test.class))].sort().map(classNum => (
                  <SelectItem key={classNum} value={classNum.toString()}>Class {classNum}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tests List */}
      <Card className="shadow-sm border-muted">
        <CardContent className="p-4">
          {isLoading ? (
            <LoadingState />
          ) : filteredTests.length === 0 ? (
            <EmptyState 
              icon={<FileText className="h-10 w-10 text-muted-foreground" />} 
              title="No tests found" 
              description="No tests match your current filters. Try adjusting your search criteria." 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTests.map(test => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-sm font-medium">
                        <div>
                          <span className="text-base block">{test.test_name}</span>
                          <span className="text-xs text-muted-foreground">Class {test.class} • {test.subject}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(test.test_date), 'MMM dd')}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Marks:</span>
                          <span className="font-medium">{test.total_marks}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{test.duration_minutes || 'N/A'} min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Results:</span>
                          <span className="font-medium">
                            {testResults.filter(r => r.tests?.test_name === test.test_name).length} submitted
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results Component */}
      <TestResults 
        tests={tests}
        students={students}
        testResults={testResults}
        getGrade={getGradeWithColor}
        handleSort={() => {}}
        sortBy="percentage"
        sortOrder="desc"
        onAddResult={() => {}}
      />

      {/* Add Test Dialog */}
      <Dialog open={isAddTestDialogOpen} onOpenChange={setIsAddTestDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Test</DialogTitle>
            <DialogDescription>
              Create a new test record for your students.
            </DialogDescription>
          </DialogHeader>
          <TestAddForm 
            onSubmit={handleAddTest}
            students={students}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
