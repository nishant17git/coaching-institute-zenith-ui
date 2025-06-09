
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2, User, Phone, MapPin, GraduationCap, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Student, Class } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Student form schema with updated date validation
const studentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  class: z.string().min(1, "Class is required"),
  rollNumber: z.coerce.number().int().positive("Roll number must be positive").optional(),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().optional(),
  phoneNumber: z.string().min(1, "Phone number is required"),
  whatsappNumber: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  totalFees: z.coerce.number().nonnegative("Total fees must be non-negative"),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  dateOfBirth: z.date().optional(),
  aadhaarNumber: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

interface StudentFormProps {
  student?: Student;
  classes: Class[];
  onSubmit: (data: StudentFormValues) => void;
  submitLabel?: string;
}

export function StudentForm({ student, classes, onSubmit, submitLabel = "Submit" }: StudentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to find the class name from student.class
  const getClassNameFromStudent = (studentClass: string) => {
    // If it's already a class name, return it
    const foundClass = classes.find(cls => cls.name === studentClass);
    if (foundClass) return studentClass;
    
    // If it's a class ID, find the corresponding name
    const foundById = classes.find(cls => cls.id === studentClass);
    return foundById ? foundById.name : studentClass;
  };

  // Set default values based on whether we're editing or creating
  const defaultValues = student
    ? {
        name: student.name,
        class: getClassNameFromStudent(student.class), // Properly map class value
        rollNumber: student.rollNumber || undefined,
        fatherName: student.fatherName,
        motherName: student.motherName,
        phoneNumber: student.phoneNumber,
        whatsappNumber: student.whatsappNumber,
        address: student.address,
        totalFees: student.totalFees,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : undefined,
        aadhaarNumber: student.aadhaarNumber,
      }
    : {
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
        dateOfBirth: undefined,
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
      await onSubmit(data);
      form.reset(defaultValues);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out classes with invalid data
  const validClasses = classes.filter(cls => 
    cls.id && cls.id.trim() !== "" && 
    cls.name && cls.name.trim() !== ""
  );

  return (
    <div className="w-full h-full flex flex-col font-geist">
      <div className="flex-1 form-scroll-container px-2 sm:px-4 py-2 sm:py-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
            {/* Personal Information Section */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-geist">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium font-geist">Full Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter student's full name" 
                          className="h-10 sm:h-11 font-geist" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="font-geist" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium font-geist">Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 sm:h-11 font-geist">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel className="font-geist">Gender</SelectLabel>
                              <SelectItem value="Male" className="font-geist">Male</SelectItem>
                              <SelectItem value="Female" className="font-geist">Female</SelectItem>
                              <SelectItem value="Other" className="font-geist">Other</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage className="font-geist" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium font-geist">Date of Birth</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            onSelect={field.onChange}
                            placeholder="Select date of birth"
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            className="h-10 sm:h-11 font-geist"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                          />
                        </FormControl>
                        <FormMessage className="font-geist" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="aadhaarNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium font-geist">Aadhaar Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter Aadhaar number (optional)" 
                          className="h-10 sm:h-11 font-geist" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="font-geist" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Academic Information Section */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-geist">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium font-geist">Class *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 sm:h-11 font-geist">
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel className="font-geist">Available Classes</SelectLabel>
                              {validClasses.map((cls) => (
                                <SelectItem key={cls.id} value={cls.name} className="font-geist">
                                  {cls.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage className="font-geist" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rollNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium font-geist">Roll Number</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter roll number"
                            className="h-10 sm:h-11 font-geist"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage className="font-geist" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Guardian Information Section */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-geist">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Guardian Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium font-geist">Father's Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter father's name" 
                            className="h-10 sm:h-11 font-geist" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="font-geist" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="motherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium font-geist">Mother's Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter mother's name (optional)" 
                            className="h-10 sm:h-11 font-geist" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="font-geist" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Section */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-geist">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium font-geist">Phone Number *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter phone number" 
                            className="h-10 sm:h-11 font-geist" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="font-geist" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium font-geist">WhatsApp Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter WhatsApp number (optional)" 
                            className="h-10 sm:h-11 font-geist" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="font-geist" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium font-geist">Address *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter complete address" 
                          className="h-10 sm:h-11 font-geist" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="font-geist" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Fee Information Section */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-geist">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Fee Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="totalFees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium font-geist">Total Fees (₹) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter total fees amount" 
                          className="h-10 sm:h-11 font-geist" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="font-geist" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className="flex-shrink-0 border-t bg-background px-2 sm:px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex justify-end">
          <Button 
            type="submit" 
            onClick={form.handleSubmit(handleSubmit)}
            className="h-10 sm:h-11 px-6 sm:px-8 font-geist font-medium w-full sm:w-auto" 
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
