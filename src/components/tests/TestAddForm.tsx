
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Loader2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Test form schema
const testSchema = z.object({
  student_id: z.string().min(1, "Please select a student"),
  test_name: z.string().min(1, "Test name is required"),
  subject: z.string().min(1, "Subject is required"),
  test_date: z.date({ required_error: "Test date is required" }),
  test_type: z.string().min(1, "Test type is required"),
  marks_obtained: z.coerce.number().min(0, "Marks obtained must be positive"),
  total_marks: z.coerce.number().min(1, "Total marks must be positive"),
});

type TestFormValues = z.infer<typeof testSchema>;

interface TestAddFormProps {
  onSubmit: (data: TestFormValues) => Promise<void>;
  students: any[];
  initialData?: any;
  isEditing?: boolean;
}

const subjects = ["Mathematics", "Science", "Social Science", "Hindi", "English"];
const testTypes = ["MCQs Test (Standard)", "Unit Test", "Monthly Test", "Half Yearly", "Final Exam"];

export function TestAddForm({ onSubmit, students, initialData, isEditing = false }: TestAddFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = initialData ? {
    student_id: initialData.student_id || "",
    test_name: initialData.test_name || "",
    subject: initialData.subject || "Mathematics",
    test_date: initialData.test_date ? new Date(initialData.test_date) : new Date(),
    test_type: initialData.test_type || "MCQs Test (Standard)",
    marks_obtained: initialData.marks_obtained || 0,
    total_marks: initialData.total_marks || 100,
  } : {
    student_id: "",
    test_name: "",
    subject: "Mathematics",
    test_date: new Date(),
    test_type: "MCQs Test (Standard)",
    marks_obtained: 0,
    total_marks: 100,
  };

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues,
  });

  const handleSubmit = async (data: TestFormValues) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      // Validate marks
      if (data.marks_obtained > data.total_marks) {
        toast.error("Marks obtained cannot be greater than total marks");
        return;
      }

      // Add class information from student
      const student = students.find(s => s.id === data.student_id);
      const formData = {
        ...data,
        class: student?.class || 9
      };

      await onSubmit(formData);
      toast.success(isEditing ? "Test updated successfully" : "Test added successfully", {
        description: `Test for ${student?.full_name} has been ${isEditing ? 'updated' : 'recorded'}`
      });
      
      if (!isEditing) {
        form.reset(defaultValues);
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error("Failed to save test", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-h-[70vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                {isEditing ? "Edit Test Record" : "Add Test Record"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="student_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Student *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {students.filter(s => s.class === 9 || s.class === 10).map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.full_name} - Class {student.class}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="test_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Test Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter test name" className="h-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Subject *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
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
                  name="test_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Test Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onSelect={field.onChange}
                          placeholder="Select test date"
                          className="h-10"
                          fromYear={2020}
                          toYear={new Date().getFullYear()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="test_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Test Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select test type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {testTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
                  name="marks_obtained"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Marks Obtained *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter marks obtained" className="h-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="total_marks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Total Marks *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter total marks" className="h-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              className="h-10 px-6 font-medium" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Adding..."}
                </>
              ) : (
                isEditing ? "Update Test" : "Add Test"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
