
import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, BookOpen, Users, BarChart3, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TopicSelection() {
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("class");
  const subjectId = searchParams.get("subject");
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("all");

  const getChapterName = (id: string) => {
    const chapters = {
      algebra: "Algebra",
      geometry: "Geometry",
      trigonometry: "Trigonometry",
      statistics: "Statistics",
      probability: "Probability",
      physics: "Physics - Motion",
      chemistry: "Chemistry - Atoms",
      biology: "Biology - Life Processes"
    };
    return chapters[id as keyof typeof chapters] || id;
  };

  const getTopics = (chapterId: string) => {
    const algebraTopics = [
      { id: "linear-equations", name: "Linear Equations", questions: 45, difficulty: "Easy", type: "Conceptual", lastUsed: "2 days ago" },
      { id: "quadratic-equations", name: "Quadratic Equations", questions: 38, difficulty: "Medium", type: "Problem Solving", lastUsed: "1 week ago" },
      { id: "polynomials", name: "Polynomials", questions: 42, difficulty: "Medium", type: "Application", lastUsed: "3 days ago" },
      { id: "factorization", name: "Factorization", questions: 35, difficulty: "Easy", type: "Conceptual", lastUsed: "Today" },
      { id: "algebraic-expressions", name: "Algebraic Expressions", questions: 40, difficulty: "Easy", type: "Computational", lastUsed: "5 days ago" }
    ];

    const geometryTopics = [
      { id: "triangles", name: "Properties of Triangles", questions: 50, difficulty: "Medium", type: "Proof-based", lastUsed: "1 day ago" },
      { id: "circles", name: "Circle Theorems", questions: 45, difficulty: "Hard", type: "Application", lastUsed: "4 days ago" },
      { id: "coordinate-geometry", name: "Coordinate Geometry", questions: 40, difficulty: "Medium", type: "Problem Solving", lastUsed: "2 days ago" },
      { id: "area-perimeter", name: "Area and Perimeter", questions: 35, difficulty: "Easy", type: "Computational", lastUsed: "6 days ago" }
    ];

    if (chapterId === "algebra") return algebraTopics;
    if (chapterId === "geometry") return geometryTopics;
    
    return [
      { id: "topic1", name: "Topic 1", questions: 30, difficulty: "Medium", type: "Conceptual", lastUsed: "3 days ago" },
      { id: "topic2", name: "Topic 2", questions: 25, difficulty: "Easy", type: "Application", lastUsed: "1 week ago" },
      { id: "topic3", name: "Topic 3", questions: 35, difficulty: "Hard", type: "Problem Solving", lastUsed: "2 days ago" }
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Conceptual": return "bg-blue-100 text-blue-800";
      case "Application": return "bg-purple-100 text-purple-800";
      case "Problem Solving": return "bg-orange-100 text-orange-800";
      case "Computational": return "bg-teal-100 text-teal-800";
      case "Proof-based": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const topics = getTopics(chapterId || "");
  const chapterName = getChapterName(chapterId || "");

  const filteredTopics = filterType === "all" 
    ? topics 
    : topics.filter(topic => topic.type.toLowerCase().replace(" ", "-") === filterType);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold">
              {chapterName} Topics - Class {classId}
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose a topic to access the comprehensive question bank
            </p>
          </div>
          <Badge variant="secondary" className="self-start sm:self-center">
            {filteredTopics.reduce((acc, topic) => acc + topic.questions, 0)} questions
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="conceptual">Conceptual</SelectItem>
              <SelectItem value="application">Application</SelectItem>
              <SelectItem value="problem-solving">Problem Solving</SelectItem>
              <SelectItem value="computational">Computational</SelectItem>
              <SelectItem value="proof-based">Proof-based</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredTopics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={getDifficultyColor(topic.difficulty)} variant="secondary">
                      {topic.difficulty}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-base sm:text-lg leading-tight">{topic.name}</CardTitle>
                <Badge className={getTypeColor(topic.type)} variant="outline">
                  {topic.type}
                </Badge>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                <div className="mb-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Questions:</span>
                    <span className="font-medium">{topic.questions}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>Teacher Resource Bank</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <span>Last used: {topic.lastUsed}</span>
                  </div>
                </div>
                <Button 
                  className="w-full group-hover:bg-primary/90"
                  onClick={() => navigate(`/questions/topic/${topic.id}?class=${classId}&subject=${subjectId}&chapter=${chapterId}`)}
                >
                  View Questions
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No topics found for the selected filter.</p>
            <Button variant="outline" onClick={() => setFilterType("all")}>
              Show All Topics
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
