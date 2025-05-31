
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, User, BookOpen, ClipboardList, Award, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define props interface for TestAddForm
interface TestAddFormProps {
  onSubmit: (data: TestFormData) => void;
  students: { id: string; full_name?: string; class?: number | string }[];
  initialData?: TestFormData;
  isEditing?: boolean;
}

// Define the form data type
export interface TestFormData {
  studentId: string;
  subject: string;
  testName: string;
  testDate: string;
  testType: string;
  marks: string;
  totalMarks: string;
}

// Create schema for test form validation
const testFormSchema = z.object({
  studentId: z.string().min(1, { message: "Please select a student" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  testName: z.string().min(1, { message: "Test name is required" }),
  testDate: z.date({ required_error: "Test date is required" }),
  testType: z.string().min(1, { message: "Test type is required" }),
  marks: z.string().min(1, { message: "Marks are required" }).refine(val => !isNaN(Number(val)), {
    message: "Marks must be a valid number",
  }),
  totalMarks: z.string().min(1, { message: "Total marks are required" }).refine(val => !isNaN(Number(val)), {
    message: "Total marks must be a valid number",
  }),
});

type TestFormValues = z.infer<typeof testFormSchema>;

export function TestAddForm({ onSubmit, students, initialData, isEditing = false }: TestAddFormProps) {
  // Initialize form with explicit type parameter
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      studentId: initialData?.studentId || "",
      subject: initialData?.subject || "",
      testName: initialData?.testName || "",
      testDate: initialData?.testDate ? new Date(initialData.testDate) : new Date(),
      testType: initialData?.testType || "Chapter-wise Test",
      marks: initialData?.marks || "",
      totalMarks: initialData?.totalMarks || "100",
    },
  });

  // Handle form submission with the correct type
  const handleSubmit = (values: TestFormValues) => {
    const formattedData: TestFormData = {
      studentId: values.studentId,
      subject: values.subject,
      testName: values.testName,
      testDate: format(values.testDate, "yyyy-MM-dd"),
      testType: values.testType,
      marks: values.marks,
      totalMarks: values.totalMarks,
    };
    onSubmit(formattedData);
  };

  // Filter out students with invalid data
  const validStudents = students.filter(student => 
    student.id && student.id.trim() !== "" && 
    student.full_name && student.full_name.trim() !== ""
  );

  return (
    <div className="w-full h-full flex flex-col font-geist">
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 sm:py-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
            {/* Student Selection Section */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-geist">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium font-geist">Student *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 sm:h-11 font-geist">
                            <SelectValue placeholder="Select a student" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className="font-geist">Students</SelectLabel>
                            {validStudents.map((student) => (
                              <SelectItem key={student.id} value={student.id} className="font-geist">
                                <div className="flex flex-col">
                                  <span className="font-medium">{student.full_name}</span>
                                  <span className="text-xs text-muted-foreground">Class {student.class}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage className="font-geist" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Test Information Section */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-geist">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Test Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium font-geist">Subject *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter subject name" 
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
                    name="testName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium font-geist">Test Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter test name" 
                            className="h-10 sm:h-11 font-geist" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="font-geist" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="testDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium font-geist">Test Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "h-10 sm:h-11 w-full justify-start text-left font-normal font-geist",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : "Select test date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="font-geist" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="testType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium font-geist">Test Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 sm:h-11 font-geist">
                              <SelectValue placeholder="Select test type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel className="font-geist">Test Categories</SelectLabel>
                              <SelectItem value="MCQs Test (Standard)" className="font-geist">MCQs Test (Standard)</SelectItem>
                              <SelectItem value="MCQs Test (Normal)" className="font-geist">MCQs Test (Normal)</SelectItem>
                              <SelectItem value="Chapter-wise Test" className="font-geist">Chapter-wise Test</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage className="font-geist" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Marks Section */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-geist">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Marks Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="marks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium font-geist">Marks Obtained *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Enter marks obtained" 
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
                    name="totalMarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium font-geist">Total Marks *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Enter total marks" 
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
          </form>
        </Form>
      </div>

      <DialogFooter className="pt-4 px-2 sm:px-4 pb-2 sm:pb-4 flex-shrink-0 border-t">
        <Button 
          type="submit" 
          onClick={form.handleSubmit(handleSubmit)}
          disabled={form.formState.isSubmitting}
          className="h-10 sm:h-11 px-6 sm:px-8 font-geist font-medium w-full sm:w-auto"
          size="lg"
        >
          <Award className="mr-2 h-4 w-4" />
          {isEditing ? "Update Test" : "Add Test"}
        </Button>
      </DialogFooter>
    </div>
  );
}
