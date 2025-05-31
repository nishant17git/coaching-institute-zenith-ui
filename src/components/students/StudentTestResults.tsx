import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share, History, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface TestResultsProps {
  tests: any[];
  students: any[];
  getGrade: (marks: number, totalMarks: number) => { grade: string; color: string };
  handleSort: (field: "date" | "marks") => void;
  isMobile: boolean;
  onExportPDF: (test: any) => void;
  onViewHistory: (studentId: string) => void;
}

export const StudentTestResults: React.FC<TestResultsProps> = ({
  tests,
  students,
  getGrade,
  handleSort,
  isMobile,
  onExportPDF,
  onViewHistory
}) => {
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString());
  
  // Filter test results
  const filteredTests = tests.filter(test => {
    const matchesSubject = subjectFilter === "all" || test.subject === subjectFilter;
    const matchesYear = test.date.includes(yearFilter);
    return matchesSubject && matchesYear;
  });
  
  // Extract unique subjects
  const subjects = ["all", ...new Set(tests.map(test => test.subject))];
  
  // Get all years from the test dates
  const years = [...new Set(tests.map(test => new Date(test.date).getFullYear().toString()))];
  
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-amber-600";
    return "text-red-600";
  };

  if (tests.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Recent test results and grades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-2">No test results available</p>
            <p className="text-sm text-muted-foreground">Test results will appear here once they are recorded</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Test Results</CardTitle>
        <CardDescription>Recent test results and grades</CardDescription>
      </CardHeader>
      <CardContent>
        {tests.length > 0 ? (
          isMobile ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <h3 className="text-lg font-medium">Test Results</h3>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2">
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                      <SelectTrigger className="w-full sm:w-[130px]">
                        <SelectValue placeholder="Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>
                            {subject === "all" ? "All Subjects" : subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                      <SelectTrigger className="w-full sm:w-[100px]">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Test Name</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Rank</TableHead>
                          <TableHead className="text-right">Percentile</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTests.length > 0 ? (
                          filteredTests.map((test, index) => (
                            <motion.tr
                              key={index}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="border-b"
                            >
                              <TableCell className="font-medium">{test.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-muted/50">
                                  {test.subject}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(test.date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <span className={cn(getScoreColor(test.score, test.maxScore))}>
                                  {test.score}/{test.maxScore}
                                </span>
                              </TableCell>
                              <TableCell>
                                {test.rank}
                                {test.rank === 1 && <span className="text-amber-500 ml-1">🏆</span>}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant={test.percentile >= 90 ? "default" : "outline"} className={cn(
                                  test.percentile >= 90 ? "bg-green-500" : 
                                  test.percentile >= 75 ? "text-blue-600" : 
                                  test.percentile >= 50 ? "text-amber-600" : "text-red-600"
                                )}>
                                  {test.percentile}%
                                </Badge>
                              </TableCell>
                            </motion.tr>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6">
                              No test results match the selected filters
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead className="text-right">Percentile</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTests.length > 0 ? (
                    filteredTests.map((test, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b"
                      >
                        <TableCell className="font-medium">{test.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-muted/50">
                            {test.subject}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(test.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={cn(getScoreColor(test.score, test.maxScore))}>
                            {test.score}/{test.maxScore}
                          </span>
                        </TableCell>
                        <TableCell>
                          {test.rank}
                          {test.rank === 1 && <span className="text-amber-500 ml-1">🏆</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={test.percentile >= 90 ? "default" : "outline"} className={cn(
                            test.percentile >= 90 ? "bg-green-500" : 
                            test.percentile >= 75 ? "text-blue-600" : 
                            test.percentile >= 50 ? "text-amber-600" : "text-red-600"
                          )}>
                            {test.percentile}%
                          </Badge>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No test results match the selected filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-2">No test results available</p>
            <p className="text-sm text-muted-foreground">Test results will appear here once they are recorded</p>
          </div>
        )}
      </CardContent>
      {tests.length > 0 && (
        <CardFooter className="bg-muted/50">
          <div className="flex justify-between w-full items-center">
            <p className="text-sm text-muted-foreground">
              Showing {tests.length} test records
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewHistory && onViewHistory(tests[0].student_id)}
              className="gap-1"
            >
              <History className="h-4 w-4" />
              View History
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
