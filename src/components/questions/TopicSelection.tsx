
import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, BookOpen, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTopics, useChapters } from "@/hooks/useQuestions";
import { Skeleton } from "@/components/ui/skeleton";

export function TopicSelection() {
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("class");
  const subjectId = searchParams.get("subject");
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("all");
  
  const { data: topics, isLoading, error } = useTopics(chapterId || "");
  const { data: chapters } = useChapters(subjectId || "");
  
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
      case "Conceptual": return "bg-blue-100 text-blue-800";
      case "Application": return "bg-purple-100 text-purple-800";
      case "Problem Solving": return "bg-orange-100 text-orange-800";
      case "Computational": return "bg-teal-100 text-teal-800";
      case "Proof-based": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTopics = filterType === "all" 
    ? topics 
    : topics?.filter(topic => topic.type.toLowerCase().replace(" ", "-") === filterType);

  if (isLoading) {
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
        <p className="text-red-600">Error loading topics: {error.message}</p>
      </div>
    );
  }

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
            {filteredTopics?.reduce((acc, topic) => acc + topic.questions, 0)} questions
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
        {filteredTopics?.map((topic, index) => (
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
                    <span>Last used: {topic.last_used}</span>
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

      {filteredTopics && filteredTopics.length === 0 && (
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
