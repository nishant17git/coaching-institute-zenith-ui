import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, Share, History, Download, FileText, Edit, Trash2, Clock, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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

interface TestResultsProps {
  tests: any[];
  students: any[];
  getGrade: (marks: number, totalMarks: number) => {
    grade: string;
    color: string;
  };
  handleSort: (field: "date" | "marks") => void;
  isMobile: boolean;
  onExportPDF: (test: any) => void;
  onViewHistory: (studentId: string) => void;
  onEditTest: (test: any) => void;
  onDeleteTest: (testId: string) => void;
}

export function TestResults({
  tests,
  students,
  getGrade,
  handleSort,
  isMobile,
  onExportPDF,
  onViewHistory,
  onEditTest,
  onDeleteTest
}: TestResultsProps) {
  const navigate = useNavigate();

  const handleShare = (test: any) => {
    if (navigator.share) {
      const student = students.find(s => s.id === test.student_id);
      const { grade } = getGrade(test.marks_obtained, test.total_marks);
      const percent = Math.round((test.marks_obtained / test.total_marks) * 100);
      
      navigator.share({
        title: `Test Results`,
        text: `${student?.full_name || 'Student'} scored ${test.marks_obtained}/${test.total_marks} (${percent}%, Grade ${grade}) on ${formatSafeDate(test.created_at)}`
      }).then(() => {
        toast.success("Shared successfully!");
      }).catch(err => {
        console.error("Error sharing:", err);
        toast.error("Couldn't share the content. Try another method.");
      });
    } else {
      onExportPDF(test);
    }
  };

  const copyToClipboard = (test: any) => {
    const student = students.find(s => s.id === test.student_id);
    const { grade } = getGrade(test.marks_obtained, test.total_marks);
    const percent = Math.round((test.marks_obtained / test.total_marks) * 100);
    const textToCopy = `${student?.full_name || 'Student'} scored ${test.marks_obtained}/${test.total_marks} (${percent}%, Grade ${grade}) on ${formatSafeDate(test.created_at)}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success("Copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };

  if (tests.length === 0) {
    return (
      <Card className="overflow-hidden shadow-sm border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-lg mb-1">No test records found</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            No test records match your search criteria. Try adjusting your filters or add a new test record.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <Card className="overflow-hidden shadow-sm border bg-card">
        <CardHeader className="pb-3 px-4 bg-muted/30">
          <CardTitle className="font-semibold text-xl">Test Records</CardTitle>
          <CardDescription className="text-sm">
            Showing {tests.length} test {tests.length === 1 ? 'record' : 'records'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {tests.map((test, index) => {
              const student = students.find(s => s.id === test.student_id);
              const { grade, color } = getGrade(test.marks_obtained, test.total_marks);
              const percent = Math.round((test.marks_obtained / test.total_marks) * 100);
              
              return (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-border/50 last:border-b-0"
                >
                  <div className="p-4 space-y-3">
                    {/* Header with Student Info and Grade */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-base text-foreground leading-tight truncate">
                            {student?.full_name || "Unknown Student"}
                          </h3>
                          <Badge className={`${color} text-white text-xs font-medium shrink-0`}>
                            {grade}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                            Class {student?.class || "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatSafeDate(test.created_at, 'MMM dd')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 rounded-full hover:bg-primary/10" 
                          onClick={() => onViewHistory(test.student_id)}
                        >
                          <History className="h-3.5 w-3.5" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 rounded-full hover:bg-primary/10"
                            >
                              <Share className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem onClick={() => handleShare(test)}>
                              <Share className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExportPDF(test)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Export PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => copyToClipboard(test)}>
                              <Download className="h-4 w-4 mr-2" />
                              Copy to clipboard
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {/* Enhanced Score Display */}
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Test Score</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-foreground">
                              {test.marks_obtained}
                            </span>
                            <span className="text-sm text-muted-foreground">/{test.total_marks}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Percentage</p>
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold text-primary">
                              {percent}%
                            </span>
                            {percent >= 75 && <TrendingUp className="h-4 w-4 text-green-500" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 px-3 text-xs" 
                        onClick={() => onEditTest(test)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 px-3 text-xs text-destructive hover:text-destructive" 
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this test record?")) {
                            onDeleteTest(test.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-sm border bg-card">
      <CardHeader className="bg-muted/30 border-b border-border pb-3">
        <CardTitle className="text-lg font-medium">Test Records</CardTitle>
        <CardDescription>
          Showing {tests.length} test {tests.length === 1 ? 'record' : 'records'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20">
                <TableHead className="font-semibold">Student</TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer hover:text-foreground transition-colors" 
                    onClick={() => handleSort("date")}
                  >
                    Date <ArrowUpDown className="ml-2 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer hover:text-foreground transition-colors" 
                    onClick={() => handleSort("marks")}
                  >
                    Score <ArrowUpDown className="ml-2 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Grade</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {tests.map((test, index) => {
                  const student = students.find(s => s.id === test.student_id);
                  const { grade, color } = getGrade(test.marks_obtained, test.total_marks);
                  const percent = Math.round((test.marks_obtained / test.total_marks) * 100);
                  
                  return (
                    <motion.tr
                      key={test.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
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
                        <div className="text-xs text-muted-foreground">{percent}%</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${color} text-white shadow-sm font-medium`}>{grade}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 rounded-full hover:bg-primary/10" 
                                onClick={() => onViewHistory(test.student_id)}
                              >
                                <History className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View test history</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 rounded-full hover:bg-primary/10" 
                                onClick={() => onEditTest(test)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit test</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive" 
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this test record?")) {
                                    onDeleteTest(test.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete test</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 rounded-full hover:bg-primary/10" 
                                onClick={() => handleShare(test)}
                              >
                                <Share className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Share test results</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
