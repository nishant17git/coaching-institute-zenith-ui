
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TestResultsProps {
  tests: any[];
  students: any[];
  testResults: any[];
  getGrade: (marks: number, totalMarks: number) => { grade: string; color: string; };
  handleSort: (field: string) => void;
  sortBy: string;
  sortOrder: string;
  onAddResult: () => void;
}

export function TestResults({ 
  tests, 
  students, 
  testResults, 
  getGrade, 
  handleSort, 
  sortBy, 
  sortOrder, 
  onAddResult 
}: TestResultsProps) {
  return (
    <Card className="shadow-sm border-muted">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Test Results</CardTitle>
          <Button onClick={onAddResult} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Result
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {testResults.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No test results found. Add some test results to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testResults.map((result) => (
              <Card key={result.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm font-medium">
                    <div>
                      <span className="text-base block">{result.tests?.test_name || 'Unknown Test'}</span>
                      <span className="text-xs text-muted-foreground">
                        {result.students?.full_name || 'Unknown Student'}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {result.percentage || 0}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Score:</span>
                      <span className="font-medium">{result.marks_obtained}/{result.total_marks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Grade:</span>
                      <span className={`font-medium ${getGrade(result.marks_obtained, result.total_marks).color}`}>
                        {getGrade(result.marks_obtained, result.total_marks).grade}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
