
import React, { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Clock, Star, Trophy, Filter, ChevronLeft, ChevronRight, Heart, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useQuestions, useTopics, useChapters, useUpdateQuestionFavorite } from "@/hooks/useQuestions";
import { Skeleton } from "@/components/ui/skeleton";
import { MathJaxRenderer } from "./MathJaxRenderer";
import { toast } from "sonner";

export function QuestionBank() {
  const { topicId } = useParams();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("class");
  const subjectId = searchParams.get("subject");
  const chapterId = searchParams.get("chapter");
  const navigate = useNavigate();
  
  const [filterType, setFilterType] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  
  const { data: questions, isLoading, error, refetch } = useQuestions(topicId || "");
  const { data: topics } = useTopics(chapterId || "");
  const { data: chapters } = useChapters(subjectId || "");
  const updateFavoriteMutation = useUpdateQuestionFavorite();
  
  const topicName = topics?.find(t => t.id === topicId)?.name || "Topic";
  const chapterName = chapters?.find(c => c.id === chapterId)?.name || "Chapter";

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "MCQ": return "bg-blue-100 text-blue-800";
      case "Short Answer": return "bg-purple-100 text-purple-800";
      case "Long Answer": return "bg-orange-100 text-orange-800";
      case "Numerical": return "bg-teal-100 text-teal-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredQuestions = questions?.filter(question => {
    const typeMatch = filterType === "all" || question.type === filterType;
    const difficultyMatch = filterDifficulty === "all" || question.difficulty === filterDifficulty;
    return typeMatch && difficultyMatch;
  });

  const currentQuestion = filteredQuestions?.[currentQuestionIndex];

  const handleFavoriteToggle = async (questionId: string, currentFavorite: boolean) => {
    try {
      await updateFavoriteMutation.mutateAsync({
        questionId,
        isFavorite: !currentFavorite
      });
      toast.success(!currentFavorite ? "Question bookmarked!" : "Bookmark removed");
      refetch(); // Refresh the questions data
    } catch (error) {
      toast.error("Failed to update bookmark");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleNextQuestion = () => {
    if (filteredQuestions && currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">
                {topicName} Questions - Class {classId}
              </h3>
              <p className="text-sm text-muted-foreground">
                Practice questions from {chapterName}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-red-600">Error loading questions: {error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!filteredQuestions || filteredQuestions.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">
                {topicName} Questions - Class {classId}
              </h3>
              <p className="text-sm text-muted-foreground">
                Practice questions from {chapterName}
              </p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No questions found for the selected filters.</p>
            <Button variant="outline" onClick={() => {
              setFilterType("all");
              setFilterDifficulty("all");
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold">
              {topicName} Questions - Class {classId}
            </h3>
            <p className="text-sm text-muted-foreground">
              Practice questions from {chapterName}
            </p>
          </div>
          <Badge variant="secondary" className="self-start sm:self-center">
            {filteredQuestions.length} questions
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="MCQ">MCQ</SelectItem>
              <SelectItem value="Short Answer">Short Answer</SelectItem>
              <SelectItem value="Long Answer">Long Answer</SelectItem>
              <SelectItem value="Numerical">Numerical</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Question Navigation */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Question {currentQuestionIndex + 1} of {filteredQuestions.length}</h4>
                <p className="text-sm text-muted-foreground">
                  {currentQuestion?.estimatedTime} • {currentQuestion?.marks} marks
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => currentQuestion && handleFavoriteToggle(currentQuestion.id, currentQuestion.is_favorite)}
                className="h-9 w-9"
              >
                <Heart 
                  className={`h-4 w-4 ${currentQuestion?.is_favorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                />
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === filteredQuestions.length - 1}
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Question Display */}
      {currentQuestion && (
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className={getDifficultyColor(currentQuestion.difficulty)} variant="secondary">
                  {currentQuestion.difficulty}
                </Badge>
                <Badge className={getTypeColor(currentQuestion.type)} variant="outline">
                  {currentQuestion.type}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {currentQuestion.estimatedTime}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  <Trophy className="h-3 w-3 mr-1" />
                  {currentQuestion.marks} marks
                </Badge>
              </div>
              <CardTitle className="text-base sm:text-lg leading-relaxed">
                <MathJaxRenderer content={currentQuestion.question} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Options for MCQ */}
              {currentQuestion.type === "MCQ" && currentQuestion.options && (
                <div className="space-y-3">
                  <h5 className="font-medium text-sm text-muted-foreground">Options:</h5>
                  <div className="grid gap-2">
                    {currentQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <div className="flex-1">
                          <MathJaxRenderer content={option} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Answer Section */}
              <Tabs value={showAnswer ? "answer" : "question"} onValueChange={(value) => setShowAnswer(value === "answer")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="question">Question</TabsTrigger>
                  <TabsTrigger value="answer">Answer & Explanation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="question" className="mt-4">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Try solving this question first, then check the answer and explanation.
                    </p>
                    <Button onClick={() => setShowAnswer(true)}>
                      Show Answer
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="answer" className="mt-4 space-y-4">
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <h5 className="font-medium text-green-800 mb-2">Answer:</h5>
                    <div className="text-green-700">
                      <MathJaxRenderer content={currentQuestion.answer} />
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <h5 className="font-medium text-blue-800 mb-2">Explanation:</h5>
                    <div className="text-blue-700">
                      <MathJaxRenderer content={currentQuestion.explanation} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Source: {currentQuestion.source}
                    </div>
                    <Button variant="outline" onClick={() => setShowAnswer(false)}>
                      Hide Answer
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Question Navigation Footer */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {filteredQuestions.length}
              </span>
            </div>
            
            <Button
              variant="outline"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === filteredQuestions.length - 1}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
