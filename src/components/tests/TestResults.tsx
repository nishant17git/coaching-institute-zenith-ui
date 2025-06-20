
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ArrowUpDown, FileText, History, Edit, Trash2, Share2 } from "lucide-react";
import { format } from "date-fns";
import { TestRecordDb, StudentRecord } from "@/types";
import { motion } from "framer-motion";

interface TestResultsProps {
  tests: TestRecordDb[];
  students: StudentRecord[];
  getGrade: (marks: number, totalMarks: number) => { grade: string; color: string };
  handleSort: (field: "date" | "marks") => void;
  isMobile: boolean;
  onExportPDF: (test: TestRecordDb) => void;
  onViewHistory: (studentId: string) => void;
  onEditTest: (test: TestRecordDb) => void;
  onDeleteTest: (testId: string) => void;
}

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

export function TestResults({
  tests,
  students,
  getGrade,
  handleSort,
  isMobile,
  onExportPDF,
  onViewHistory,
  onEditTest,
  onDeleteTest,
}: TestResultsProps) {
  if (tests.length === 0) {
    return (
      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No test records found</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto">
              No test records match your current filters. Try adjusting your search or add new test results.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Test Results</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Individual test results for Class 9 & 10 students
            </p>
          </div>
          {!isMobile && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort("date")}
                className="gap-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                Sort by Date
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort("marks")}
                className="gap-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                Sort by Marks
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isMobile ? (
          // Mobile view: Enhanced cards
          <div className="divide-y divide-border/60">
            {tests.map((test, index) => {
              const student = students.find(s => s.id === test.student_id);
              const percent = test.percentage || Math.round((test.marks_obtained / test.total_marks) * 100);
              const { grade, color } = getGrade(test.marks_obtained, test.total_marks);

              return (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-base truncate">
                        {student?.full_name || 'Unknown Student'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Class {student?.class || 'N/A'} • {formatSafeDate(test.created_at)}
                      </p>
                    </div>
                    <Badge className={color}>{grade}</Badge>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Score</span>
                      <span className="font-medium text-lg">
                        {test.marks_obtained}/{test.total_marks}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Percentage</span>
                        <span className="font-medium">{percent}%</span>
                      </div>
                      <Progress
                        value={percent}
                        className="h-2"
                        indicatorClassName={
                          percent >= 90 ? "bg-emerald-500" :
                          percent >= 75 ? "bg-blue-500" :
                          percent >= 60 ? "bg-yellow-500" :
                          percent >= 40 ? "bg-orange-500" : "bg-red-500"
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={() => onExportPDF(test)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={() => onViewHistory(test.student_id)}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={() => onEditTest(test)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-full text-red-500 hover:text-red-600"
                        onClick={() => onDeleteTest(test.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          // Desktop view: Enhanced table
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test, index) => {
                  const student = students.find(s => s.id === test.student_id);
                  const percent = test.percentage || Math.round((test.marks_obtained / test.total_marks) * 100);
                  const { grade, color } = getGrade(test.marks_obtained, test.total_marks);

                  return (
                    <TableRow key={test.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {student?.full_name || 'Unknown Student'}
                      </TableCell>
                      <TableCell>Class {student?.class || 'N/A'}</TableCell>
                      <TableCell>{formatSafeDate(test.created_at)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {test.marks_obtained}/{test.total_marks}
                          </div>
                          <div className="w-24">
                            <Progress
                              value={percent}
                              className="h-1.5"
                              indicatorClassName={
                                percent >= 90 ? "bg-emerald-500" :
                                percent >= 75 ? "bg-blue-500" :
                                percent >= 60 ? "bg-yellow-500" :
                                percent >= 40 ? "bg-orange-500" : "bg-red-500"
                              }
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={color}>{grade}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => onExportPDF(test)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => onViewHistory(test.student_id)}
                          >
                            <History className="h-4 w-4 mr-2" />
                            History
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => onEditTest(test)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            onClick={() => onDeleteTest(test.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
