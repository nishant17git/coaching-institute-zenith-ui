
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Award, BookOpen, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface TestResultsProps {
  testResults: any[];
  tests: any[];
  testStats: {
    totalTests: number;
    averagePercentage: number;
    highestScore: number;
    lowestScore: number;
  } | null;
}

export function StudentTestResults({ testResults, tests, testStats }: TestResultsProps) {
  if (testResults.length === 0) {
    return (
      <EmptyState 
        icon={<BookOpen className="h-10 w-10 text-muted-foreground" />} 
        title="No test results" 
        description="No test results found for this student." 
      />
    );
  }

  // Create a map of test IDs to test details for easy lookup
  const testMap = tests.reduce((acc, test) => {
    acc[test.id] = test;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Test Statistics */}
      {testStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Tests</p>
                  <p className="text-2xl font-bold">{testStats.totalTests}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold">{testStats.averagePercentage}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Highest Score</p>
                  <p className="text-2xl font-bold">{testStats.highestScore}%</p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lowest Score</p>
                  <p className="text-2xl font-bold">{testStats.lowestScore}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Results List */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.map((result) => {
              const test = testMap[result.test_id];
              return (
                <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{test?.test_name || 'Unknown Test'}</p>
                    <p className="text-sm text-muted-foreground">
                      {test?.subject || 'Unknown Subject'} • {test?.test_date ? format(new Date(test.test_date), 'dd MMM yyyy') : 'Unknown Date'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.marks_obtained} / {result.total_marks} marks
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-lg font-bold">
                      {result.percentage ? Math.round(result.percentage) : 0}%
                    </p>
                    {result.grade && (
                      <Badge variant="outline">
                        {result.grade}
                      </Badge>
                    )}
                    {result.rank && (
                      <p className="text-xs text-muted-foreground">
                        Rank: {result.rank}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
