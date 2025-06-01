
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { testService } from "@/services/testService";
import { studentService } from "@/services/studentService";
import { TestRecordDb } from "@/types";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

// Icons
import { Search, Plus, FileText, Edit, Trash2 } from "lucide-react";

export default function TestRecord() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [isAddTestDialogOpen, setIsAddTestDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestRecordDb | null>(null);
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    student_id: "",
    subject: "",
    test_date: "",
    test_name: "",
    marks: "",
    total_marks: "100",
    test_type: "Chapter-wise Test"
  });

  // Fetch test records
  const {
    data: testRecords = [],
    isLoading: isLoadingTests
  } = useQuery({
    queryKey: ['testRecords'],
    queryFn: testService.getTestRecords
  });

  // Fetch students
  const {
    data: students = [],
    isLoading: isLoadingStudents
  } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents
  });

  // Add test mutation
  const addTestMutation = useMutation({
    mutationFn: async (data: Omit<TestRecordDb, 'id'>) => {
      return testService.createTestRecord(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRecords'] });
      setIsAddTestDialogOpen(false);
      resetForm();
      toast.success("Test record added successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to add test record: ${error.message}`);
    }
  });

  // Update test mutation
  const updateTestMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TestRecordDb> }) => {
      return testService.updateTestRecord(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRecords'] });
      setIsAddTestDialogOpen(false);
      setSelectedTest(null);
      resetForm();
      toast.success("Test record updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update test record: ${error.message}`);
    }
  });

  // Delete test mutation
  const deleteTestMutation = useMutation({
    mutationFn: async (id: string) => {
      return testService.deleteTestRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRecords'] });
      toast.success("Test record deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete test record: ${error.message}`);
    }
  });

  const resetForm = () => {
    setFormData({
      student_id: "",
      subject: "",
      test_date: "",
      test_name: "",
      marks: "",
      total_marks: "100",
      test_type: "Chapter-wise Test"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const testData = {
      student_id: formData.student_id,
      subject: formData.subject,
      test_date: formData.test_date,
      test_name: formData.test_name,
      marks: parseInt(formData.marks),
      total_marks: parseInt(formData.total_marks),
      test_type: formData.test_type as any
    };

    if (selectedTest) {
      updateTestMutation.mutate({ id: selectedTest.id, data: testData });
    } else {
      addTestMutation.mutate(testData);
    }
  };

  const handleEdit = (test: TestRecordDb) => {
    setSelectedTest(test);
    setFormData({
      student_id: test.student_id,
      subject: test.subject,
      test_date: test.test_date,
      test_name: test.test_name,
      marks: test.marks.toString(),
      total_marks: test.total_marks.toString(),
      test_type: test.test_type || "Chapter-wise Test"
    });
    setIsAddTestDialogOpen(true);
  };

  const handleDelete = (testId: string) => {
    if (confirm("Are you sure you want to delete this test record?")) {
      deleteTestMutation.mutate(testId);
    }
  };

  // Filter test records
  const filteredTests = testRecords.filter(test => {
    const student = students.find(s => s.id === test.student_id);
    const studentMatches = student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const testMatches = test.test_name.toLowerCase().includes(searchQuery.toLowerCase());
    const subjectMatches = subjectFilter === "all" || test.subject === subjectFilter;
    const classMatches = classFilter === "all" || student?.class.toString() === classFilter;
    
    return (studentMatches || testMatches) && subjectMatches && classMatches;
  });

  // Get unique subjects and classes for filters
  const subjects = [...new Set(testRecords.map(test => test.subject))];
  const classes = [...new Set(students.map(student => student.class.toString()))];

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
        title="Test Records" 
        action={
          <Button 
            onClick={() => {
              setSelectedTest(null);
              resetForm();
              setIsAddTestDialogOpen(true);
            }}
            className="bg-black hover:bg-black/80"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Test Record
          </Button>
        } 
      />

      {/* Filters */}
      <div className="bg-background/60 backdrop-blur-sm p-5 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search students or tests..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-10 h-11 text-base" 
            />
          </div>

          <div className="flex gap-3">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(cls => (
                  <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Test Records */}
      {isLoadingTests || isLoadingStudents ? (
        <LoadingState />
      ) : filteredTests.length === 0 ? (
        <EmptyState 
          icon={<FileText className="h-10 w-10 text-muted-foreground" />} 
          title="No test records found" 
          description="No test records match your current filters." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map(test => {
            const student = students.find(s => s.id === test.student_id);
            const percentage = Math.round((test.marks / test.total_marks) * 100);
            const grade = getGrade(percentage);
            
            return (
              <Card key={test.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>{student?.full_name || 'Unknown Student'}</span>
                    <Badge className={`${getGradeColor(percentage)} text-white`}>
                      {grade}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-base">{test.test_name}</p>
                      <p className="text-sm text-muted-foreground">{test.subject}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Score</p>
                        <p className="font-medium">{test.marks}/{test.total_marks}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Percentage</p>
                        <p className="font-medium">{percentage}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">{format(new Date(test.test_date), 'dd MMM yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Class</p>
                        <p className="font-medium">Class {student?.class}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(test)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(test.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Test Dialog */}
      <Dialog open={isAddTestDialogOpen} onOpenChange={setIsAddTestDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedTest ? "Edit Test Record" : "Add Test Record"}</DialogTitle>
            <DialogDescription>
              {selectedTest ? "Update the test record details." : "Add a new test record for a student."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="student">Student</Label>
              <Select 
                value={formData.student_id} 
                onValueChange={(value) => setFormData({ ...formData, student_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} - Class {student.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Mathematics"
                  required
                />
              </div>
              <div>
                <Label htmlFor="test_date">Test Date</Label>
                <Input
                  id="test_date"
                  type="date"
                  value={formData.test_date}
                  onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="test_name">Test Name</Label>
              <Input
                id="test_name"
                value={formData.test_name}
                onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                placeholder="e.g., Unit Test 1"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="marks">Marks Obtained</Label>
                <Input
                  id="marks"
                  type="number"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                  placeholder="80"
                  min="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="total_marks">Total Marks</Label>
                <Input
                  id="total_marks"
                  type="number"
                  value={formData.total_marks}
                  onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                  placeholder="100"
                  min="1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="test_type">Test Type</Label>
                <Select 
                  value={formData.test_type} 
                  onValueChange={(value) => setFormData({ ...formData, test_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MCQs Test (Standard)">MCQs Test (Standard)</SelectItem>
                    <SelectItem value="MCQs Test (Normal)">MCQs Test (Normal)</SelectItem>
                    <SelectItem value="Chapter-wise Test">Chapter-wise Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddTestDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={addTestMutation.isPending || updateTestMutation.isPending}
              >
                {selectedTest ? "Update" : "Add"} Test Record
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
