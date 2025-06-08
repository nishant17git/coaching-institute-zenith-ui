import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, Share, History, Download, FileText, Edit, Trash2, Clock, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
      const {
        grade
      } = getGrade(test.marks_obtained, test.total_marks);
      const percent = Math.round(test.marks_obtained / test.total_marks * 100);
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
    const {
      grade
    } = getGrade(test.marks_obtained, test.total_marks);
    const percent = Math.round(test.marks_obtained / test.total_marks * 100);
    const textToCopy = `${student?.full_name || 'Student'} scored ${test.marks_obtained}/${test.total_marks} (${percent}%, Grade ${grade}) on ${formatSafeDate(test.created_at)}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success("Copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };
  if (tests.length === 0) {
    return <Card className="overflow-hidden shadow-md border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-medium text-lg mb-1">No test records found</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            No test records match your search criteria. Try adjusting your filters or add a new test record.
          </p>
        </CardContent>
      </Card>;
  }
  if (isMobile) {
    return <AnimatePresence>
        <Card className="overflow-hidden shadow-md border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className=" pb-3 px-[15px] bg-white">
            <CardTitle className="font-semibold text-xl">Test Records</CardTitle>
            <CardDescription className="text-sm">
              Showing {tests.length} test {tests.length === 1 ? 'record' : 'records'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 divide-y divide-border/30">
              {tests.map((test, index) => {
              const student = students.find(s => s.id === test.student_id);
              const {
                grade,
                color
              } = getGrade(test.marks_obtained, test.total_marks);
              const percent = Math.round(test.marks_obtained / test.total_marks * 100);
              return <motion.div key={test.id} initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.3,
                delay: index * 0.05
              }} className="bg-white dark:bg-slate-900">
                    <div className="p-4 space-y-3">
                      {/* Header with Student Info and Grade */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 leading-tight">
                              {student?.full_name || "Unknown Student"}
                            </h3>
                            <Badge className={`${color} shadow-sm text-xs font-medium`}>{grade}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
                              Class {student?.class || "N/A"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatSafeDate(test.created_at, 'MMM dd')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600" onClick={() => onViewHistory(test.student_id)}>
                            <History className="h-3.5 w-3.5" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600">
                                <Share className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm">
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
                      <div className="bg-gradient-to-r from-slate-50/50 to-blue-50/50 dark:from-slate-800/30 dark:to-blue-900/20 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Test Score</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold font-spotify text-gray-900 dark:text-gray-100">
                                {test.marks_obtained}
                              </span>
                              <span className="text-lg text-muted-foreground">/{test.total_marks}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Percentage</p>
                            <div className="flex items-center gap-1">
                              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {percent}%
                              </span>
                              {percent >= 75 && <TrendingUp className="h-4 w-4 text-green-500" />}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="h-8 px-3 text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300 bg-amber-50 hover:bg-amber-100" onClick={() => onEditTest(test)}>
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 px-3 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100" onClick={() => {
                      if (confirm("Are you sure you want to delete this test record?")) {
                        onDeleteTest(test.id);
                      }
                    }}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>;
            })}
            </div>
          </CardContent>
        </Card>
      </AnimatePresence>;
  }
  return <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/40 dark:to-gray-900/40 border-b border-slate-200/70 dark:border-slate-700/30 pb-3">
        <CardTitle className="text-lg font-medium">Test Records</CardTitle>
        <CardDescription>
          Showing {tests.length} test {tests.length === 1 ? 'record' : 'records'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 dark:bg-slate-800/30">
                <TableHead className="font-semibold">Student</TableHead>
                <TableHead>
                  <div className="flex items-center cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("date")}>
                    Date <ArrowUpDown className="ml-2 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("marks")}>
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
                const {
                  grade,
                  color
                } = getGrade(test.marks_obtained, test.total_marks);
                const percent = Math.round(test.marks_obtained / test.total_marks * 100);
                return <motion.tr key={test.id} initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} exit={{
                  opacity: 0
                }} transition={{
                  duration: 0.3,
                  delay: index * 0.02
                }} className="hover:bg-muted/30 group transition-colors">
                      <TableCell>
                        <div className="font-medium">{student?.full_name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">Class {student?.class || "N/A"}</div>
                      </TableCell>
                      <TableCell className="font-medium">{formatSafeDate(test.created_at)}</TableCell>
                      <TableCell>
                        <div className="font-medium font-spotify">{test.marks_obtained}/{test.total_marks}</div>
                        <div className="text-xs text-muted-foreground">{percent}%</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${color} shadow-sm font-medium`}>{grade}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600" onClick={() => onViewHistory(test.student_id)}>
                                  <History className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View test history</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-600" onClick={() => onEditTest(test)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit test</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600" onClick={() => {
                              if (confirm("Are you sure you want to delete this test record?")) {
                                onDeleteTest(test.id);
                              }
                            }}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete test</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600" onClick={() => handleShare(test)}>
                                  <Share className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Share test results</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </motion.tr>;
              })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>;
}