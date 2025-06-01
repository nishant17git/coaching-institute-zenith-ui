
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, Share, History, Download, FileText, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface TestResultsProps {
  tests: any[];
  students: any[];
  getGrade: (marks: number, totalMarks: number) => { grade: string, color: string };
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
  
  // Share functionality
  const handleShare = (test: any) => {
    if (navigator.share) {
      const student = students.find(s => s.id === test.student_id);
      const { grade } = getGrade(test.marks, test.total_marks);
      const percent = Math.round((test.marks / test.total_marks) * 100);
      
      navigator.share({
        title: `${test.subject} Test Results`,
        text: `${student?.full_name || 'Student'} scored ${test.marks}/${test.total_marks} (${percent}%, Grade ${grade}) in ${test.test_name} on ${format(new Date(test.test_date), 'dd MMM yyyy')}`,
      }).then(() => {
        toast.success("Shared successfully!");
      }).catch((err) => {
        console.error("Error sharing:", err);
        toast.error("Couldn't share the content. Try another method.");
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      onExportPDF(test);
    }
  };
  
  const copyToClipboard = (test: any) => {
    const student = students.find(s => s.id === test.student_id);
    const { grade } = getGrade(test.marks, test.total_marks);
    const percent = Math.round((test.marks / test.total_marks) * 100);
    
    const textToCopy = `${student?.full_name || 'Student'} scored ${test.marks}/${test.total_marks} (${percent}%, Grade ${grade}) in ${test.test_name} (${test.subject}) on ${format(new Date(test.test_date), 'dd MMM yyyy')}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success("Copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };
  
  if (tests.length === 0) {
    return (
      <Card className="overflow-hidden shadow-md border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-muted-foreground" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2}
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <p className="font-medium text-lg mb-1">No test records found</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            No test records match your search criteria. Try adjusting your filters or add a new test record.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Mobile view with cards for each test
  if (isMobile) {
    return (
      <AnimatePresence>
        <Card className="overflow-hidden shadow-md border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/40 dark:to-gray-900/40 border-b border-slate-200/70 dark:border-slate-700/30 pb-3">
            <CardTitle className="text-lg font-medium">Test Records</CardTitle>
            <CardDescription>
              Showing {tests.length} test {tests.length === 1 ? 'record' : 'records'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4 divide-y divide-border/60">
              {tests.map((test, index) => {
                const student = students.find(s => s.id === test.student_id);
                const { grade, color } = getGrade(test.marks, test.total_marks);
                const percent = Math.round((test.marks / test.total_marks) * 100);
                
                return (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white dark:bg-slate-900"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-base">{student?.full_name || "Unknown Student"}</p>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="text-xs font-normal mr-2">Class {student?.class || "N/A"}</Badge>
                            <Badge className={`${color} shadow-sm text-xs`}>{grade}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600"
                            onClick={() => onViewHistory(test.student_id)}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600"
                              >
                                <Share className="h-4 w-4" />
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
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-3 my-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Subject</p>
                          <p className="font-medium">{test.subject}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Date</p>
                          <p>{format(new Date(test.test_date), 'dd MMM yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Test Name</p>
                          <p>{test.test_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 font-medium">Score</p>
                          <p className="font-medium text-base font-spotify">
                            {test.marks}/{test.total_marks}
                            <span className="text-xs ml-1 text-muted-foreground">({percent}%)</span>
                          </p>
                        </div>
                        {test.test_type && (
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground mb-1 font-medium">Test Type</p>
                            <p>{test.test_type}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 px-3 text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300 bg-amber-50 hover:bg-amber-100"
                          onClick={() => onEditTest(test)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 px-3 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this test record?")) {
                              onDeleteTest(test.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
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
      </AnimatePresence>
    );
  }

  // Desktop view with table - modernized
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
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
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort("date")}>
                    Date <ArrowUpDown className="ml-2 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Test Name</TableHead>
                <TableHead>Test Type</TableHead>
                <TableHead>
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort("marks")}>
                    Score <ArrowUpDown className="ml-2 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {tests.map((test, index) => {
                  const student = students.find(s => s.id === test.student_id);
                  const { grade, color } = getGrade(test.marks, test.total_marks);
                  const percent = Math.round((test.marks / test.total_marks) * 100);
                  
                  return (
                    <motion.tr
                      key={test.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                      className="hover:bg-muted/30 group"
                    >
                      <TableCell>
                        <div className="font-medium">{student?.full_name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">Class {student?.class || "N/A"}</div>
                      </TableCell>
                      <TableCell>{test.subject}</TableCell>
                      <TableCell>{format(new Date(test.test_date), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{test.test_name}</TableCell>
                      <TableCell>{test.test_type || "Chapter-wise Test"}</TableCell>
                      <TableCell>
                        <div className="font-medium font-spotify">{test.marks}/{test.total_marks}</div>
                        <div className="text-xs text-muted-foreground">{percent}%</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${color} shadow-sm`}>{grade}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600"
                                  onClick={() => onViewHistory(test.student_id)}
                                >
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
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-600"
                                  onClick={() => onEditTest(test)}
                                >
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
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600"
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
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600"
                                  onClick={() => handleShare(test)}
                                >
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
