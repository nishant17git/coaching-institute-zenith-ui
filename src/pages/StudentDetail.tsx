import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  Plus
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

  const StudentEditForm = () => {
    const form = useForm({
      defaultValues: {
        name: student?.name || '',
        class: student?.class || '',
        fatherName: student?.fatherName || '',
        motherName: student?.motherName || '',
        phoneNumber: student?.phoneNumber || '',
        whatsappNumber: student?.whatsappNumber || '',
        totalFees: student?.totalFees || 0,
      }
    });
    
    const onSubmit = (data: any) => {
      if (!student) return;
      
      updateStudent(student.id, {
        ...data,
        totalFees: Number(data.totalFees)
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
                <FormLabel>Name</FormLabel>
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
  
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/students")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{student.name}'s Profile</h1>
        </div>
        
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
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card md:col-span-1 animate-fade-in">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Class</span>
              <Badge variant="outline">{student.class}</Badge>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Father's Name</div>
              <div>{student.fatherName}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Mother's Name</div>
              <div>{student.motherName}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" /> Contact
              </div>
              <div className="flex items-center gap-4 mt-2">
                <Button variant="outline" size="sm" className="flex gap-2" onClick={handlePhoneCall}>
                  <Phone className="h-4 w-4 text-apple-blue" />
                  Call
                </Button>
                <Button variant="outline" size="sm" className="flex gap-2" onClick={handleWhatsApp}>
                  <MessageSquare className="h-4 w-4 text-apple-green" />
                  WhatsApp
                </Button>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" /> Joined On
              </div>
              <div>{new Date(student.joinDate).toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card md:col-span-2">
          <CardHeader className="pb-2">
            <Tabs defaultValue="fees">
              <TabsList>
                <TabsTrigger value="fees">Fees</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="fees" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Fee Summary</h3>
                  <Dialog open={isAddFeeDialogOpen} onOpenChange={(open) => {
                    setIsAddFeeDialogOpen(open);
                    if (!open) setFeeToEdit(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-apple-blue hover:bg-blue-600">
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
                
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm text-muted-foreground">Total Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-semibold">₹{student.totalFees.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm text-muted-foreground">Paid Fees</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-semibold text-apple-green">
                        ₹{student.paidFees.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Fee Transactions</h3>
                  <div className="space-y-3">
                    {studentFees.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No fee transactions found
                      </div>
                    ) : (
                      studentFees.map((fee) => (
                        <div key={fee.id} className="flex items-center justify-between p-3 border rounded-lg hover-scale transition-all">
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
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="attendance" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Attendance Summary</h3>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleExportAttendance}
                    className="flex gap-1 items-center"
                  >
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-medium mb-4">Attendance Summary</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart className="animate-scale-in">
                        <Pie
                          data={attendanceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={60}
                          dataKey="value"
                          label={({ name }) => name}
                        >
                          {attendanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} days`, ``]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-4">Monthly Trend</h3>
                    <ResponsiveContainer width="100%" height={180}>
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
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Recent Attendance</h3>
                  <div className="space-y-2">
                    {studentAttendance.slice(0, 10).map((record) => (
                      <div 
                        key={record.id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover-scale transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <div>{new Date(record.date).toLocaleDateString()}</div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            record.status === "Present" ? "border-apple-green text-apple-green" :
                            record.status === "Absent" ? "border-apple-red text-apple-red" :
                            record.status === "Leave" ? "border-apple-orange text-apple-orange" :
                            "border-apple-gray text-apple-gray"
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
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
          <CardContent>
            {/* Content moved inside TabsContent components above */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
