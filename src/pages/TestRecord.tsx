
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Loader2, FileSpreadsheet } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

export default function TestRecord() {
  const { students, isLoading } = useData();
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Sample test data - in a real app, this would come from the database
  const testRecords = [
    { id: 1, name: "Rahul Sharma", class: "Class 10", subject: "Mathematics", marks: 85, totalMarks: 100, date: "2023-09-15" },
    { id: 2, name: "Priya Patel", class: "Class 11", subject: "Physics", marks: 78, totalMarks: 100, date: "2023-09-15" },
    { id: 3, name: "Amit Singh", class: "Class 12", subject: "Chemistry", marks: 72, totalMarks: 100, date: "2023-09-15" },
    { id: 4, name: "Neha Verma", class: "Class 9", subject: "English", marks: 95, totalMarks: 100, date: "2023-09-14" },
    { id: 5, name: "Rohit Agarwal", class: "Class 12", subject: "Biology", marks: 88, totalMarks: 100, date: "2023-09-14" },
    { id: 6, name: "Ananya Mehta", class: "Class 11", subject: "History", marks: 76, totalMarks: 100, date: "2023-09-14" },
  ];
  
  // Filter test records based on search term and class
  const filteredRecords = testRecords.filter(record => {
    const matchesSearch = 
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = selectedClass === "all" || record.class === `Class ${selectedClass}`;
    
    return matchesSearch && matchesClass;
  });
  
  // Form for adding new test records
  const AddTestRecordForm = () => {
    const form = useForm({
      defaultValues: {
        student: "",
        subject: "",
        marks: "",
        totalMarks: "100",
        date: new Date().toISOString().split('T')[0],
      }
    });
    
    const onSubmit = (data: any) => {
      console.log("Adding test record:", data);
      // In a real app, this would add the record to the database
      setIsAddDialogOpen(false);
    };
    
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="student"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.class})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Social Studies">Social Studies</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="marks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marks Obtained</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} required min="0" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="totalMarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Marks</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} required min="1" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Record</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Test Records</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Test
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {Array.from({ length: 9 }, (_, i) => i + 2).map((cls) => (
              <SelectItem key={cls} value={cls.toString()}>
                Class {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No test records found. {!searchTerm && selectedClass === "all" && "Add a new test record by clicking the 'Add Test' button."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="hidden sm:table-cell">Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-right">Marks</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{record.class}</TableCell>
                  <TableCell>{record.subject}</TableCell>
                  <TableCell className="text-right">
                    <span className={
                      (record.marks / record.totalMarks) >= 0.75 ? "text-apple-green" :
                      (record.marks / record.totalMarks) >= 0.50 ? "text-apple-yellow" :
                      "text-apple-red"
                    }>
                      {record.marks}/{record.totalMarks}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {new Date(record.date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Add Test Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Test Record</DialogTitle>
            <DialogDescription>
              Enter the test details for the student.
            </DialogDescription>
          </DialogHeader>
          <AddTestRecordForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
