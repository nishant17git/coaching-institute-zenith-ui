
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentCard } from "@/components/ui/student-card";
import { Search, Plus, Filter, Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddStudentForm } from "@/components/ui/add-student-form";
import { useData } from "@/contexts/DataContext";
import { exportStudentsToPDF, type StudentPDFOptions } from "@/services/pdfService";
import { toast } from "sonner";

// Institute logo (placeholder)
const INSTITUTE_LOGO = "https://placehold.co/200x200/4F46E5/FFFFFF?text=IC";

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [currentView, setCurrentView] = useState<"all" | "pending">("all");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const navigate = useNavigate();
  
  const { students, classes } = useData();

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
  
  const handleExportPDF = () => {
    if (filteredStudents.length === 0) {
      toast.error("No students to export");
      return;
    }
    
    // Create title based on filters
    let title = "Student List";
    let subtitle = "";
    
    if (selectedClass !== "all") {
      title += ` - ${selectedClass}`;
    }
    
    if (currentView === "pending") {
      subtitle = "Fee Pending Students";
    }
    
    const options: StudentPDFOptions = {
      students: filteredStudents,
      title,
      subtitle,
      logo: INSTITUTE_LOGO
    };
    
    exportStudentsToPDF(options);
    
    toast.success("Student list exported successfully!");
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleExportPDF}
            className="hidden sm:flex gap-2"
          >
            <Download className="h-4 w-4" /> Export PDF
          </Button>
          <Button 
            onClick={() => setIsAddStudentOpen(true)}
            className="bg-apple-blue hover:bg-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Student
          </Button>
        </div>
      </div>
      
      <AddStudentForm
        open={isAddStudentOpen}
        onOpenChange={setIsAddStudentOpen}
      />
      
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
        <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
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
      
      <div className="sm:hidden flex justify-center mt-4">
        <Button 
          variant="outline"
          onClick={handleExportPDF}
          className="w-full flex gap-2 justify-center"
        >
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </div>
    </div>
  );
}
