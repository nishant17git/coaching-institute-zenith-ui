
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Target, TrendingUp, Users, Search, Download, Clock, CheckCircle, Star, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function QuestionsHome() {
  const navigate = useNavigate();

  const classes = [
    {
      id: "9",
      name: "Class 9",
      description: "Foundation concepts and comprehensive problem sets",
      subjects: 5,
      questions: 2850,
      icon: BookOpen,
      color: "bg-blue-500",
      questionTypes: ["MCQ", "Short Answer", "Long Answer", "Numerical"],
      completionRate: 85
    },
    {
      id: "10",
      name: "Class 10", 
      description: "Board exam preparation with extensive question bank",
      subjects: 5,
      questions: 3200,
      icon: GraduationCap,
      color: "bg-green-500",
      questionTypes: ["MCQ", "Short Answer", "Long Answer", "Case Studies"],
      completionRate: 78
    }
  ];

  const quickStats = [
    {
      title: "Total Questions",
      value: "6,050+",
      description: "Ready to use",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Question Sets",
      value: "45",
      description: "Created this month",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Time Saved",
      value: "120hrs",
      description: "This academic year",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Export Downloads",
      value: "1,200+",
      description: "Question sets exported",
      icon: Download,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const recentActivity = [
    { subject: "Mathematics", chapter: "Algebra", questions: 45, date: "Today", starred: 12 },
    { subject: "Science", chapter: "Physics - Motion", questions: 38, date: "Yesterday", starred: 8 },
    { subject: "English", chapter: "Grammar", questions: 52, date: "2 days ago", starred: 15 }
  ];

  const favoriteTopics = [
    { name: "Linear Equations", subject: "Mathematics", questions: 45, lastUsed: "Today" },
    { name: "Physics - Motion", subject: "Science", questions: 38, lastUsed: "Yesterday" },
    { name: "Grammar Fundamentals", subject: "English", questions: 52, lastUsed: "2 days ago" }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Select Class Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg sm:text-xl font-semibold">Select Class to Begin</h3>
          <Badge variant="secondary" className="self-start sm:self-center">Choose your target class</Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {classes.map((classItem, index) => (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-lg ${classItem.color} text-white`}>
                      <classItem.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <Badge variant="outline" className="text-xs sm:text-sm">{classItem.subjects} subjects</Badge>
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{classItem.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {classItem.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground text-base sm:text-lg">
                          {classItem.questions.toLocaleString()}
                        </span> questions available
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {classItem.questionTypes.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full group-hover:bg-primary/90"
                      onClick={() => navigate(`/questions/class/${classItem.id}`)}
                    >
                      Explore Question Bank
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Teacher's Question Bank Header */}
      <div className="text-center space-y-3 sm:space-y-4 py-4 sm:py-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Teacher's Question Bank</h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
          Your comprehensive teaching resource with thousands of curated questions. 
          Create assignments, tests, and practice materials efficiently.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-center mb-3">
                  <div className={`p-2 sm:p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {stat.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity and Favorites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg bg-muted/50 gap-2">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="font-medium text-sm sm:text-base">{activity.subject}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">•</span>
                      <span className="text-sm text-muted-foreground">{activity.chapter}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs">{activity.starred}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{activity.questions} questions</Badge>
                    <span className="text-xs text-muted-foreground">{activity.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Favorite Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              Favorite Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {favoriteTopics.map((topic, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg bg-muted/50 gap-2">
                  <div className="flex-1">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm sm:text-base">{topic.name}</span>
                      <span className="text-xs text-muted-foreground">{topic.subject}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <Badge variant="outline" className="text-xs">{topic.questions} questions</Badge>
                    <span className="text-xs text-muted-foreground">{topic.lastUsed}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="p-4 sm:p-6 text-center">
            <Search className="h-8 w-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium mb-1">Search Questions</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Find specific topics quickly</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="p-4 sm:p-6 text-center">
            <Download className="h-8 w-8 mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium mb-1">Export Sets</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Download question collections</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="p-4 sm:p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium mb-1">Analytics</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Track usage patterns</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
