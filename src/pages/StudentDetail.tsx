
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  Clock, 
  CreditCard, 
  CalendarDays,
  Edit3,
  Download,
  Trash2,
  Plus,
  User,
  Users
} from "lucide-react";
import { 
  PieChart,
  Pie, 
  Cell, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { 
  exportAttendanceToPDF, 
  exportFeeInvoicePDF,
  type AttendancePDFOptions,
  type FeeInvoicePDFOptions
} from "@/services/pdfService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Logo placeholder
const INSTITUTE_LOGO = "https://placehold.co/200x200/4F46E5/FFFFFF?text=IC";

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    students, 
    feeTransactions, 
    attendanceRecords,
    classes,
    updateStudent,
    deleteStudent,
    addFeeTransaction,
    updateFeeTransaction,
    deleteFeeTransaction
  } = useData();
  
  const student = students.find((s) => s.id === id);
  
  const studentFees = feeTransactions.filter((fee) => fee.studentId === id);
  const studentAttendance = attendanceRecords.filter((record) => record.studentId === id);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddFeeDialogOpen, setIsAddFeeDialogOpen] = useState(false);
  const [feeToEdit, setFeeToEdit] = useState<string | null>(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const handlePhoneCall = () => {
    if (!student?.phoneNumber) return;
    window.open(`tel:${student.phoneNumber}`, "_blank");
    toast.success(`Calling ${student.name}`);
  };

  const handleWhatsApp = () => {
    if (!student?.phoneNumber) return;
    window.open(`https://wa.me/${student.phoneNumber.replace(/\D/g, '')}`, "_blank");
    toast.success(`Opening WhatsApp for ${student.name}`);
  };
  
  const attendanceData = [
    { name: "Present", value: studentAttendance.filter((r) => r.status === "Present").length },
    { name: "Absent", value: studentAttendance.filter((r) => r.status === "Absent").length },
    { name: "Leave", value: studentAttendance.filter((r) => r.status === "Leave").length },
  ];
  
  const COLORS = ["#30D158", "#FF453A", "#FF9F0A"];
  
  const calculateMonthlyAttendance = () => {
    if (!student) return [];
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, index) => {
      return {
        month,
        percentage: student?.attendancePercentage || 0,
      };
    });
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

  // Extract first and last name for father and mother from guardian name
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

  const { fatherName, motherName } = student ? extractParentNames(student.guardian_name) : { fatherName: '', motherName: '' };

  const StudentEditForm = () => {
    const form = useForm({
      defaultValues: {
        name: student?.name || '',
        class: student?.class || '',
        fatherName: fatherName || '',
        motherName: motherName || '',
        phoneNumber: student?.phoneNumber || '',
        whatsappNumber: student?.whatsappNumber || student?.phoneNumber || '',
        totalFees: student?.totalFees || 0,
      }
    });
    
    const onSubmit = (data: any) => {
      if (!student) return;
      
      updateStudent(student.id, {
        ...data,
        totalFees: Number(data.totalFees),
        // Combine father and mother name for guardian_name
        guardian_name: `${data.fatherName} ${data.motherName}`.trim(),
      });
      
      setIsEditDialogOpen(false);
      toast.success("Student information updated successfully!");
    };
    
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Student name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fatherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Father's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Father's name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="motherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mother's Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Mother's name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number</FormLabel>
                  <FormControl>
                    <Input placeholder="WhatsApp number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="totalFees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Fees (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Total fees" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };
  
  const FeeTransactionForm = () => {
    const feeToEditData = feeToEdit 
      ? feeTransactions.find(fee => fee.id === feeToEdit) 
      : null;
    
    const form = useForm({
      defaultValues: {
        purpose: feeToEditData?.purpose || '',
        amount: feeToEditData?.amount || 0,
        paymentMode: feeToEditData?.paymentMode || '',
        date: feeToEditData?.date || new Date().toISOString().split('T')[0]
      }
    });
    
    const onSubmit = (data: any) => {
      if (!student) return;
      
      if (feeToEdit) {
        updateFeeTransaction(feeToEdit, {
          ...data,
          amount: Number(data.amount)
        });
        toast.success("Fee transaction updated successfully!");
      } else {
        addFeeTransaction({
          studentId: student.id,
          ...data,
          amount: Number(data.amount)
        });
        toast.success("Fee transaction added successfully!");
      }
      
      setIsAddFeeDialogOpen(false);
      setFeeToEdit(null);
    };
    
    const handleDeleteFee = () => {
      if (feeToEdit) {
        deleteFeeTransaction(feeToEdit);
        setIsAddFeeDialogOpen(false);
        setFeeToEdit(null);
        toast.success("Fee transaction deleted successfully!");
      }
    };
    
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose</FormLabel>
                <FormControl>
                  <Input placeholder="Fee purpose" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Amount" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="paymentMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Mode</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <DialogFooter className="flex justify-between">
            {feeToEdit && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDeleteFee}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button type="submit">{feeToEdit ? 'Update' : 'Add'} Transaction</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };
  
  const handleDelete = () => {
    if (!student) return;
    
    deleteStudent(student.id);
    navigate("/students");
    toast.success(`${student.name} has been removed`);
  };
  
  if (!student) {
    return (
      <div className="flex items-center justify-center h-full animate-fade-in">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Student not found</h2>
          <Button variant="outline" onClick={() => navigate("/students")}>
            Back to Students
          </Button>
        </div>
      </div>
    );
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase();
  };
  
  return (
    <div className="space-y-6 animate-slide-up">
      <EnhancedPageHeader
        title={`${student.name}'s Profile`}
        showBackButton={true}
        action={
          <div className="flex gap-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Edit3 className="h-4 w-4" /> Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit Student Information</DialogTitle>
                  <DialogDescription>
                    Make changes to the student's profile here.
                  </DialogDescription>
                </DialogHeader>
                <StudentEditForm />
              </DialogContent>
            </Dialog>
            
            <Dialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex gap-2">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
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
          </div>
        }
      />
      
      <Card className="glass-card mb-6 overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Avatar className="h-24 w-24 shadow-lg border-4 border-white/90">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-1">{student.name}</h2>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="outline" className="bg-white/40">{student.class}</Badge>
                <Badge variant="outline" className={cn(
                  "bg-white/40",
                  student.feeStatus === "Paid" ? "text-green-600 border-green-600/30" : 
                  student.feeStatus === "Partial" ? "text-orange-600 border-orange-600/30" : 
                  "text-red-600 border-red-600/30"
                )}>
                  {student.feeStatus}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="bg-white/80 flex items-center gap-1.5" onClick={handlePhoneCall}>
                <Phone className="h-3.5 w-3.5 text-blue-600" /> Call
              </Button>
              <Button variant="outline" size="sm" className="bg-white/80 flex items-center gap-1.5" onClick={handleWhatsApp}>
                <MessageSquare className="h-3.5 w-3.5 text-green-600" /> WhatsApp
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 md:px-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="pb-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" /> Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Roll Number</p>
                        <p className="font-medium">{student.roll_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">{new Date(student.date_of_birth).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{student.address || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Joined On</p>
                      <p className="font-medium">{new Date(student.joinDate).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-4 w-4" /> Family Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Father's Name</p>
                      <p className="font-medium">{fatherName || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Mother's Name</p>
                      <p className="font-medium">{motherName || 'N/A'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{student.phoneNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">WhatsApp</p>
                        <p className="font-medium">{student.whatsappNumber || student.phoneNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="fees" className="space-y-4 pb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Fee Summary</h3>
                <Dialog open={isAddFeeDialogOpen} onOpenChange={(open) => {
                  setIsAddFeeDialogOpen(open);
                  if (!open) setFeeToEdit(null);
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" /> Add Fee
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{feeToEdit ? 'Edit' : 'Add'} Fee Transaction</DialogTitle>
                      <DialogDescription>
                        {feeToEdit 
                          ? 'Make changes to the fee transaction.' 
                          : 'Add a new fee transaction for this student.'}
                      </DialogDescription>
                    </DialogHeader>
                    <FeeTransactionForm />
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Fee Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  {studentFees.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No fee transactions found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {studentFees.map((fee) => (
                        <div key={fee.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-all">
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
                              {fee.paymentMode && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleExportInvoice(fee)}
                                  className="h-8 w-8"
                                >
                                  <Download className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                  setFeeToEdit(fee.id);
                                  setIsAddFeeDialogOpen(true);
                                }}
                                className="h-8 w-8"
                              >
                                <Edit3 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="attendance" className="space-y-4 pb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Attendance</h3>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleExportAttendance}
                  className="flex gap-1 items-center"
                >
                  <Download className="h-4 w-4" /> Export
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">Attendance Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart className="animate-scale-in">
                          <Pie
                            data={attendanceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {attendanceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} days`, ``]} />
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
                          <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} />
                          <Line 
                            type="monotone" 
                            dataKey="percentage" 
                            stroke="#0A84FF" 
                            animationDuration={1500}
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Recent Attendance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {studentAttendance.slice(0, 10).map((record) => (
                    <div 
                      key={record.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <div>{new Date(record.date).toLocaleDateString()}</div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          record.status === "Present" ? "border-green-500 text-green-500" :
                          record.status === "Absent" ? "border-red-500 text-red-500" :
                          record.status === "Leave" ? "border-orange-500 text-orange-500" :
                          "border-gray-500 text-gray-500"
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                  
                  {studentAttendance.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No attendance records found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
