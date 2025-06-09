
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const studentFormSchema = z.object({
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

type StudentFormValues = z.infer<typeof studentFormSchema>;

interface OptimizedStudentFormProps {
  student?: any;
  classes: any[];
  onSubmit: (data: StudentFormValues) => Promise<void>;
}

export function OptimizedStudentForm({ student, classes, onSubmit }: OptimizedStudentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = student ? {
    name: student.full_name || student.name || "",
    class: student.class ? `Class ${student.class}` : "",
    rollNumber: student.roll_number || student.rollNumber || undefined,
    fatherName: student.father_name || student.fatherName || "",
    motherName: student.mother_name || student.motherName || "",
    phoneNumber: student.contact_number || student.phoneNumber || "",
    whatsappNumber: student.whatsapp_number || student.whatsappNumber || "",
    address: student.address || "",
    totalFees: student.total_fees || student.totalFees || 0,
    gender: student.gender || undefined,
    dateOfBirth: student.date_of_birth || student.dateOfBirth || "",
    aadhaarNumber: student.aadhaar_number || student.aadhaarNumber || "",
  } : {
    name: "",
    class: "",
    rollNumber: undefined,
    fatherName: "",
    motherName: "",
    phoneNumber: "",
    whatsappNumber: "",
    address: "",
    totalFees: 0,
    gender: undefined,
    dateOfBirth: "",
    aadhaarNumber: "",
  };

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues,
  });

  const handleSubmit = async (data: StudentFormValues) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log('Submitting student form data:', data);
      
      await onSubmit(data);
      
      if (!student) {
        form.reset(defaultValues);
      }
      toast.success(student ? "Student updated successfully!" : "Student added successfully!");
    } catch (error) {
      console.error('Student form submission error:', error);
      toast.error(student ? "Failed to update student. Please try again." : "Failed to add student. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter student's full name" {...field} />
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
                <FormLabel>Class *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>
                        {cls.name}
                      </SelectItem>
                    ))}
                    {/* Fallback options if classes are not loaded */}
                    {classes.length === 0 && (
                      <>
                        <SelectItem value="Class 1">Class 1</SelectItem>
                        <SelectItem value="Class 2">Class 2</SelectItem>
                        <SelectItem value="Class 3">Class 3</SelectItem>
                        <SelectItem value="Class 4">Class 4</SelectItem>
                        <SelectItem value="Class 5">Class 5</SelectItem>
                        <SelectItem value="Class 6">Class 6</SelectItem>
                        <SelectItem value="Class 7">Class 7</SelectItem>
                        <SelectItem value="Class 8">Class 8</SelectItem>
                        <SelectItem value="Class 9">Class 9</SelectItem>
                        <SelectItem value="Class 10">Class 10</SelectItem>
                        <SelectItem value="Class 11">Class 11</SelectItem>
                        <SelectItem value="Class 12">Class 12</SelectItem>
                      </>
                    )}
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
                <FormLabel>Roll Number</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter roll number" {...field} />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fatherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father's Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter father's name" {...field} />
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
                <FormLabel>Mother's Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter mother's name" {...field} />
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
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
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
                <FormLabel>WhatsApp Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter WhatsApp number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalFees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Fees (₹) *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter total fees" {...field} />
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
                <Input placeholder="Enter address" {...field} />
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
              <FormLabel>Aadhaar Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter Aadhaar number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} size="lg">
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
  );
}
