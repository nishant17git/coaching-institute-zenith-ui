
import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, ChevronDown, ChevronUp, Eye, Copy, Star, Clock, BookOpen, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { LaTeXRenderer } from "./LaTeXRenderer";
import { exportQuestionsToPDF } from "@/services/questionsPdfService";
import { useQuestions, useTopics, useUpdateQuestionFavorite, Question } from "@/hooks/useQuestions";
import { Skeleton } from "@/components/ui/skeleton";

export function QuestionBank() {
  const { topicId } = useParams();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("class");
  const subjectId = searchParams.get("subject");
  const chapterId = searchParams.get("chapter");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [favoriteQuestions, setFavoriteQuestions] = useState<Set<string>>(new Set());
  
  const { data: questions, isLoading, error } = useQuestions(topicId || "");
  const { data: topics } = useTopics(chapterId || "");
  const updateQuestionFavorite = useUpdateQuestionFavorite();
  
  const topicName = topics?.find(t => t.id === topicId)?.name || "Topic";

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "MCQ":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Short Answer":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Long Answer":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Numerical":
        return "bg-teal-100 text-teal-800 border-teal-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredQuestions = questions?.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "all" || question.difficulty.toLowerCase() === selectedDifficulty;
    const matchesType = selectedType === "all" || question.type.toLowerCase().replace(" ", "-") === selectedType;
    return matchesSearch && matchesDifficulty && matchesType;
  }) || [];

  const toggleExpanded = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const toggleFavorite = async (question: Question) => {
    const newFavorites = new Set(favoriteQuestions);
    const isFavorite = !question.is_favorite;
    
    try {
      await updateQuestionFavorite(question.id, isFavorite);
      
      if (isFavorite) {
        newFavorites.add(question.id);
        toast.success("Question added to favorites");
      } else {
        newFavorites.delete(question.id);
        toast.success("Question removed from favorites");
      }
      setFavoriteQuestions(newFavorites);
    } catch (error) {
      toast.error("Failed to update favorite status");
    }
  };

  const handleExport = () => {
    if (!filteredQuestions.length) {
      toast.error("No questions to export");
      return;
    }

    exportQuestionsToPDF({
      questions: filteredQuestions,
      topicName: topicName,
      className: `Class ${classId}`,
      subjectName: subjectId || "Unknown Subject",
      chapterName: chapterId || "Unknown Chapter",
      instituteName: "Professional Teaching Institute",
      teacherName: "Teacher"
    });
    toast.success(`Exported ${filteredQuestions.length} questions to PDF successfully!`);
  };

  const handleCopyQuestion = (question: Question) => {
    const questionText = `Question: ${question.question}\nAnswer: ${question.answer}\nExplanation: ${question.explanation}`;
    navigator.clipboard.writeText(questionText);
    toast.success("Question copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading questions: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold">
              <LaTeXRenderer content={topicName} /> - Question Bank
            </h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive collection of questions for educators
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Badge variant="secondary" className="text-xs sm:text-sm">
              {filteredQuestions.length} questions
            </Badge>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Question Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="mcq">MCQ</SelectItem>
                    <SelectItem value="short-answer">Short Answer</SelectItem>
                    <SelectItem value="long-answer">Long Answer</SelectItem>
                    <SelectItem value="numerical">Numerical</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={getDifficultyColor(question.difficulty)} variant="secondary">
                        {question.difficulty}
                      </Badge>
                      <Badge className={getTypeColor(question.type)} variant="outline">
                        {question.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {question.marks} marks
                      </Badge>
                    </div>
                    <div className="text-sm sm:text-base">
                      <LaTeXRenderer content={question.question} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(question)}
                      className="text-muted-foreground hover:text-yellow-600"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          question.is_favorite ? "fill-yellow-400 text-yellow-400" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyQuestion(question)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(question.id)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      {expandedQuestions.has(question.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedQuestions.has(question.id) && (
                <CardContent className="pt-0">
                  {question.options && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Options:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {question.options.map((option, i) => (
                          <div key={i} className="text-sm p-2 bg-muted/50 rounded">
                            {String.fromCharCode(65 + i)}. <LaTeXRenderer content={option} inline />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">Answer:</p>
                      <div className="text-sm bg-green-50 p-3 rounded">
                        <LaTeXRenderer content={question.answer} />
                      </div>
                    </div>

                    {question.explanation && (
                      <div>
                        <p className="text-sm font-medium text-blue-700 mb-1">Explanation:</p>
                        <div className="text-sm bg-blue-50 p-3 rounded">
                          <LaTeXRenderer content={question.explanation} />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground gap-2">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{question.estimated_time}</span>
                        </div>
                        {question.source && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{question.source}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No questions found matching your criteria.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedDifficulty("all");
                setSelectedType("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
