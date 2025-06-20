
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Trophy, Users, TrendingUp, TrendingDown, Calendar, BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { TestDb, TestRecordDb, StudentRecord } from "@/types";

interface TestDetailsTabProps {
  tests: TestDb[];
  testRecords: TestRecordDb[];
  students: StudentRecord[];
}

export function TestDetailsTab({ tests, testRecords, students }: TestDetailsTabProps) {
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

  const toggleExpanded = (testId: string) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(testId)) {
      newExpanded.delete(testId);
    } else {
      newExpanded.add(testId);
    }
    setExpandedTests(newExpanded);
  };

  // Helper function to get test statistics
  const getTestStats = (testId: string) => {
    const testResults = testRecords.filter(record => record.test_id === testId);
    
    if (testResults.length === 0) {
      return {
        totalStudents: 0,
        averageMarks: 0,
        passRate: 0,
        topScorers: [],
        lowScorers: [],
      };
    }

    const totalStudents = testResults.length;
    const averageMarks = Math.round(
      testResults.reduce((sum, record) => sum + (record.percentage || 0), 0) / totalStudents
    );
    // Updated to use 40% as the pass criteria for low-performing students
    const passRate = Math.round(
      (testResults.filter(record => (record.percentage || 0) >= 40).length / totalStudents) * 100
    );

    // Get top 3 scorers
    const sortedByScore = testResults
      .map(record => ({
        ...record,
        student: students.find(s => s.id === record.student_id),
      }))
      .filter(record => record.student)
      .sort((a, b) => (b.percentage || 0) - (a.percentage || 0));

    const topScorers = sortedByScore.slice(0, 3);
    // Low scorers are now defined as below 40%
    const lowScorers = sortedByScore.filter(record => (record.percentage || 0) < 40).slice(0, 3);

    return {
      totalStudents,
      averageMarks,
      passRate,
      topScorers,
      lowScorers,
    };
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "bg-emerald-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  if (tests.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
          <BookOpen className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No tests found</h3>
        <p className="text-slate-600 dark:text-slate-400 text-base max-w-md mx-auto leading-relaxed">
          Create your first test to see detailed analytics and performance insights here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tests.map((test) => {
        const stats = getTestStats(test.id);
        const isExpanded = expandedTests.has(test.id);
        
        return (
          <Card key={test.id} className="overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-200">
            <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(test.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 cursor-pointer hover:from-slate-100 hover:via-slate-50 hover:to-slate-100 dark:hover:from-slate-800 dark:hover:via-slate-700 dark:hover:to-slate-800 transition-all duration-300 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <CardTitle className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3 leading-tight">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="flex-1">{test.test_name}</span>
                        <div className="ml-auto">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-slate-500 transition-transform duration-200" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-slate-500 transition-transform duration-200" />
                          )}
                        </div>
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">
                            {test.test_date ? format(new Date(test.test_date), 'dd MMM yyyy') : 'No date'}
                          </span>
                        </div>
                        <Badge variant="outline" className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium">
                          {test.subject}
                        </Badge>
                        <Badge variant="outline" className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium">
                          Class {test.class}
                        </Badge>
                        <span className="text-slate-600 dark:text-slate-400 font-medium">{test.total_marks} marks</span>
                        {test.test_type && (
                          <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                            {test.test_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-none">
                          {stats.totalStudents}
                        </div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 leading-none">
                          {stats.averageMarks}%
                        </div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Average</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                <CardContent className="p-8">
                  {stats.totalStudents > 0 ? (
                    <div className="space-y-8">
                      {/* Statistics Overview */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-600 rounded-lg">
                              <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Average Score</span>
                          </div>
                          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-3">
                            {stats.averageMarks}%
                          </div>
                          <Progress value={stats.averageMarks} className="h-3" />
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-600 rounded-lg">
                              <Users className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-green-900 dark:text-green-100">Pass Rate (≥40%)</span>
                          </div>
                          <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-3">
                            {stats.passRate}%
                          </div>
                          <Progress value={stats.passRate} className="h-3" />
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-600 rounded-lg">
                              <Trophy className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">Total Students</span>
                          </div>
                          <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                            {stats.totalStudents}
                          </div>
                        </div>
                      </div>

                      {/* Test Information */}
                      {(test.duration_minutes || test.instructions || test.syllabus_covered) && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                          <h4 className="font-semibold text-lg mb-4 text-slate-900 dark:text-slate-100">Test Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            {test.duration_minutes && (
                              <div className="space-y-1">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Duration:</span>
                                <p className="text-slate-600 dark:text-slate-400">{test.duration_minutes} minutes</p>
                              </div>
                            )}
                            {test.syllabus_covered && (
                              <div className="md:col-span-2 space-y-2">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Syllabus Covered:</span>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{test.syllabus_covered}</p>
                              </div>
                            )}
                            {test.instructions && (
                              <div className="md:col-span-2 space-y-2">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Instructions:</span>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{test.instructions}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Top Performers */}
                      {stats.topScorers.length > 0 && (
                        <div className="space-y-6">
                          <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-yellow-500 rounded-lg">
                              <Trophy className="h-5 w-5 text-white" />
                            </div>
                            Top Performers
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {stats.topScorers.map((scorer, index) => (
                              <div
                                key={scorer.id}
                                className={`p-6 rounded-xl border-2 transition-all hover:shadow-md ${
                                  index === 0
                                    ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20 dark:border-yellow-600'
                                    : index === 1
                                    ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/20 dark:border-gray-600'
                                    : 'border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/20 dark:border-orange-600'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <span className="font-semibold text-sm">
                                    {index === 0 ? '🥇 1st Place' : index === 1 ? '🥈 2nd Place' : '🥉 3rd Place'}
                                  </span>
                                  <Badge className={`${getGradeColor(scorer.percentage || 0)} text-white font-semibold`}>
                                    {scorer.percentage || 0}%
                                  </Badge>
                                </div>
                                <div className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 truncate">
                                  {scorer.student?.full_name}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  {scorer.marks_obtained}/{scorer.total_marks} marks
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Low Performers */}
                      {stats.lowScorers.length > 0 && (
                        <div className="space-y-6">
                          <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                            <div className="p-2 bg-red-500 rounded-lg">
                              <TrendingDown className="h-5 w-5 text-white" />
                            </div>
                            Students Needing Support (&lt;40%)
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {stats.lowScorers.map((scorer) => (
                              <div
                                key={scorer.id}
                                className="p-6 rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20 dark:border-red-700 transition-all hover:shadow-md"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                                    Needs Support
                                  </span>
                                  <Badge className={`${getGradeColor(scorer.percentage || 0)} text-white font-semibold`}>
                                    {scorer.percentage || 0}%
                                  </Badge>
                                </div>
                                <div className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 truncate">
                                  {scorer.student?.full_name}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  {scorer.marks_obtained}/{scorer.total_marks} marks
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                        <Users className="h-8 w-8 text-slate-400" />
                      </div>
                      <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No Results Yet</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-base max-w-md mx-auto leading-relaxed">
                        No student results have been recorded for this test. Results will appear here once students complete the assessment.
                      </p>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}
