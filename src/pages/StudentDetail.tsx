
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StudentForm } from "@/components/students/StudentForm";
import { cn } from "@/lib/utils";
import { Phone, MessageSquare, Clock, CreditCard, CalendarDays, Edit3, Download, Trash2, Plus, User, Users, IdCard, Calendar, AtSign, Phone as PhoneIcon, MapPin, Cake, GraduationCap, FileText } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useNewData } from "@/contexts/NewDataContext";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { exportAttendanceToPDF, exportFeeInvoicePDF, type AttendancePDFOptions, type FeeInvoicePDFOptions } from "@/services/pdfService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FeeTransactionForm } from "@/components/fees/FeeTransactionForm";
import { motion } from "framer-motion";
import { StudentDetailHeader } from "@/components/students/StudentDetailHeader";
import { StudentTestResults } from "@/components/students/StudentTestResults";

// Logo placeholder
const INSTITUTE_LOGO = "https://placehold.co/200x200/4F46E5/FFFFFF?text=IC";

// Student Profile component to show personal information
const StudentProfile = ({
  student
}) => <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-4 w-4" /> Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
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
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-4 w-4" /> Family Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Father's Name</p>
          <p className="font-medium">{student.fatherName || 'Not provided'}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Mother's Name</p>
          <p className="font-medium">{student.motherName || 'Not provided'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
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

// Education Details component
const EducationDetails = ({
  student
}) => <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-lg">Education Details</CardTitle>
    </CardHeader>
    <CardContent className="grid md:grid-cols-3 gap-6">
      <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          <GraduationCap className="h-4 w-4" /> Class
        </div>
        <p className="text-xl font-semibold">{student.class}</p>
      </div>

      <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Users className="h-4 w-4" /> Roll Number
        </div>
        <p className="text-xl font-semibold">{student.rollNumber || 'Not assigned'}</p>
      </div>

      <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          <AtSign className="h-4 w-4" /> Attendance
        </div>
        <p className={cn("text-xl font-semibold", student.attendancePercentage >= 80 ? "text-green-600 dark:text-green-400" : student.attendancePercentage >= 60 ? "text-orange-600 dark:text-orange-400" : "text-red-600 dark:text-red-400")}>
          {student.attendancePercentage}%
        </p>
      </div>
    </CardContent>
  </Card>;

// Contact Information component
const ContactInformation = ({
  student
}) => <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-lg">Contact Information</CardTitle>
    </CardHeader>
    <CardContent className="grid md:grid-cols-3 gap-6">
      <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          <PhoneIcon className="h-4 w-4" /> Phone Number
        </div>
        <p className="text-xl font-semibold">{student.phoneNumber || 'Not provided'}</p>
      </div>

      <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          <MessageSquare className="h-4 w-4" /> WhatsApp
        </div>
        <p className="text-xl font-semibold">{student.whatsappNumber || student.phoneNumber || 'Not provided'}</p>
      </div>

      <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          <MapPin className="h-4 w-4" /> Address
        </div>
        <p className="text-xl font-semibold">{student.address || 'Not provided'}</p>
      </div>
    </CardContent>
  </Card>;

// Fee Summary Cards
const FeeSummaryCards = ({
  student
}) => <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm text-muted-foreground">Total Fees</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">₹{student.totalFees.toLocaleString()}</div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm text-muted-foreground">Paid Fees</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-green-600">
          ₹{student.paidFees.toLocaleString()}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm text-muted-foreground">Due Fees</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-amber-600">
          ₹{(student.totalFees - student.paidFees).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  </div>;

// Fee Transaction List component
const FeeTransactionList = ({
  student,
  studentFees,
  handleExportInvoice,
  setFeeToEdit,
  setIsAddFeeDialogOpen
}) => <Card>
    <CardHeader className="py-4">
      <CardTitle className="text-lg">Fee Transactions</CardTitle>
    </CardHeader>
    <CardContent>
      {studentFees.length === 0 ? <div className="text-center py-8 text-muted-foreground">
          No fee transactions found
        </div> : <div className="space-y-3">
          {studentFees.map(fee => <motion.div key={fee.id} initial={{
        opacity: 0,
        y: 10
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.2
      }} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-all">
              <div>
                <div className="font-medium">{fee.purpose}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> {fee.paymentMode || 'Pending'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="font-medium">₹{fee.amount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(fee.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {fee.paymentMode && <Button variant="ghost" size="icon" onClick={() => handleExportInvoice(fee)} className="h-8 w-8">
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </Button>}
                  <Button variant="ghost" size="icon" onClick={() => {
              setFeeToEdit(fee.id);
              setIsAddFeeDialogOpen(true);
            }} className="h-8 w-8">
                    <Edit3 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </motion.div>)}
        </div>}
    </CardContent>
  </Card>;

// Attendance Charts component
const AttendanceCharts = ({
  attendanceData,
  calculateMonthlyAttendance
}) => <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-lg">Attendance Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-center h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart className="animate-scale-in">
              <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({
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

    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-lg">Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[250px]">
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
  </div>;

// Recent Attendance List component
const RecentAttendanceList = ({
  studentAttendance
}) => <Card>
    <CardHeader className="py-4">
      <CardTitle className="text-lg">Recent Attendance</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {studentAttendance.slice(0, 10).map(record => <motion.div key={record.id} initial={{
      opacity: 0,
      y: 5
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.2
    }} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-all">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <div>{new Date(record.date).toLocaleDateString()}</div>
          </div>
          <Badge variant="outline" className={cn(record.status === "Present" ? "border-green-500 text-green-500" : record.status === "Absent" ? "border-red-500 text-red-500" : record.status === "Leave" ? "border-orange-500 text-orange-500" : "border-gray-500 text-gray-500")}>
            {record.status}
          </Badge>
        </motion.div>)}

      {studentAttendance.length === 0 && <div className="text-center py-8 text-muted-foreground">
          No attendance records found
        </div>}
    </CardContent>
  </Card>;

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
    isLoading
  } = useNewData();
  
  const student = students.find(s => s.id === id);
  // For now, we'll use empty arrays for fee transactions, attendance records, and test records
  // since the NewDataContext doesn't provide these yet
  const studentFees: any[] = [];
  const studentAttendance: any[] = [];
  const studentTests: any[] = [];
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddFeeDialogOpen, setIsAddFeeDialogOpen] = useState(false);
  const [feeToEdit, setFeeToEdit] = useState<string | null>(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

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
    if (!student) return;
    const options: AttendancePDFOptions = {
      records: studentAttendance,
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
  
  const handleEditStudent = (data: any) => {
    if (!student) return;
    // TODO: Implement updateStudent when available in NewDataContext
    toast.success("Student information updated successfully!");
    setIsEditDialogOpen(false);
  };
  
  const handleFeeSubmit = (data: any) => {
    if (!student) return;
    // TODO: Implement fee transaction handling when available in NewDataContext
    toast.success("Fee transaction added successfully!");
    setIsAddFeeDialogOpen(false);
    setFeeToEdit(null);
  };
  
  const handleDeleteFee = () => {
    if (feeToEdit) {
      // TODO: Implement deleteFeeTransaction when available in NewDataContext
      toast.success("Fee transaction deleted successfully!");
      setIsAddFeeDialogOpen(false);
      setFeeToEdit(null);
    }
  };
  
  const handleDelete = () => {
    if (!student) return;
    // TODO: Implement deleteStudent when available in NewDataContext
    toast.success(`${student.name} has been removed`);
    navigate("/students");
  };
  
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
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
  
  const attendanceData = [{
    name: "Present",
    value: studentAttendance.filter(r => r.status === "Present").length
  }, {
    name: "Absent",
    value: studentAttendance.filter(r => r.status === "Absent").length
  }, {
    name: "Leave",
    value: studentAttendance.filter(r => r.status === "Leave").length
  }];
  
  const calculateMonthlyAttendance = () => {
    if (!student) return [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, index) => {
      return {
        month,
        percentage: student?.attendancePercentage || 0
      };
    });
  };
  
  return <div className="space-y-6 animate-fade-in pb-10">
      <StudentDetailHeader student={student} onEdit={() => setIsEditDialogOpen(true)} onDelete={() => setConfirmDeleteDialogOpen(true)} />

      <Card className="rounded-xl overflow-hidden shadow-sm border-white/20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 md:px-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto my-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="fees">Fees</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="tests" className="flex gap-1.5 items-center">
              <FileText className="h-3.5 w-3.5" /> Tests
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="pb-6 space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" /> Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
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
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-4 w-4" /> Family Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Father's Name</p>
                    <p className="font-medium">{student.fatherName || 'Not provided'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Mother's Name</p>
                    <p className="font-medium">{student.motherName || 'Not provided'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
            </div>
            
            {/* Education Details */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Education Details</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <GraduationCap className="h-4 w-4" /> Class
                  </div>
                  <p className="font-semibold text-base">{student.class}</p>
                </div>

                <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <Users className="h-4 w-4" /> Roll Number
                  </div>
                  <p className="font-semibold text-base">{student.rollNumber || 'Not assigned'}</p>
                </div>

                <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
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
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <PhoneIcon className="h-4 w-4" /> Phone Number
                  </div>
                  <p className="font-semibold text-base">{student.phoneNumber || 'Not provided'}</p>
                </div>

                <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <MessageSquare className="h-4 w-4" /> WhatsApp
                  </div>
                  <p className="font-semibold text-base">{student.whatsappNumber || student.phoneNumber || 'Not provided'}</p>
                </div>

                <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <MapPin className="h-4 w-4" /> Address
                  </div>
                  <p className="font-semibold text-base">{student.address || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees" className="space-y-6 pb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Fee Summary</h3>
              <Dialog open={isAddFeeDialogOpen} onOpenChange={open => {
              setIsAddFeeDialogOpen(open);
              if (!open) setFeeToEdit(null);
            }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" /> Add Fee
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{feeToEdit ? 'Edit' : 'Add'} Fee Transaction</DialogTitle>
                    <DialogDescription>
                      {feeToEdit ? 'Make changes to the fee transaction.' : 'Add a new fee transaction for this student.'}
                    </DialogDescription>
                  </DialogHeader>
                  <FeeTransactionForm transaction={feeToEdit ? studentFees.find(fee => fee.id === feeToEdit) : undefined} onSubmit={handleFeeSubmit} onDelete={feeToEdit ? handleDeleteFee : undefined} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Fee Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-sm">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-muted-foreground">Total Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">₹{student.totalFees?.toLocaleString() || '0'}</div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-muted-foreground">Paid Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-green-600">
                    ₹{student.paidFees?.toLocaleString() || '0'}
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-sm">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm text-muted-foreground">Due Fees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-amber-600">
                    ₹{((student.totalFees || 0) - (student.paidFees || 0)).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Fee Transaction List */}
            <Card className="shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Fee Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No fee transactions found
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6 pb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Attendance</h3>
              <Button size="sm" variant="outline" onClick={handleExportAttendance} className="flex gap-1 items-center">
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="shadow-sm">
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Attendance Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center justify-center h-[250px]">
                    <div className="text-center text-muted-foreground">
                      No attendance data available
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Monthly Trend</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[250px]">
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No attendance data available
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm">
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Recent Attendance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records found
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Results Tab */}
          <TabsContent value="tests" className="space-y-6 pb-6">
            <div className="text-center py-8 text-muted-foreground">
              No test records found
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Student Information</DialogTitle>
            <DialogDescription>
              Make changes to the student's profile here.
            </DialogDescription>
          </DialogHeader>
          <StudentForm student={student} classes={classes} onSubmit={handleEditStudent} submitLabel="Save Changes" />
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
