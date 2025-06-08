
import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Book, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useChapters, useSubjects } from "@/hooks/useQuestions";
import { Skeleton } from "@/components/ui/skeleton";

export function ChapterSelection() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("class");
  const navigate = useNavigate();
  
  const { data: chapters, isLoading, error } = useChapters(subjectId || "");
  const { data: subjects } = useSubjects(classId || "");
  
  const subjectName = subjects?.find(s => s.id === subjectId)?.name || "Subject";

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold">
              {subjectName} - Class {classId}
            </h3>
            <p className="text-sm text-muted-foreground">
              Select a chapter to explore topics and questions
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading chapters: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold">
            {subjectName} - Class {classId}
          </h3>
          <p className="text-sm text-muted-foreground">
            Select a chapter to explore topics and questions
          </p>
        </div>
        <Badge variant="secondary" className="self-start sm:self-center">
          {chapters?.reduce((acc, chapter) => acc + chapter.questions, 0)} total questions
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {chapters?.map((chapter, index) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Book className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <Badge className={getDifficultyColor(chapter.difficulty)} variant="secondary">
                    {chapter.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-base sm:text-lg">{chapter.name}</CardTitle>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{chapter.topics} topics</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{chapter.estimated_time}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                <div className="mb-4 space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {chapter.questions}
                    </span> questions available
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Question bank coverage</span>
                      <span className="font-medium">{chapter.progress}%</span>
                    </div>
                    <Progress value={chapter.progress} className="h-2" />
                  </div>
                </div>
                <Button 
                  className="w-full group-hover:bg-primary/90"
                  onClick={() => navigate(`/questions/chapter/${chapter.id}?class=${classId}&subject=${subjectId}`)}
                >
                  Explore Topics
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
