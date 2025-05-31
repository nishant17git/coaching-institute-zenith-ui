import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { studentService } from "@/services/studentService";
import { StudentRecord, Student, StudentPhone } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Loader2, Plus, Search, Users, Rows3, LayoutGrid, Phone, MessageSquare, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge"; 
import StudentCard from "@/components/ui/student-card";
import CallModal from "@/components/ui/call-modal";
import { Card } from "@/components/ui/card";

export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<StudentRecord | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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

  // Handle phone and WhatsApp actions
  const handlePhoneCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, "_blank");
    toast.success(`Calling ${phoneNumber}`);
  };

  const handleWhatsApp = (phoneNumber: string) => {
    window.open(`https://wa.me/${phoneNumber.replace(/\D/g, '')}`, "_blank");
    toast.success(`Opening WhatsApp for ${phoneNumber}`);
  };

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

  // View student details function
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

  const handleShowCallModal = (student: Student) => {
    setSelectedStudent(student);
    setIsCallModalOpen(true);
  };

  const handleStudentCardCallClick = (name: string, phone: string) => {
    // For the StudentCard component, open dialog with student info
    const studentForModal: Student = {
      id: "temp-id", 
      name: name,
      class: "", 
      father: "", 
      mother: "", 
      fatherName: "",
      motherName: "",
      phoneNumber: "",
      whatsappNumber: "",
      address: "",
      feeStatus: "Pending",
      totalFees: 0,
      paidFees: 0,
      attendancePercentage: 0,
      joinDate: "",
      phones: [
        {
          id: "phone-1",
          phone: phone,
          is_whatsapp: false
        }
      ]
    };
    
    setSelectedStudent(studentForModal);
    setIsCallModalOpen(true);
  };

  // Convert StudentRecord to Student format for the new card component
  const mapStudentToCardFormat = (student: StudentRecord, index: number): Student => {
    const guardianParts = student.guardian_name.split(' ');
    const father = guardianParts.length > 0 ? guardianParts[0] : '';
    const mother = guardianParts.length > 1 ? guardianParts.slice(1).join(' ') : '';
    
    // Create phone objects from contact number
    const phones: StudentPhone[] = [];
    if (student.contact_number) {
      phones.push({
        id: `phone-${student.id}-1`,
        phone: student.contact_number,
        is_whatsapp: false
      });
    }
    
    if (student.whatsapp_number) {
      phones.push({
        id: `phone-${student.id}-2`,
        phone: student.whatsapp_number,
        is_whatsapp: true
      });
    }
    
    return {
      id: student.id,
      name: student.full_name,
      class: student.class.toString(),
      father: father, // Father name for the new field
      mother: mother, // Mother name for the new field
      fatherName: father,
      motherName: mother,
      phoneNumber: student.contact_number,
      whatsappNumber: student.whatsapp_number || "",
      address: student.address || "",
      feeStatus: student.fee_status as "Paid" | "Pending" | "Partial",
      totalFees: student.total_fees || 0,
      paidFees: student.paid_fees || 0,
      attendancePercentage: student.attendance_percentage || 0,
      joinDate: student.join_date || "",
      phones: phones
    };
  };

  // Split guardian name into father and mother names
  const extractParentNames = (guardianName: string = "") => {
    const parts = guardianName.split(' ');
    if (parts.length >= 2) {
      return {
        fatherName: parts[0],
        motherName: parts.slice(1).join(' ')
      };
    }
    return {
      fatherName: guardianName,
      motherName: ''
    };
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
        father_name: "",
        mother_name: "",
        contact_number: "",
        whatsapp_number: ""
      }
    });

    const onSubmit = (data: any) => {
      // Combine father and mother names into guardian_name
      const guardian_name = `${data.father_name} ${data.mother_name}`.trim();

      createStudentMutation.mutate({
        ...data,
        guardian_name,
        class: parseInt(data.class.toString()),
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
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    defaultValue={field.value.toString()}
                    value={field.value.toString()}
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="father_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Father's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Father's name" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mother_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mother's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Mother's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <FormField
              control={form.control}
              name="whatsapp_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number</FormLabel>
                  <FormControl>
                    <Input placeholder="WhatsApp number (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
    const { fatherName, motherName } = extractParentNames(currentStudent?.guardian_name);

    const form = useForm({
      defaultValues: {
        full_name: currentStudent?.full_name || "",
        class: currentStudent?.class || 2,
        roll_number: currentStudent?.roll_number.toString() || "",
        date_of_birth: currentStudent?.date_of_birth ? new Date(currentStudent.date_of_birth).toISOString().split('T')[0] : "",
        address: currentStudent?.address || "",
        father_name: fatherName || "",
        mother_name: motherName || "",
        contact_number: currentStudent?.contact_number || "",
        whatsapp_number: currentStudent?.whatsapp_number || ""
      }
    });

    const onSubmit = (data: any) => {
      if (!currentStudent) return;

      // Combine father and mother names into guardian_name
      const guardian_name = `${data.father_name} ${data.mother_name}`.trim();

      updateStudentMutation.mutate({
        id: currentStudent.id,
        data: {
          ...data,
          guardian_name,
          class: parseInt(data.class.toString()),
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
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    value={field.value.toString()}
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="father_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Father's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Father's name" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mother_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mother's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Mother's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <FormField
              control={form.control}
              name="whatsapp_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number</FormLabel>
                  <FormControl>
                    <Input placeholder="WhatsApp number (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
    <div className="space-y-6 animate-fade-in font-spotify">
      <div className="flex items-center justify-between">
        <EnhancedPageHeader 
          title="Students" 
        />
        <Button onClick={() => setIsAddDialogOpen(true)} className="font-spotify">
          <Plus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      <div className="space-y-4">
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
              <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['students'] })} className="font-spotify">
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
              <Button onClick={() => setIsAddDialogOpen(true)} className="font-spotify">
                <Plus className="mr-2 h-4 w-4" /> Add Student
              </Button>
            }
          />
        ) : (
          <Tabs value={viewMode} className="mt-2">
            <TabsContent value="grid" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredStudents.map((student, index) => (
                  <Card key={student.id} className="overflow-hidden">
                    <StudentCard
                      student={mapStudentToCardFormat(student, index)}
                      index={index}
                      onCallClick={handleStudentCardCallClick}
                      isFavorite={false}
                    />
                    <div className="px-4 pb-4 pt-2">
                      <Button 
                        variant="default" 
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => handleViewDetails(student.id)}
                      >
                        View Details <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="table" className="mt-0">
              <div className="rounded-md border overflow-hidden backdrop-blur-sm bg-card/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px] font-spotify">Roll No</TableHead>
                      <TableHead className="font-spotify">Name</TableHead>
                      <TableHead className="hidden md:table-cell font-spotify">Class</TableHead>
                      <TableHead className="hidden md:table-cell font-spotify">Date of Birth</TableHead>
                      <TableHead className="hidden lg:table-cell font-spotify">Guardian</TableHead>
                      <TableHead className="hidden lg:table-cell font-spotify">Contact</TableHead>
                      <TableHead className="text-right font-spotify">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, index) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-muted/80 font-spotify"
                      >
                        <TableCell className="font-spotify">{student.roll_number}</TableCell>
                        <TableCell className="font-medium font-spotify">{student.full_name}</TableCell>
                        <TableCell className="hidden md:table-cell font-spotify">Class {student.class}</TableCell>
                        <TableCell className="hidden md:table-cell font-spotify">
                          {new Date(student.date_of_birth).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell font-spotify">{student.guardian_name}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-blue-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePhoneCall(student.contact_number);
                              }}
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-green-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWhatsApp(student.contact_number);
                              }}
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(student.id);
                              }}
                              className="font-spotify"
                            >
                              View Details
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditStudent(student);
                              }}
                              className="font-spotify"
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 font-spotify"
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
      </div>

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto font-spotify">
          <DialogHeader>
            <DialogTitle className="font-spotify">Add New Student</DialogTitle>
            <DialogDescription className="font-spotify">
              Enter the details of the new student below.
            </DialogDescription>
          </DialogHeader>
          <AddStudentForm />
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto font-spotify">
          <DialogHeader>
            <DialogTitle className="font-spotify">Edit Student</DialogTitle>
            <DialogDescription className="font-spotify">
              Update the details of the student below.
            </DialogDescription>
          </DialogHeader>
          {currentStudent && <EditStudentForm />}
        </DialogContent>
      </Dialog>

      {/* Delete Student Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="font-spotify">
          <DialogHeader>
            <DialogTitle className="font-spotify">Confirm Deletion</DialogTitle>
            <DialogDescription className="font-spotify">
              Are you sure you want to delete {currentStudent?.full_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="font-spotify"
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
              className="font-spotify"
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

      {/* Call Modal */}
      <CallModal 
        open={isCallModalOpen}
        onOpenChange={setIsCallModalOpen}
        student={selectedStudent}
      />
    </div>
  );
}
