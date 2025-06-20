
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Calendar, Target, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TestCreateFormProps {
  onSubmit?: (data: any) => Promise<void>;
  onClose?: () => void;
  onSuccess?: () => void;
}

const testCreateSchema = z.object({
  test_name: z.string().min(1, { message: "Test name is required" }),
  subject: z.string().min(1, { message: "Please select a subject" }),
  class: z.coerce.number().min(1).max(12, { message: "Class must be between 1-12" }),
  test_date: z.string().min(1, { message: "Test date is required" }),
  total_marks: z.coerce.number().min(1, { message: "Total marks must be positive" }),
  test_type: z.string().optional(),
  duration_minutes: z.coerce.number().optional(),
  instructions: z.string().optional(),
  syllabus_covered: z.string().optional(),
});

type TestCreateValues = z.infer<typeof testCreateSchema>;

const subjects = [
  "Mathematics",
  "Physics", 
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Social Studies",
  "Computer Science",
  "Science"
];

const testTypes = [
  "Unit Test",
  "Mid Term",
  "Final Exam",
  "Assignment",
  "Quiz",
  "Project"
];

export function TestCreateForm({ onSubmit, onClose, onSuccess }: TestCreateFormProps) {
  const form = useForm<TestCreateValues>({
    resolver: zodResolver(testCreateSchema),
    defaultValues: {
      test_name: "",
      subject: "",
      class: 10,
      test_date: "",
      total_marks: 100,
      test_type: "Unit Test",
      duration_minutes: 60,
      instructions: "",
      syllabus_covered: "",
    },
  });

  const handleSubmit = async (values: TestCreateValues) => {
    try {
      console.log('Submitting test with values:', values);
      
      // Format the data properly for Supabase
      const testData = {
        test_name: values.test_name.trim(),
        subject: values.subject,
        class: parseInt(values.class.toString()),
        test_date: values.test_date,
        total_marks: parseInt(values.total_marks.toString()),
        test_type: values.test_type || "Unit Test",
        duration_minutes: values.duration_minutes ? parseInt(values.duration_minutes.toString()) : null,
        instructions: values.instructions?.trim() || null,
        syllabus_covered: values.syllabus_covered?.trim() || null,
      };
      
      console.log('Formatted test data:', testData);
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('tests')
        .insert([testData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Test created successfully:', data);
      
      // Call custom onSubmit if provided
      if (onSubmit) {
        await onSubmit(data);
      }
      
      // Reset form
      form.reset();
      
      // Show success message
      toast.success("Test created successfully!");
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close dialog
      if (onClose) {
        onClose();
      }
      
    } catch (error: any) {
      console.error('Error creating test:', error);
      toast.error(error.message || "Failed to create test. Please try again.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden">
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
            {/* Basic Test Information */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  Test Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="test_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">Test Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter test name" 
                          className="h-9 sm:h-11 border-slate-200 text-xs sm:text-sm" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-medium">Subject *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9 sm:h-11 border-slate-200 text-xs sm:text-sm">
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Subjects</SelectLabel>
                              {subjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-medium">Class *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger className="h-9 sm:h-11 border-slate-200 text-xs sm:text-sm">
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Classes</SelectLabel>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((cls) => (
                                <SelectItem key={cls} value={cls.toString()}>
                                  Class {cls}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Test Details */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Calendar className="h-4 w-4 text-green-600" />
                  Test Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="test_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-medium">Test Date *</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            className="h-9 sm:h-11 border-slate-200 text-xs sm:text-sm" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="test_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-medium">Test Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9 sm:h-11 border-slate-200 text-xs sm:text-sm">
                              <SelectValue placeholder="Select test type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Test Types</SelectLabel>
                              {testTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="total_marks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-medium">Total Marks *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Enter total marks" 
                            className="h-9 sm:h-11 border-slate-200 text-xs sm:text-sm" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-medium">Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Enter duration" 
                            className="h-9 sm:h-11 border-slate-200 text-xs sm:text-sm" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Target className="h-4 w-4 text-amber-600" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="syllabus_covered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">Syllabus Covered</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter syllabus topics covered in this test"
                          className="min-h-[60px] border-slate-200 text-xs sm:text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter test instructions for students"
                          className="min-h-[60px] border-slate-200 text-xs sm:text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>

      <DialogFooter className="pt-3 sm:pt-4 px-3 sm:px-6 pb-3 sm:pb-4 flex-shrink-0 border-t bg-white">
        <Button 
          type="submit" 
          onClick={form.handleSubmit(handleSubmit)}
          disabled={form.formState.isSubmitting}
          className="h-9 sm:h-11 px-4 sm:px-8 font-medium w-full sm:w-auto bg-black hover:bg-black/80 text-xs sm:text-sm"
        >
          <BookOpen className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          {form.formState.isSubmitting ? 'Creating...' : 'Create Test'}
        </Button>
      </DialogFooter>
    </div>
  );
}
