
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Student form schema
const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  class: z.string().min(1, "Class is required"),
  rollNumber: z.coerce.number().optional(),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().optional(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  whatsappNumber: z.string().optional(),
  address: z.string().optional(),
  totalFees: z.coerce.number().min(0, "Total fees must be positive"),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  dateOfBirth: z.string().optional(),
  aadhaarNumber: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface OptimizedStudentFormProps {
  student?: any;
  classes?: any[];
  onSubmit: (data: StudentFormValues) => Promise<void>;
}

export function OptimizedStudentForm({ student, classes = [], onSubmit }: OptimizedStudentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = student ? {
    name: student.full_name || student.name || "",
    class: student.class ? `Class ${student.class}` : "",
    rollNumber: student.roll_number || student.rollNumber || 0,
    fatherName: student.father_name || student.fatherName || "",
    motherName: student.mother_name || student.motherName || "",
    phoneNumber: student.contact_number || student.phoneNumber || "",
    whatsappNumber: student.whatsapp_number || student.whatsappNumber || "",
    address: student.address || "",
    totalFees: student.total_fees || student.totalFees || 0,
    gender: student.gender as "Male" | "Female" | "Other" | undefined,
    dateOfBirth: student.date_of_birth || student.dateOfBirth || "",
    aadhaarNumber: student.aadhaar_number || student.aadhaarNumber || "",
  } : {
    name: "",
    class: "",
    rollNumber: 0,
    fatherName: "",
    motherName: "",
    phoneNumber: "",
    whatsappNumber: "",
    address: "",
    totalFees: 0,
    gender: undefined as "Male" | "Female" | "Other" | undefined,
    dateOfBirth: "",
    aadhaarNumber: "",
  };

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues,
  });

  const handleSubmit = async (data: StudentFormValues) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(data);
      toast.success(student ? "Student updated successfully" : "Student added successfully", {
        description: `${data.name} has been ${student ? 'updated' : 'added to'} the system`
      });
      if (!student) {
        form.reset(defaultValues);
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error("Failed to save student", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-geist">
                <User className="h-5 w-5 text-primary" />
                {student ? "Edit Student" : "Add New Student"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter student's full name" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Class *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({length: 12}, (_, i) => (
                            <SelectItem key={i + 1} value={`Class ${i + 1}`}>
                              Class {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rollNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Roll Number</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter roll number" className="h-11" {...field} />
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
                      <FormLabel className="text-sm font-medium">Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Father's Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter father's name" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Mother's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter mother's name" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">WhatsApp Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter WhatsApp number" className="h-11" {...field} />
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
                    <FormLabel className="text-sm font-medium">Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter complete address" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aadhaarNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Aadhaar Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Aadhaar number" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="totalFees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Total Fees (₹) *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter total fees" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="h-11 px-8 font-medium" 
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {student ? "Updating..." : "Adding..."}
                </>
              ) : (
                student ? "Update Student" : "Add Student"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
