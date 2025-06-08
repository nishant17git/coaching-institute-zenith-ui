
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calculator, Beaker, BookOpen, Globe, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubjects } from "@/hooks/useQuestions";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap = {
  Calculator,
  Beaker,
  BookOpen,
  Globe,
  Users,
};

export function SubjectSelection() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { data: subjects, isLoading, error } = useSubjects(classId || "");

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold">Class {classId} Subjects</h3>
            <p className="text-sm text-muted-foreground">
              Choose a subject to view available chapters
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading subjects: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold">Class {classId} Subjects</h3>
          <p className="text-sm text-muted-foreground">
            Choose a subject to view available chapters
          </p>
        </div>
        <Badge variant="secondary" className="self-start sm:self-center">
          {subjects?.reduce((acc, subject) => acc + subject.questions, 0)} total questions
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {subjects?.map((subject, index) => {
          const IconComponent = iconMap[subject.icon as keyof typeof iconMap] || BookOpen;
          
          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-lg ${subject.color} text-white`}>
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <Badge variant="outline" className="text-xs sm:text-sm">
                      {subject.chapters} chapters
                    </Badge>
                  </div>
                  <CardTitle className="text-base sm:text-lg">{subject.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {subject.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                  <div className="mb-4 space-y-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {subject.questions}
                      </span> questions available
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {subject.recentActivity}
                    </div>
                  </div>
                  <Button 
                    className="w-full group-hover:bg-primary/90"
                    onClick={() => navigate(`/questions/subject/${subject.id}?class=${classId}`)}
                  >
                    View Chapters
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
