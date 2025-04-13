
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, UserPlus, CheckCircle, Search, Filter, Download } from "lucide-react";
import { students } from "@/mock/data";
import { toast } from "sonner";

// Sample test data
const testRecords = [
  { 
    id: "1", 
    name: "Mid Term Test - Math", 
    date: "2024-03-15", 
    class: "Class 10",
    subject: "Mathematics",
    maxMarks: 100
  },
  { 
    id: "2", 
    name: "Science Quarterly", 
    date: "2024-02-22", 
    class: "Class 8",
    subject: "Science",
    maxMarks: 50
  },
  { 
    id: "3", 
    name: "English Essay Competition", 
    date: "2024-01-10", 
    class: "Class 9",
    subject: "English",
    maxMarks: 25
  },
  { 
    id: "4", 
    name: "History Final", 
    date: "2023-12-05", 
    class: "Class 7",
    subject: "Social Studies",
    maxMarks: 75
  },
];

// Generate random marks for students
const studentMarks = students.map(student => ({
  studentId: student.id,
  studentName: student.name,
  class: student.class,
  testRecords: [
    { testId: "1", marks: Math.floor(Math.random() * 30) + 70 }, // 70-100 range
    { testId: "2", marks: Math.floor(Math.random() * 20) + 30 }, // 30-50 range
    { testId: "3", marks: Math.floor(Math.random() * 10) + 15 }, // 15-25 range
    { testId: "4", marks: Math.floor(Math.random() * 25) + 50 }, // 50-75 range
  ]
}));

export default function TestRecord() {
  const [activeTab, setActiveTab] = useState("view");
  const [selectedTest, setSelectedTest] = useState(testRecords[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  
  // Filter students based on search and class filter
  const filteredStudents = studentMarks.filter(student => {
    const matchesSearch = student.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === "all" || student.class === filterClass;
    return matchesSearch && matchesClass;
  });
  
  // Find the currently selected test
  const currentTest = testRecords.find(test => test.id === selectedTest);
  
  // Handle mark change
  const handleMarkChange = (studentId: string, newMark: string) => {
    const mark = parseInt(newMark);
    if (isNaN(mark)) return;
    
    if (mark < 0 || mark > (currentTest?.maxMarks || 100)) {
      toast.error(`Marks must be between 0 and ${currentTest?.maxMarks || 100}`);
      return;
    }
    
    // In a real app, this would update the mark in the database
    toast.success(`Updated marks for student ID: ${studentId}`);
  };
  
  // Export test record
  const exportTestRecord = () => {
    toast.success("Test record exported successfully!");
  };

  return (
    <div className="space-y-6 animate-slide-up pb-16 md:pb-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Test Records</h1>
      </div>
      
      <Tabs defaultValue="view" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            View Test Records
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            New Test
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterClass} onValueChange={setFilterClass}>
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-3.5 w-3.5" />
                        <SelectValue placeholder="Filter by class" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="Class 2">Class 2</SelectItem>
                      <SelectItem value="Class 3">Class 3</SelectItem>
                      <SelectItem value="Class 4">Class 4</SelectItem>
                      <SelectItem value="Class 5">Class 5</SelectItem>
                      <SelectItem value="Class 6">Class 6</SelectItem>
                      <SelectItem value="Class 7">Class 7</SelectItem>
                      <SelectItem value="Class 8">Class 8</SelectItem>
                      <SelectItem value="Class 9">Class 9</SelectItem>
                      <SelectItem value="Class 10">Class 10</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={exportTestRecord}
                    className="shrink-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Select value={selectedTest} onValueChange={setSelectedTest}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a test" />
                </SelectTrigger>
                <SelectContent>
                  {testRecords.map((test) => (
                    <SelectItem key={test.id} value={test.id}>
                      {test.name} - {test.class} ({test.date})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {currentTest && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>{currentTest.name}</CardTitle>
                <CardDescription>
                  {currentTest.class} • {currentTest.subject} • {currentTest.date} • Max Marks: {currentTest.maxMarks}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Student</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead className="text-right">Marks</TableHead>
                          <TableHead className="text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => {
                            const testMark = student.testRecords.find(
                              (test) => test.testId === selectedTest
                            );
                            const percentage = testMark
                              ? ((testMark.marks / currentTest.maxMarks) * 100).toFixed(1)
                              : "0";
                              
                            return (
                              <TableRow key={student.studentId}>
                                <TableCell className="font-medium">
                                  {student.studentName}
                                </TableCell>
                                <TableCell>{student.class}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Input
                                      type="number"
                                      className="w-16 text-right"
                                      defaultValue={testMark?.marks || 0}
                                      onChange={(e) => handleMarkChange(student.studentId, e.target.value)}
                                      min={0}
                                      max={currentTest.maxMarks}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                      / {currentTest.maxMarks}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <span
                                    className={
                                      parseInt(percentage) >= 75
                                        ? "text-green-600"
                                        : parseInt(percentage) >= 50
                                        ? "text-amber-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {percentage}%
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                              No students match the current filter criteria.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Test</CardTitle>
              <CardDescription>Add a new test record to the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="testName" className="text-sm font-medium">Test Name</label>
                  <Input id="testName" placeholder="e.g., Mid Term Math Test" />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="testDate" className="text-sm font-medium">Test Date</label>
                  <Input id="testDate" type="date" />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="testClass" className="text-sm font-medium">Class</label>
                  <Select>
                    <SelectTrigger id="testClass">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Class 2">Class 2</SelectItem>
                      <SelectItem value="Class 3">Class 3</SelectItem>
                      <SelectItem value="Class 4">Class 4</SelectItem>
                      <SelectItem value="Class 5">Class 5</SelectItem>
                      <SelectItem value="Class 6">Class 6</SelectItem>
                      <SelectItem value="Class 7">Class 7</SelectItem>
                      <SelectItem value="Class 8">Class 8</SelectItem>
                      <SelectItem value="Class 9">Class 9</SelectItem>
                      <SelectItem value="Class 10">Class 10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="testSubject" className="text-sm font-medium">Subject</label>
                  <Select>
                    <SelectTrigger id="testSubject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Social Studies">Social Studies</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="maxMarks" className="text-sm font-medium">Maximum Marks</label>
                  <Input id="maxMarks" type="number" min="1" placeholder="e.g., 100" />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="testDuration" className="text-sm font-medium">Duration (minutes)</label>
                  <Input id="testDuration" type="number" min="15" placeholder="e.g., 120" />
                </div>
              </div>
            </CardContent>
            <div className="px-6 py-4 flex justify-end">
              <Button className="flex items-center gap-2" onClick={() => toast.success("New test created successfully!")}>
                <CheckCircle className="w-4 h-4" />
                Create Test
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
