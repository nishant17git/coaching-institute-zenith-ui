
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Calculator, Beaker, Globe, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SubjectSelection() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const subjects = [
    {
      id: "mathematics",
      name: "Mathematics",
      description: "Algebra, Geometry, Trigonometry",
      icon: Calculator,
      questions: classId === "9" ? 120 : 140,
      chapters: classId === "9" ? 15 : 16,
      color: "bg-purple-500",
      recentActivity: "Updated 2 hours ago"
    },
    {
      id: "science", 
      name: "Science",
      description: "Physics, Chemistry, Biology",
      icon: Beaker,
      questions: classId === "9" ? 150 : 170,
      chapters: classId === "9" ? 18 : 20,
      color: "bg-green-500",
      recentActivity: "Updated yesterday"
    },
    {
      id: "english",
      name: "English",
      description: "Grammar, Literature, Writing",
      icon: BookOpen,
      questions: classId === "9" ? 80 : 90,
      chapters: classId === "9" ? 12 : 14,
      color: "bg-blue-500",
      recentActivity: "Updated 3 days ago"
    },
    {
      id: "social-science",
      name: "Social Science",
      description: "History, Geography, Civics",
      icon: Globe,
      questions: classId === "9" ? 70 : 80,
      chapters: classId === "9" ? 10 : 12,
      color: "bg-orange-500",
      recentActivity: "Updated 1 week ago"
    },
    {
      id: "hindi",
      name: "Hindi",
      description: "व्याकरण, साहित्य, लेखन",
      icon: Users,
      questions: classId === "9" ? 60 : 70,
      chapters: classId === "9" ? 8 : 10,
      color: "bg-red-500",
      recentActivity: "Updated 4 days ago"
    }
  ];

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
          {subjects.reduce((acc, subject) => acc + subject.questions, 0)} total questions
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {subjects.map((subject, index) => (
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
                    <subject.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <Badge variant="outline" className="text-xs sm:text-sm">{subject.chapters} chapters</Badge>
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
        ))}
      </div>
    </div>
  );
}
