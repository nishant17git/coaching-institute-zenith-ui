import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { User, Search, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";

interface StudentAttendanceTabProps {
  students: any[];
  onStudentSelect: (student: any) => void;
  selectedClass: number;
  onClassChange: (value: string) => void;
}
export function StudentAttendanceTab({
  students,
  onStudentSelect,
  selectedClass,
  onClassChange
}: StudentAttendanceTabProps) {
  const [filteredStudents, setFilteredStudents] = useState(students);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();

  // Get appropriate height for student list based on number of students
  const getScrollAreaHeight = () => {
    const baseHeight = isMobile ? 400 : 460;
    const minHeight = isMobile ? 200 : 260;
    const maxHeight = isMobile ? 400 : 460;
    let dynamicHeight = filteredStudents.length * 60;
    return `${Math.max(minHeight, Math.min(dynamicHeight, maxHeight))}px`;
  };

  // Enhanced filter students with debounced search
  useEffect(() => {
    if (students) {
      let result = students;
      if (debouncedSearchQuery) {
        const searchLower = debouncedSearchQuery.toLowerCase().trim();
        result = students.filter(student => 
          student.full_name?.toLowerCase().includes(searchLower) ||
          student.roll_number?.toString().includes(searchLower) ||
          student.class?.toString().includes(searchLower) ||
          `class ${student.class}`.toLowerCase().includes(searchLower)
        );
      }
      setFilteredStudents(result);
    }
  }, [students, debouncedSearchQuery]);

  const getInitials = (name: string = "") => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };

  // Handle navigation to student details page
  const handleStudentClick = (student: any) => {
    if (student) {
      // First select the student in the parent component
      onStudentSelect(student);
      // Then navigate to the dedicated page
      navigate(`/students/${student.id}/attendance`);
    }
  };
  return <div className="w-full">
      {/* Students List */}
      <Card className="bg-white shadow-sm border">
        <CardHeader className="space-y-1 border-b px-[20px] py-[16px]">
          <CardTitle className="font-semibold text-lg">Students</CardTitle>
          <CardDescription className="text-xs">
            Select a student to view their attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, roll number, class..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  className="pl-9 h-9 transition-all focus:ring-2 focus:ring-primary/20" 
                />
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0" 
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                {debouncedSearchQuery && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {filteredStudents.length}
                  </div>
                )}
              </div>
              <Select value={selectedClass.toString()} onValueChange={onClassChange}>
                <SelectTrigger className="h-9 w-28">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({
                  length: 9
                }, (_, i) => i + 2).map(cls => <SelectItem key={cls} value={cls.toString()}>
                      Class {cls}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className={`rounded-md border`} style={{
          height: getScrollAreaHeight()
        }}>
            <div className="p-2">
              {filteredStudents && filteredStudents.length > 0 ? <AnimatePresence>
                  {filteredStudents.map((student, index) => <motion.div key={student.id} initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: index * 0.03
              }} className={cn("flex items-center p-2 rounded-lg cursor-pointer gap-3 mb-1 transition-all hover:bg-gray-50 border border-transparent")} onClick={() => handleStudentClick(student)}>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={cn(student.attendance_percentage >= 90 ? "bg-emerald-100 text-emerald-700" : student.attendance_percentage >= 75 ? "bg-blue-100 text-blue-700" : student.attendance_percentage >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>
                          {getInitials(student.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{student.full_name}</div>
                        <div className="text-xs text-muted-foreground flex gap-1 items-center">
                          <span>Roll #{student.roll_number || student.id.slice(-4)}</span>
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-300"></span>
                          <span>Class {student.class}</span>
                        </div>
                      </div>
                      <div className={cn("text-xs font-medium px-1.5 py-0.5 rounded", student.attendance_percentage >= 90 ? "bg-emerald-100 text-emerald-700" : student.attendance_percentage >= 75 ? "bg-blue-100 text-blue-700" : student.attendance_percentage >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>
                        {student.attendance_percentage || 0}%
                      </div>
                    </motion.div>)}
                </AnimatePresence> : <div className="text-center py-8 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No students found</p>
                </div>}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>;
}
