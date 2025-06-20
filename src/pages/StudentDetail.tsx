import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OptimizedStudentForm } from "@/components/students/OptimizedStudentForm";
import { cn } from "@/lib/utils";
import { Phone, MessageSquare, Clock, CreditCard, CalendarDays, Edit3, Download, Trash2, Plus, User, Users, IdCard, Calendar, AtSign, Phone as PhoneIcon, MapPin, Cake, GraduationCap, FileText } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { exportAttendanceToPDF, exportFeeInvoicePDF, exportTestToPDF, type AttendancePDFOptions, type FeeInvoicePDFOptions } from "@/services/pdfService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FeeTransactionForm } from "@/components/fees/FeeTransactionForm";
import { motion } from "framer-motion";
import { StudentDetailHeader } from "@/components/students/StudentDetailHeader";
import { StudentTestResults } from "@/components/students/StudentTestResults";
import { studentService } from "@/services/studentService";
import { useStudentAttendance } from "@/hooks/useStudentAttendance";
import { supabase } from "@/integrations/supabase/client";
import { TestRecordDb } from "@/types";

// Logo placeholder
const INSTITUTE_LOGO = "https://placehold.co/200x200/4F46E5/FFFFFF?text=IC";

// Helper function to safely format dates
const formatSafeDate = (dateValue: string | null | undefined, formatString: string = 'dd MMM yyyy'): string => {
  if (!dateValue) return 'N/A';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
};

// Student Profile component to show personal information
const StudentProfile = ({
  student
}) => <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <User className="h-4 w-4" /> Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Gender</p>
            <p className="font-medium">{student.gender || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date of Birth</p>
            <p className="font-medium">
              {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not specified'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Aadhaar Number</p>
          <p className="font-medium">{student.aadhaarNumber || 'Not provided'}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Address</p>
          <p className="font-medium">{student.address || 'Not provided'}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Joined On</p>
          <p className="font-medium">{new Date(student.joinDate).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>

    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <Users className="h-4 w-4" /> Family Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Father's Name</p>
          <p className="font-medium">{student.fatherName || 'Not provided'}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Mother's Name</p>
          <p className="font-medium">{student.motherName || 'Not provided'}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{student.phoneNumber || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">WhatsApp</p>
            <p className="font-medium">{student.whatsappNumber || student.phoneNumber || 'Not provided'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>;

// Main StudentDetail component
export default function StudentDetail() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    students,
    classes,
    updateStudent,
    deleteStudent
  } = useData();
  const queryClient = useQueryClient();
  const student = students.find(s => s.id === id);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddFeeDialogOpen, setIsAddFeeDialogOpen] = useState(false);
  const [feeToEdit, setFeeToEdit] = useState<string | null>(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch student fees using the student service
  const {
    data: studentFees = [],
    isLoading: feesLoading,
    refetch: refetchFees
  } = useQuery({
    queryKey: ['student-fees', id],
    queryFn: async () => {
      if (!id) return [];
      return await studentService.getStudentFees(id);
    },
    enabled: !!id
  });

  // Fetch student attendance using the custom hook
  const {
    student: studentData,
    attendanceHistory,
    attendanceStats,
    isLoading: attendanceLoading
  } = useStudentAttendance(id);

  // Fetch student test records
  const {
    data: studentTests = [],
    isLoading: testsLoading
  } = useQuery({
    queryKey: ['student-tests', id],
    queryFn: async () => {
      if (!id) return [];
      const {
        data,
        error
      } = await supabase.from('test_results').select('*').eq('student_id', id).order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching student tests:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!id
  });

  // Fee transaction mutations
  const addFeeMutation = useMutation({
    mutationFn: async (feeData: any) => {
      if (!id) throw new Error('Student ID is required');
      return await studentService.addFeeTransaction({
        studentId: id,
        ...feeData,
        amount: Number(feeData.amount)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['student-fees', id]
      });
      queryClient.invalidateQueries({
        queryKey: ['students']
      });
      setIsAddFeeDialogOpen(false);
      setFeeToEdit(null);
      toast.success("Fee transaction added successfully!");
    },
    onError: error => {
      console.error('Error adding fee:', error);
      toast.error("Failed to add fee transaction");
    }
  });

  // Functions to get grade and color based on marks
  const getGrade = (marks: number, totalMarks: number) => {
    const percent = marks / totalMarks * 100;
    if (percent >= 90) return {
      grade: 'A',
      color: 'bg-emerald-500'
    };
    if (percent >= 75) return {
      grade: 'B',
      color: 'bg-blue-500'
    };
    if (percent >= 60) return {
      grade: 'C',
      color: 'bg-yellow-500'
    };
    if (percent >= 40) return {
      grade: 'D',
      color: 'bg-orange-500'
    };
    return {
      grade: 'F',
      color: 'bg-red-500'
    };
  };
  const handleExportAttendance = () => {
    if (!student || !attendanceHistory) return;
    const options: AttendancePDFOptions = {
      records: attendanceHistory.map(record => ({
        id: record.id,
        studentId: record.student_id,
        date: record.date,
        status: record.status as "Present" | "Absent" | "Leave" | "Holiday"
      })),
      studentData: student,
      title: `Attendance Report - ${student.name}`,
      subtitle: `Class: ${student.class}`,
      logo: INSTITUTE_LOGO
    };
    exportAttendanceToPDF(options);
    toast.success("Attendance report exported successfully!");
  };
  const handleExportInvoice = (transaction: any) => {
    if (!student) return;
    const options: FeeInvoicePDFOptions = {
      transaction,
      student,
      instituteName: 'Infinity Classes',
      instituteAddress: '123 Education Lane, Knowledge City',
      institutePhone: '+91 9876543210',
      logo: INSTITUTE_LOGO
    };
    exportFeeInvoicePDF(options);
    toast.success("Fee invoice exported successfully!");
  };
  const handleExportTestPDF = (test: TestRecordDb) => {
    if (!student) return;
    exportTestToPDF({
      test,
      student,
      title: "Test Result Report",
      subtitle: `Test Result - ${formatSafeDate(test.created_at)}`
    });
    toast.success("Test PDF generated successfully");
  };
  const handleEditStudent = async (data: any): Promise<void> => {
    if (!student) return;
    const transformedData = {
      name: data.name,
      class: data.class,
      rollNumber: data.rollNumber,
      fatherName: data.fatherName,
      motherName: data.motherName,
      phoneNumber: data.phoneNumber,
      whatsappNumber: data.whatsappNumber,
      address: data.address,
      totalFees: data.totalFees,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      aadhaarNumber: data.aadhaarNumber
    };
    updateStudent(student.id, transformedData);
    setIsEditDialogOpen(false);
    toast.success("Student information updated successfully!");
  };
  const handleFeeSubmit = async (data: any): Promise<void> => {
    if (!student) return;
    await addFeeMutation.mutateAsync(data);
  };
  const handleDelete = () => {
    if (!student) return;
    deleteStudent(student.id);
    navigate("/students");
    toast.success(`${student.name} has been removed`);
  };
  if (!student) {
    return <div className="flex items-center justify-center h-full animate-fade-in">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Student not found</CardTitle>
            <CardDescription>The requested student could not be found.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => navigate("/students")} className="w-full">
              Back to Students
            </Button>
          </CardFooter>
        </Card>
      </div>;
  }

  // Prepare attendance data for charts
  const attendanceData = [{
    name: "Present",
    value: attendanceStats?.present || 0
  }, {
    name: "Absent",
    value: attendanceStats?.absent || 0
  }, {
    name: "Leave",
    value: attendanceStats?.leave || 0
  }];
  const calculateMonthlyAttendance = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, index) => {
      return {
        month,
        percentage: student?.attendancePercentage || 0
      };
    });
  };
  return <div className="space-y-4 md:space-y-6 animate-fade-in pb-10 px-2 md:px-0">
      <StudentDetailHeader student={student} onEdit={() => setIsEditDialogOpen(true)} onDelete={() => setConfirmDeleteDialogOpen(true)} />

      <Card className="rounded-xl overflow-hidden shadow-sm border-white/20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-2 md:px-4 lg:px-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto md:my-6 h-auto my-[16px]">
            <TabsTrigger value="profile" className="text-sm md:text-sm px-2 md:px-3 py-2">Profile</TabsTrigger>
            <TabsTrigger value="fees" className="md:text-sm px-2 md:px-3 py-2 text-sm">Fees</TabsTrigger>
            <TabsTrigger value="attendance" className="md:text-sm px-2 md:px-3 py-2 text-sm">Attendance</TabsTrigger>
            <TabsTrigger value="tests" className="flex gap-1 items-center md:text-sm px-2 md:px-3 py-2 text-sm">
               Tests
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="pb-4 md:pb-6 space-y-4 md:space-y-6">
            <StudentProfile student={student} />
            
            {/* Education Details */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Education Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <GraduationCap className="h-4 w-4" /> Class
                  </div>
                  <p className="font-semibold text-base">{student.class}</p>
                </div>

                <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <Users className="h-4 w-4" /> Roll Number
                  </div>
                  <p className="font-semibold text-base">{student.rollNumber || 'Not assigned'}</p>
                </div>

                <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <AtSign className="h-4 w-4" /> Attendance
                  </div>
                  <p className={cn("text-xl font-semibold", student.attendancePercentage >= 80 ? "text-green-600 dark:text-green-400" : student.attendancePercentage >= 60 ? "text-orange-600 dark:text-orange-400" : "text-red-600 dark:text-red-400")}>
                    {student.attendancePercentage}%
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Contact Information */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <PhoneIcon className="h-4 w-4" /> Phone Number
                  </div>
                  <p className="font-semibold text-base">{student.phoneNumber || 'Not provided'}</p>
                </div>

                <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <MessageSquare className="h-4 w-4" /> WhatsApp
                  </div>
                  <p className="font-semibold text-base">{student.whatsappNumber || student.phoneNumber || 'Not provided'}</p>
                </div>

                <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <MapPin className="h-4 w-4" /> Address
                  </div>
                  <p className="font-semibold text-base">{student.address || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="space-y-4 md:space-y-6 pb-4 md:pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-base md:text-lg font-medium">Fee Summary</h3>
              <Dialog open={isAddFeeDialogOpen} onOpenChange={open => {
              setIsAddFeeDialogOpen(open);
              if (!open) setFeeToEdit(null);
            }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" /> Add Fee
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add Fee Transaction</DialogTitle>
                    <DialogDescription>
                      Add a new fee transaction for this student.
                    </DialogDescription>
                  </DialogHeader>
                  <FeeTransactionForm onSubmit={handleFeeSubmit} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Fee Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <Card className="shadow-sm">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-muted-foreground">Total Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-semibold">₹{student.totalFees.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-muted-foreground">Paid Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-semibold text-green-600">
                    ₹{student.paidFees.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm sm:col-span-2 lg:col-span-1">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-muted-foreground">Due Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-semibold text-amber-600">
                    ₹{(student.totalFees - student.paidFees).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Fee Transaction List */}
            <Card className="shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="text-base md:text-lg">Recent Fee Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {feesLoading ? <div className="text-center py-8 text-muted-foreground">
                    Loading fee transactions...
                  </div> : studentFees.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                    No data available for the student
                  </div> : <div className="space-y-3">
                    {studentFees.slice(0, 5).map(fee => <motion.div key={fee.id} initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  duration: 0.2
                }} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-all gap-2">
                        <div className="flex-1">
                          <div className="font-medium">{fee.purpose}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <CreditCard className="h-3 w-3" /> {fee.paymentMode || 'Pending'}
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          <div className="text-right">
                            <div className="font-medium">₹{fee.amount.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(fee.date).toLocaleDateString()}
                            </div>
                          </div>
                          {fee.paymentMode && <Button variant="ghost" size="icon" onClick={() => handleExportInvoice(fee)} className="h-8 w-8">
                              <Download className="h-4 w-4 text-muted-foreground" />
                            </Button>}
                        </div>
                      </motion.div>)}
                    {studentFees.length > 5 && <div className="text-center pt-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/fees`)}>
                          View All Transactions
                        </Button>
                      </div>}
                  </div>}
              </CardContent>
            </Card>

            {/* More Information Button at bottom */}
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => navigate(`/fees`)} className="w-full sm:w-auto">
                More Information
              </Button>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4 md:space-y-6 pb-4 md:pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-base md:text-lg font-medium">Attendance Overview</h3>
              <Button size="sm" variant="outline" onClick={handleExportAttendance} className="flex gap-1 items-center w-full sm:w-auto">
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>

            {attendanceLoading ? <div className="text-center py-8 text-muted-foreground">
                Loading attendance data...
              </div> : !attendanceHistory || attendanceHistory.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                No data available for the student
              </div> : <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                  <Card className="shadow-sm">
                    <CardHeader className="py-4">
                      <CardTitle className="text-base md:text-lg">Attendance Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center h-[200px] md:h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart className="animate-scale-in">
                            <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({
                          name,
                          percent
                        }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                              {attendanceData.map((entry, index) => <Cell key={`cell-${index}`} fill={["#30D158", "#FF453A", "#FF9F0A"][index % 3]} />)}
                            </Pie>
                            <Tooltip formatter={value => [`${value} days`, ``]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader className="py-4">
                      <CardTitle className="text-base md:text-lg">Monthly Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="h-[200px] md:h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={calculateMonthlyAttendance().slice(0, 7)} className="animate-fade-in">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={value => [`${value}%`, "Attendance"]} />
                            <Line type="monotone" dataKey="percentage" stroke="#0A84FF" animationDuration={1500} strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-sm">
                  <CardHeader className="py-4">
                    <CardTitle className="text-base md:text-lg">Recent Attendance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {attendanceHistory.slice(0, 10).map(record => <motion.div key={record.id} initial={{
                  opacity: 0,
                  y: 5
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  duration: 0.2
                }} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-all gap-2">
                        <div className="flex items-center gap-3">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <div>{new Date(record.date).toLocaleDateString()}</div>
                        </div>
                        <Badge variant="outline" className={cn(record.status === "Present" ? "border-green-500 text-green-500" : record.status === "Absent" ? "border-red-500 text-red-500" : record.status === "Leave" ? "border-orange-500 text-orange-500" : "border-gray-500 text-gray-500")}>
                          {record.status}
                        </Badge>
                      </motion.div>)}
                  </CardContent>
                </Card>

                {/* More Information Button at bottom */}
                <div className="flex justify-center pt-4">
                  <Button variant="outline" onClick={() => navigate(`/attendance/student/${id}`)} className="w-full sm:w-auto">
                    More Information
                  </Button>
                </div>
              </>}
          </TabsContent>

          {/* Test Results Tab */}
          <TabsContent value="tests" className="space-y-4 md:space-y-6 pb-4 md:pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-base md:text-lg font-medium">Test Results</h3>
            </div>

            {testsLoading ? <div className="text-center py-8 text-muted-foreground">
                Loading test data...
              </div> : studentTests.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                No data available for the student
              </div> : <div className="space-y-4">
                {/* Test Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  <Card className="shadow-sm">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm text-muted-foreground">Total Tests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl md:text-2xl font-semibold">{studentTests.length}</div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm text-muted-foreground">Average Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl md:text-2xl font-semibold text-blue-600">
                        {studentTests.length > 0 ? Math.round(studentTests.reduce((acc, test) => acc + (test.percentage || 0), 0) / studentTests.length) : 0}%
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm text-muted-foreground">Best Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl md:text-2xl font-semibold text-green-600">
                        {studentTests.length > 0 ? Math.max(...studentTests.map(test => test.percentage || 0)) : 0}%
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm text-muted-foreground">Pass Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl md:text-2xl font-semibold text-amber-600">
                        {studentTests.length > 0 ? Math.round(studentTests.filter(test => (test.percentage || 0) >= 40).length / studentTests.length * 100) : 0}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Test Results */}
                <Card className="shadow-sm">
                  <CardHeader className="py-4">
                    <CardTitle className="text-base md:text-lg">Recent Test Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {studentTests.slice(0, 5).map(test => {
                  const {
                    grade,
                    color
                  } = getGrade(test.marks_obtained, test.total_marks);
                  const percent = test.percentage || Math.round(test.marks_obtained / test.total_marks * 100);
                  return <motion.div key={test.id} initial={{
                    opacity: 0,
                    y: 5
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} transition={{
                    duration: 0.2
                  }} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-all gap-2">
                          <div className="flex-1">
                            <div className="font-medium">Test #{test.test_id}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatSafeDate(test.created_at)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-3">
                            <div className="text-right">
                              <div className="font-medium">
                                {test.marks_obtained}/{test.total_marks}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {percent}%
                              </div>
                            </div>
                            <Badge className={color}>{grade}</Badge>
                            <Button variant="ghost" size="icon" onClick={() => handleExportTestPDF(test)} className="h-8 w-8">
                              <Download className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </motion.div>;
                })}
                    {studentTests.length > 5 && <div className="text-center pt-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/tests/history/${id}`)}>
                          View All Tests
                        </Button>
                      </div>}
                  </CardContent>
                </Card>

                {/* More Information Button at bottom */}
                <div className="flex justify-center pt-4">
                  <Button variant="outline" onClick={() => navigate(`/tests/history/${id}`)} className="w-full sm:w-auto">
                    More Information
                  </Button>
                </div>
              </div>}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Information</DialogTitle>
            <DialogDescription>
              Make changes to the student's profile here.
            </DialogDescription>
          </DialogHeader>
          <OptimizedStudentForm student={{
          full_name: student.name,
          class: parseInt(student.class.replace("Class ", "")),
          roll_number: student.rollNumber,
          father_name: student.fatherName,
          mother_name: student.motherName,
          contact_number: student.phoneNumber,
          whatsapp_number: student.whatsappNumber,
          address: student.address,
          total_fees: student.totalFees,
          gender: student.gender,
          date_of_birth: student.dateOfBirth,
          aadhaar_number: student.aadhaarNumber
        }} classes={classes} onSubmit={handleEditStudent} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}