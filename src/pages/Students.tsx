
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentCard } from "@/components/ui/student-card";
import { Search, Plus, Filter } from "lucide-react";
import { students, classes } from "@/mock/data";
import { Student } from "@/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [currentView, setCurrentView] = useState<"all" | "pending">("all");
  const navigate = useNavigate();

  // Filter students based on search query, class, and view
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         student.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.motherName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = selectedClass === "all" || student.class === selectedClass;
    
    const matchesView = currentView === "all" || 
                       (currentView === "pending" && student.feeStatus !== "Paid");
    
    return matchesSearch && matchesClass && matchesView;
  });

  const handleViewDetails = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
        <Button className="bg-apple-blue hover:bg-blue-600">
          <Plus className="h-4 w-4 mr-2" /> Add Student
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.name}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "all" | "pending")}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Students</TabsTrigger>
          <TabsTrigger value="pending">Fee Pending</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No students found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
