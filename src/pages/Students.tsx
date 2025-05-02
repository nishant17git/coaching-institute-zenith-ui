import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { studentService } from "@/services/studentService";
import { StudentRecord } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 
"@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 
"@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, 
DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from 
"@/components/ui/form";
import { useForm } from "react-hook-form";
import { Loader2, Plus, Search, Users, Rows3, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { StudentCardView } from "@/components/ui/student-card-view";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<StudentRecord | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  // Fetch students data
  const { data: students = [], isLoading, isError } = useQuery({
    queryKey: ['students'],
    queryFn: studentService.getStudents
  });
  
  // Filter students based on search term and class
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.guardian_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_number.toString().includes(searchTerm);
                          
    const matchesClass = selectedClass === "all" || student.class === parseInt(selectedClass);
    
    return matchesSearch && matchesClass;
  });
  
  // Mutations for CRUD operations
  const createStudentMutation = useMutation({
    mutationFn: studentService.createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsAddDialogOpen(false);
      toast.success("Student added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add student");
    }
  });
  
  const updateStudentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      studentService.updateStudent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsEditDialogOpen(false);
      toast.success("Student updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update student");
    }
  });
  
  const deleteStudentMutation = useMutation({
    mutationFn: studentService.deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsDeleteDialogOpen(false);
      toast.success("Student deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete student");
    }
  });
  
  // View student details
  const handleViewDetails = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };
  
  const handleEditStudent = (student: StudentRecord) => {
    setCurrentStudent(student);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteStudent = (student: StudentRecord) => {
    setCurrentStudent(student);
    setIsDeleteDialogOpen(true);
  };
  
  // Add student form
  const AddStudentForm = () => {
    const form = useForm({
      defaultValues: {
        full_name: "",
        class: 2,
        roll_number: "",
        date_of_birth: "",
        address: "",
        guardian_name: "",
        contact_number: ""
      }
    });
    
    const onSubmit = (data: any) => {
      createStudentMutation.mutate({
        ...data,
        class: parseInt(data.class),
        roll_number: parseInt(data.roll_number)
      });
    };
    
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full name" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 9 }, (_, i) => i + 2).map((cls) => (
                        <SelectItem key={cls} value={cls.toString()}>
                          Class {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="roll_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roll Number</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Roll number" 
                      {...field} 
                      min="1"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="guardian_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guardian Name</FormLabel>
                <FormControl>
                  <Input placeholder="Guardian name" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="contact_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl>
                  <Input placeholder="Contact number" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createStudentMutation.isPending}
            >
              {createStudentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };
  
  // Edit student form
  const EditStudentForm = () => {
    const form = useForm({
      defaultValues: {
        full_name: currentStudent?.full_name || "",
        class: currentStudent?.class || 2,
        roll_number: currentStudent?.roll_number.toString() || "",
        date_of_birth: currentStudent?.date_of_birth ? new 
Date(currentStudent.date_of_birth).toISOString().split('T')[0] : "",
        address: currentStudent?.address || "",
        guardian_name: currentStudent?.guardian_name || "",
        contact_number: currentStudent?.contact_number || ""
      }
    });
    
    const onSubmit = (data: any) => {
      if (!currentStudent) return;
      
      updateStudentMutation.mutate({
        id: currentStudent.id,
        data: {
          ...data,
          class: parseInt(data.class),
          roll_number: parseInt(data.roll_number)
        }
      });
    };
    
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full name" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 9 }, (_, i) => i + 2).map((cls) => (
                        <SelectItem key={cls} value={cls.toString()}>
                          Class {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="roll_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roll Number</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Roll number" 
                      {...field} 
                      min="1"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="guardian_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guardian Name</FormLabel>
                <FormControl>
                  <Input placeholder="Guardian name" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="contact_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Number</FormLabel>
                <FormControl>
                  <Input placeholder="Contact number" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={updateStudentMutation.isPending}
            >
              {updateStudentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : "Update Student"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Students" 
        action={
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        }
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, guardian or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full sm:w-[180px]">
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
          
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "table")}>
            <TabsList className="grid w-20 grid-cols-2">
              <TabsTrigger value="grid" className="p-2">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="table" className="p-2">
                <Rows3 className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>
      
      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <EmptyState 
          icon={<Users className="h-10 w-10 text-muted-foreground" />} 
          title="Error loading students"
          description="There was an error loading the student data. Please try again later."
          action={
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['students'] })}>
              Try Again
            </Button>
          }
        />
      ) : filteredStudents.length === 0 ? (
        <EmptyState 
          icon={<Users className="h-10 w-10 text-muted-foreground" />}
          title="No students found"
          description={!searchTerm && selectedClass === "all" ? 
            "Add your first student by clicking the 'Add Student' button." : 
            "Try adjusting your search or filters to find what you're looking for."}
          action={
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Student
            </Button>
          }
        />
      ) : (
        <Tabs value={viewMode} className="mt-2">
          <TabsContent value="grid" className="mt-0">
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredStudents.map((student, index) => (
                <StudentCardView
                  key={student.id}
                  student={student}
                  index={index}
                  onViewDetails={handleViewDetails}
                  onEdit={handleEditStudent}
                  onDelete={handleDeleteStudent}
                />
              ))}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="table" className="mt-0">
            <div className="rounded-md border overflow-hidden backdrop-blur-sm bg-card/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Roll No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Class</TableHead>
                    <TableHead className="hidden md:table-cell">Date of Birth</TableHead>
                    <TableHead className="hidden lg:table-cell">Guardian</TableHead>
                    <TableHead className="hidden lg:table-cell">Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => handleViewDetails(student.id)}
                      className="cursor-pointer hover:bg-muted/80"
                    >
                      <TableCell>{student.roll_number}</TableCell>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell className="hidden md:table-cell">Class {student.class}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(student.date_of_birth).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{student.guardian_name}</TableCell>
                      <TableCell className="hidden lg:table-cell">{student.contact_number}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStudent(student);
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStudent(student);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter the details of the new student below.
            </DialogDescription>
          </DialogHeader>
          <AddStudentForm />
        </DialogContent>
      </Dialog>
      
      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the details of the student below.
            </DialogDescription>
          </DialogHeader>
          {currentStudent && <EditStudentForm />}
        </DialogContent>
      </Dialog>
      
      {/* Delete Student Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {currentStudent?.full_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              disabled={deleteStudentMutation.isPending}
              onClick={() => {
                if (currentStudent) {
                  deleteStudentMutation.mutate(currentStudent.id);
                }
              }}
            >
              {deleteStudentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
