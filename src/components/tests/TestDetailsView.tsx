
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, User, Calendar, Target, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface TestDetailsViewProps {
  testRecords: any[];
  students: any[];
  onExportPDF: (test: any) => void;
}

export function TestDetailsView({ testRecords, students, onExportPDF }: TestDetailsViewProps) {
  const getGrade = (marks: number, totalMarks: number) => {
    const percent = (marks / totalMarks) * 100;
    if (percent >= 90) return { grade: 'A', color: 'bg-emerald-500' };
    if (percent >= 75) return { grade: 'B', color: 'bg-blue-500' };
    if (percent >= 60) return { grade: 'C', color: 'bg-yellow-500' };
    if (percent >= 40) return { grade: 'D', color: 'bg-orange-500' };
    return { grade: 'F', color: 'bg-red-500' };
  };

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

  if (testRecords.length === 0) {
    return (
      <Card className="overflow-hidden shadow-sm border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-lg mb-1">No test details found</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            No test records available to display detailed information.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Optimized Layout */}
      <div className="block lg:hidden space-y-4">
        {testRecords.map((test, index) => {
          const student = students.find(s => s.id === test.student_id);
          const { grade, color } = getGrade(test.marks_obtained, test.total_marks);
          const percent = test.percentage || Math.round((test.marks_obtained / test.total_marks) * 100);
          
          return (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden shadow-sm border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-foreground leading-tight truncate">
                        {student?.full_name || "Unknown Student"}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Class {student?.class || "N/A"} • {formatSafeDate(test.created_at)}
                      </CardDescription>
                    </div>
                    <Badge className={`${color} text-white text-xs font-medium shrink-0`}>
                      {grade}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Target className="h-3 w-3" />
                        Score
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        {test.marks_obtained}/{test.total_marks}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        Percentage
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {percent}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 px-3 text-xs"
                      onClick={() => onExportPDF(test)}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Export PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden lg:block">
        <Card className="overflow-hidden shadow-sm border bg-card">
          <CardHeader className="bg-muted/30 border-b border-border pb-3">
            <CardTitle className="text-lg font-medium">Detailed Test Records</CardTitle>
            <CardDescription>
              Complete information for all test records
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="font-semibold">Student</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Score</TableHead>
                    <TableHead className="font-semibold">Percentage</TableHead>
                    <TableHead className="font-semibold">Grade</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testRecords.map((test, index) => {
                    const student = students.find(s => s.id === test.student_id);
                    const { grade, color } = getGrade(test.marks_obtained, test.total_marks);
                    const percent = test.percentage || Math.round((test.marks_obtained / test.total_marks) * 100);
                    
                    return (
                      <motion.tr
                        key={test.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                        className="hover:bg-muted/20 group transition-colors"
                      >
                        <TableCell>
                          <div className="font-medium">{student?.full_name || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">Class {student?.class || "N/A"}</div>
                        </TableCell>
                        <TableCell className="font-medium">{formatSafeDate(test.created_at)}</TableCell>
                        <TableCell>
                          <div className="font-medium">{test.marks_obtained}/{test.total_marks}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{percent}%</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${color} text-white shadow-sm font-medium`}>{grade}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-3 text-xs opacity-70 group-hover:opacity-100 transition-opacity"
                            onClick={() => onExportPDF(test)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
