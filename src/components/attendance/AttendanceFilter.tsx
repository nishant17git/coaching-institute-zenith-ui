import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Users } from "lucide-react";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/useDebounce";

interface AttendanceFilterProps {
  filterType: "all" | "class" | "student";
  setFilterType: (type: "all" | "class" | "student") => void;
  selectedClass: string;
  setSelectedClass: (className: string) => void;
  selectedStudent: string | null;
  setSelectedStudent: (studentId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  classes: Array<{ id: string; name: string }>;
  students: Array<{ id: string; name: string; class: string }>;
}

export function AttendanceFilter({
  filterType,
  setFilterType,
  selectedClass,
  setSelectedClass,
  selectedStudent,
  setSelectedStudent,
  searchQuery,
  setSearchQuery,
  selectedDate,
  setSelectedDate,
  classes,
  students
}: AttendanceFilterProps) {
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  const prevDay = () => {
    setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)));
  };

  const nextDay = () => {
    setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)));
  };

  // Filter out any classes with empty or invalid names
  const validClasses = classes.filter(cls => cls.name && cls.name.trim() !== "");
  
  // Filter out any students with empty or invalid data
  const filteredStudents = students.filter(student => 
    student.id && student.id.trim() !== "" && 
    student.name && student.name.trim() !== "" &&
    (
      !debouncedSearchQuery || 
      student.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      student.class.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    )
  );

  return (
    <Card className="glass-card border border-gray-200">
      <CardContent className="py-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Tabs value={filterType} onValueChange={(value) => setFilterType(value as any)}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> All
                </TabsTrigger>
                <TabsTrigger value="class" className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Class
                </TabsTrigger>
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Student
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex-1">
            {filterType === "class" && (
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, class, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 transition-all focus:ring-2 focus:ring-primary/20"
                  />
                  {debouncedSearchQuery && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {filteredStudents.length}
                    </div>
                  )}
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {validClasses.map(cls => (
                      <SelectItem key={cls.id} value={cls.name}>{cls.name}</SelectItem>
                    ))}
                    <SelectItem value="Class 2">Class 2</SelectItem>
                    <SelectItem value="Class 3">Class 3</SelectItem>
                    <SelectItem value="Class 4">Class 4</SelectItem>
                    <SelectItem value="Class 5">Class 5</SelectItem>
                    <SelectItem value="Class 6">Class 6</SelectItem>
                    <SelectItem value="Class 7">Class 7</SelectItem>
                    <SelectItem value="Class 8">Class 8</SelectItem>
                    <SelectItem value="Class 9">Class 9</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {filterType === "student" && (
              <Select value={selectedStudent || ""} onValueChange={setSelectedStudent}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - {student.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {filterType === "all" && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, class, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 transition-all focus:ring-2 focus:ring-primary/20"
                />
                {debouncedSearchQuery && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {filteredStudents.length}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 self-end min-w-[160px]">
            <Button variant="outline" size="icon" onClick={prevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-sm font-medium flex-1 text-center">
              {format(selectedDate, "d MMM yyyy")}
            </p>
            <Button variant="outline" size="icon" onClick={nextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
