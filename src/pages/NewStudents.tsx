
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNewData } from "@/contexts/NewDataContext";
import { DatabaseStudent } from "@/types/database";
import { Student, StudentPhone } from "@/types";
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

export default function NewStudents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { students, classes, addStudent, isLoading } = useNewData();

  // Filter students based on search term and class
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.motherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.rollNumber && student.rollNumber.toString().includes(searchTerm));

    const matchesClass = selectedClass === "all" || student.class === selectedClass;

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

  // View student details function
  const handleViewDetails = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };

  const handleShowCallModal = (student: Student) => {
    setSelectedStudent(student);
    setIsCallModalOpen(true);
  };

  const handleStudentCardCallClick = (name: string, phone: string) => {
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

  // Convert Student to card format
  const mapStudentToCardFormat = (student: Student, index: number): Student => {
    const phones: StudentPhone[] = [];
    if (student.phoneNumber) {
      phones.push({
        id: `phone-${student.id}-1`,
        phone: student.phoneNumber,
        is_whatsapp: false
      });
    }
    
    if (student.whatsappNumber && student.whatsappNumber !== student.phoneNumber) {
      phones.push({
        id: `phone-${student.id}-2`,
        phone: student.whatsappNumber,
        is_whatsapp: true
      });
    }
    
    return {
      ...student,
      phones: phones
    };
  };

  // Add student form
  const AddStudentForm = () => {
    const form = useForm({
      defaultValues: {
        full_name: "",
        class: 2,
        roll_number: "",
        father_name: "",
        mother_name: "",
        date_of_birth: "",
        gender: "",
        contact_number: "",
        whatsapp_number: "",
        address: "",
        aadhaar_number: ""
      }
    });

    const onSubmit = async (data: any) => {
      try {
        const studentData: Omit<Student, 'id'> = {
          name: data.full_name,
          class: `Class ${data.class}`,
          father: data.father_name,
          mother: data.mother_name || "",
          fatherName: data.father_name,
          motherName: data.mother_name || "",
          phoneNumber: data.contact_number,
          whatsappNumber: data.whatsapp_number || data.contact_number,
          address: data.address || "",
          feeStatus: "Pending",
          totalFees: 0,
          paidFees: 0,
          attendancePercentage: 0,
          joinDate: new Date().toISOString().split('T')[0],
          gender: data.gender || undefined,
          dateOfBirth: data.date_of_birth || undefined,
          rollNumber: parseInt(data.roll_number),
          aadhaarNumber: data.aadhaar_number || undefined
        };

        await addStudent(studentData);
        setIsAddDialogOpen(false);
        form.reset();
      } catch (error) {
        console.error('Error adding student:', error);
      }
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
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
            name="aadhaar_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aadhaar Number</FormLabel>
                <FormControl>
                  <Input placeholder="Aadhaar number (optional)" {...field} />
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
            <Button type="submit">
              Add Student
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
              placeholder="Search by name, father, mother or roll number..."
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
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.name}>
                    {cls.name}
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
                      <TableHead className="hidden lg:table-cell font-spotify">Father</TableHead>
                      <TableHead className="hidden lg:table-cell font-spotify">Mother</TableHead>
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
                        <TableCell className="font-spotify">{student.rollNumber}</TableCell>
                        <TableCell className="font-medium font-spotify">{student.name}</TableCell>
                        <TableCell className="hidden md:table-cell font-spotify">{student.class}</TableCell>
                        <TableCell className="hidden md:table-cell font-spotify">
                          {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell font-spotify">{student.fatherName}</TableCell>
                        <TableCell className="hidden lg:table-cell font-spotify">{student.motherName || 'N/A'}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-blue-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePhoneCall(student.phoneNumber);
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
                                handleWhatsApp(student.whatsappNumber);
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

      {/* Call Modal */}
      <CallModal 
        open={isCallModalOpen}
        onOpenChange={setIsCallModalOpen}
        student={selectedStudent}
      />
    </div>
  );
}
