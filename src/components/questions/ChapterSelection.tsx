
import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Book, FileText, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function ChapterSelection() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("class");
  const navigate = useNavigate();

  const getSubjectName = (id: string) => {
    const subjects = {
      mathematics: "Mathematics",
      science: "Science", 
      english: "English",
      "social-science": "Social Science",
      hindi: "Hindi"
    };
    return subjects[id as keyof typeof subjects] || id;
  };

  const getChapters = (subject: string, classNum: string) => {
    const mathChapters = [
      { id: "algebra", name: "Algebra", topics: 15, questions: 240, difficulty: "Medium", estimatedTime: "45 min", progress: 85 },
      { id: "geometry", name: "Geometry", topics: 12, questions: 180, difficulty: "Hard", estimatedTime: "60 min", progress: 92 },
      { id: "trigonometry", name: "Trigonometry", topics: 10, questions: 150, difficulty: "Hard", estimatedTime: "50 min", progress: 78 },
      { id: "statistics", name: "Statistics", topics: 8, questions: 120, difficulty: "Easy", estimatedTime: "30 min", progress: 100 },
      { id: "probability", name: "Probability", topics: 6, questions: 90, difficulty: "Medium", estimatedTime: "35 min", progress: 65 }
    ];

    const scienceChapters = [
      { id: "physics", name: "Physics - Motion", topics: 18, questions: 280, difficulty: "Hard", estimatedTime: "55 min", progress: 88 },
      { id: "chemistry", name: "Chemistry - Atoms", topics: 14, questions: 210, difficulty: "Medium", estimatedTime: "40 min", progress: 95 },
      { id: "biology", name: "Biology - Life Processes", topics: 16, questions: 240, difficulty: "Medium", estimatedTime: "45 min", progress: 72 },
      { id: "light", name: "Light - Reflection", topics: 12, questions: 180, difficulty: "Easy", estimatedTime: "35 min", progress: 100 },
      { id: "heredity", name: "Heredity & Evolution", topics: 10, questions: 150, difficulty: "Hard", estimatedTime: "50 min", progress: 58 }
    ];

    const englishChapters = [
      { id: "grammar", name: "Grammar Fundamentals", topics: 20, questions: 300, difficulty: "Easy", estimatedTime: "40 min", progress: 90 },
      { id: "literature", name: "Literature Analysis", topics: 15, questions: 225, difficulty: "Medium", estimatedTime: "60 min", progress: 75 },
      { id: "writing", name: "Creative Writing", topics: 12, questions: 180, difficulty: "Medium", estimatedTime: "45 min", progress: 82 },
      { id: "comprehension", name: "Reading Comprehension", topics: 18, questions: 270, difficulty: "Easy", estimatedTime: "35 min", progress: 95 }
    ];

    if (subject === "mathematics") return mathChapters;
    if (subject === "science") return scienceChapters;
    if (subject === "english") return englishChapters;
    
    return [
      { id: "chapter1", name: "Chapter 1", topics: 10, questions: 150, difficulty: "Medium", estimatedTime: "40 min", progress: 80 },
      { id: "chapter2", name: "Chapter 2", topics: 12, questions: 180, difficulty: "Easy", estimatedTime: "35 min", progress: 65 }
    ];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const chapters = getChapters(subjectId || "", classId || "");
  const subjectName = getSubjectName(subjectId || "");

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
          {chapters.reduce((acc, chapter) => acc + chapter.questions, 0)} total questions
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {chapters.map((chapter, index) => (
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
                    <span>{chapter.estimatedTime}</span>
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
