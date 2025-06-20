
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedPageHeader } from "@/components/enhanced-page-header";
import { TestResults } from "@/components/tests/TestResults";
import { TestDetailsTab } from "@/components/tests/TestDetailsTab";
import { TestAddForm } from "@/components/tests/TestAddForm";
import { TestCreateForm } from "@/components/tests/TestCreateForm";
import { PerformanceInsights } from "@/components/tests/PerformanceInsights";
import { Plus, Search, Filter, Download, TrendingUp, Users, Target, FileText } from "lucide-react";
import { testService } from "@/services/testService";
import { supabase } from "@/integrations/supabase/client";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { TestRecordDb, StudentRecord } from "@/types";
import { exportTestToPDF } from "@/services/pdfService";
import { motion } from "framer-motion";

interface Grade {
  grade: string;
  color: string;
}

export default function Tests() {
  const [activeTab, setActiveTab] = React.useState("results");
  const [search, setSearch] = React.useState("");
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const isMobile = useIsMobile();
  const { students } = useData();
  const queryClient = useQueryClient();

  const { data: tests = [], isLoading: testsLoading, refetch: refetchTests } = useQuery({
    queryKey: ["tests"],
    queryFn: testService.getTests,
  });

  const { data: testRecords = [], isLoading: testRecordsLoading, refetch: refetchTestRecords } = useQuery({
    queryKey: ["test_results"],
    queryFn: testService.getTestRecords,
  });

  const { mutate: addTestResult, isPending: isAdding } = useMutation({
    mutationFn: testService.createTestRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test_results"] });
      toast.success("Test result added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add test result: ${error.message}`);
    },
  });

  const { mutate: updateTestResult, isPending: isUpdating } = useMutation({
    mutationFn: (data: { id: string; testRecord: any }) => testService.updateTestRecord(data.id, data.testRecord),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test_results"] });
      toast.success("Test result updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update test result: ${error.message}`);
    },
  });

  const { mutate: deleteTestResult, isPending: isDeleting } = useMutation({
    mutationFn: testService.deleteTestRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test_results"] });
      toast.success("Test result deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete test result: ${error.message}`);
    },
  });

  // Add test creation handler
  const handleCreateTest = async (testData: any) => {
    try {
      console.log('Creating test:', testData);
      await testService.createTest(testData);
      await refetchTests();
      setShowAddDialog(false);
      toast.success("Test created successfully");
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error("Failed to create test");
      throw error;
    }
  };

  const handleAddTest = async (data: any) => {
    addTestResult(data);
    setShowAddDialog(false);
  };

  const handleUpdateTest = async (id: string, data: any) => {
    updateTestResult({ id, testRecord: data });
  };

  const handleDeleteTest = async (id: string) => {
    deleteTestResult(id);
  };

  const handleExportPDF = (test: TestRecordDb) => {
    // Convert Student to StudentRecord format for the student
    const student = students.find((s) => s.id === test.student_id);
    if (!student) {
      toast.error("Student not found");
      return;
    }

    // Convert Student interface to StudentRecord format
    const studentRecord: StudentRecord = {
      id: student.id,
      full_name: student.name,
      class: parseInt(student.class),
      roll_number: student.rollNumber || 0,
      date_of_birth: student.dateOfBirth || "",
      address: student.address,
      father_name: student.father || student.fatherName,
      mother_name: student.mother || student.motherName,
      guardian_name: null,
      contact_number: student.phoneNumber,
      whatsapp_number: student.whatsappNumber,
      email: null,
      fee_status: student.feeStatus,
      total_fees: student.totalFees,
      paid_fees: student.paidFees,
      attendance_percentage: student.attendancePercentage,
      admission_date: student.joinDate,
      created_at: null,
      updated_at: null,
      gender: student.gender,
      aadhaar_number: student.aadhaarNumber,
      blood_group: null,
      status: null,
    };

    // Convert to legacy format for PDF service
    const legacyFormat = {
      test_name: "Test Result Report",
      subject: "All Subjects",
      test_date: new Date().toISOString(),
      marks: 0,
      total_marks: 100
    };
    exportTestToPDF({
      test: legacyFormat,
      student: studentRecord,
      title: "Test Result Report",
      subtitle: `Complete Test History for ${studentRecord.full_name}`,
    });
    toast.success("Test records PDF generated successfully");
  };

  const handleViewHistory = (studentId: string) => {
    // Navigate to the TestHistory page for the selected student
    window.open(`/test-history/${studentId}`, '_blank');
  };

  const [sortBy, setSortBy] = React.useState<"date" | "marks">("date");

  const handleSort = (field: "date" | "marks") => {
    setSortBy(field);
  };

  const sortedTests = useMemo(() => {
    const sortFactor = sortBy === "date" ? "created_at" : "marks_obtained";
    return [...testRecords].sort((a, b) => {
      if (sortFactor === "created_at") {
        // Ensure both dates are valid before comparison
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA; // Sort by newest date first
      } else {
        return b.marks_obtained - a.marks_obtained; // Sort by highest marks first
      }
    });
  }, [testRecords, sortBy]);

  const filteredTests = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return sortedTests.filter((test) => {
      const student = students.find((s) => s.id === test.student_id);
      const studentName = student?.name || "";
      return (
        studentName.toLowerCase().includes(lowerSearch) ||
        test.id.toLowerCase().includes(lowerSearch)
      );
    });
  }, [sortedTests, search, students]);

  const getGrade = (marks: number, totalMarks: number): Grade => {
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 90) return { grade: "A+", color: "bg-emerald-500" };
    if (percentage >= 80) return { grade: "A", color: "bg-blue-500" };
    if (percentage >= 70) return { grade: "B", color: "bg-green-500" };
    if (percentage >= 60) return { grade: "C", color: "bg-yellow-500" };
    if (percentage >= 50) return { grade: "D", color: "bg-orange-500" };
    return { grade: "F", color: "bg-red-500" };
  };

  const [editTest, setEditTest] = React.useState<TestRecordDb | null>(null);

  // Convert Student[] to StudentRecord[] for components that need it
  const studentRecords: StudentRecord[] = students.map(student => ({
    id: student.id,
    full_name: student.name,
    class: parseInt(student.class),
    roll_number: student.rollNumber || 0,
    date_of_birth: student.dateOfBirth || "",
    address: student.address,
    father_name: student.father || student.fatherName,
    mother_name: student.mother || student.motherName,
    guardian_name: null,
    contact_number: student.phoneNumber,
    whatsapp_number: student.whatsappNumber,
    email: null,
    fee_status: student.feeStatus,
    total_fees: student.totalFees,
    paid_fees: student.paidFees,
    attendance_percentage: student.attendancePercentage,
    admission_date: student.joinDate,
    created_at: null,
    updated_at: null,
    gender: student.gender,
    aadhaar_number: student.aadhaarNumber,
    blood_group: null,
    status: null,
  }));

  return (
    <div className="space-y-6">
      <EnhancedPageHeader title="Test Records" description="Manage and view student test results" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="grid w-full sm:w-auto grid-cols-3">
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <div className="flex gap-2 flex-wrap">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  {activeTab === "results" ? "Add Result" : "Create Test"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden p-0">
                <DialogHeader className="px-6 py-4 border-b">
                  <DialogTitle>
                    {activeTab === "results" ? "Add Test Result" : "Create New Test"}
                  </DialogTitle>
                  <DialogDescription>
                    {activeTab === "results"
                      ? "Add a test result for a student"
                      : "Create a new test for your students"
                    }
                  </DialogDescription>
                </DialogHeader>
                {activeTab === "results" ? (
                  <TestAddForm onSubmit={handleAddTest} initialData={editTest} isEditing={!!editTest} />
                ) : (
                  <TestCreateForm onSubmit={handleCreateTest} onClose={() => setShowAddDialog(false)} />
                )}
              </DialogContent>
            </Dialog>
            <Input
              type="search"
              placeholder="Search tests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
        </div>

        <TabsContent value="results" className="mt-0">
          <TestResults
            tests={filteredTests}
            students={studentRecords}
            getGrade={getGrade}
            handleSort={handleSort}
            isMobile={isMobile}
            onExportPDF={handleExportPDF}
            onViewHistory={handleViewHistory}
            onEditTest={(test) => {
              setEditTest(test);
              setShowAddDialog(true);
            }}
            onDeleteTest={handleDeleteTest}
          />
        </TabsContent>

        <TabsContent value="details" className="mt-0">
          <TestDetailsTab 
            tests={tests} 
            testRecords={testRecords} 
            students={studentRecords} 
          />
        </TabsContent>

        <TabsContent value="insights" className="mt-0">
          <PerformanceInsights testRecords={testRecords} students={studentRecords} />
        </TabsContent>
      </Tabs>

      <Dialog open={isAdding || isUpdating || isDeleting} onOpenChange={() => { }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Please wait</DialogTitle>
            <DialogDescription>
              {isAdding ? "Adding test..." : isUpdating ? "Updating test..." : "Deleting test..."}
            </DialogDescription>
          </DialogHeader>
          <CardContent className="flex justify-center">
            <TrendingUp className="h-12 w-12 animate-spin" />
          </CardContent>
        </DialogContent>
      </Dialog>
    </div>
  );
}
