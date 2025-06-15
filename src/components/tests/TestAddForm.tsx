
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
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { User, BookOpen, ClipboardList, Award, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TestAddFormProps {
  onSubmit: (data: any) => Promise<void>;
  students: { id: string; full_name?: string; class?: number | string }[];
  initialData?: any;
  isEditing?: boolean;
}

const testFormSchema = z.object({
  test_name: z.string().min(1, { message: "Test name is required" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  test_date: z.date({ required_error: "Test date is required" }),
  test_type: z.string().min(1, { message: "Test type is required" }),
  total_marks: z.coerce.number().min(1, { message: "Total marks must be positive" }),
  duration_minutes: z.coerce.number().min(1, { message: "Duration must be positive" }),
  class: z.coerce.number().min(1, { message: "Class is required" }),
  instructions: z.string().optional(),
  syllabus_covered: z.string().optional(),
});

type TestFormValues = z.infer<typeof testFormSchema>;

export function TestAddForm({ onSubmit, students, initialData, isEditing = false }: TestAddFormProps) {
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: initialData || {
      test_name: "",
      subject: "",
      test_date: new Date(),
      test_type: "MCQs Test (Standard)",
      total_marks: 100,
      duration_minutes: 60,
      class: 9,
      instructions: "",
      syllabus_covered: "",
    },
  });

  const handleSubmit = async (values: TestFormValues) => {
    console.log('Form values before submission:', values);
    
    const formattedData = {
      test_name: values.test_name,
      subject: values.subject,
      test_date: format(values.test_date, "yyyy-MM-dd"),
      test_type: values.test_type,
      total_marks: Number(values.total_marks),
      duration_minutes: Number(values.duration_minutes),
      class: Number(values.class),
      instructions: values.instructions || "",
      syllabus_covered: values.syllabus_covered || "",
    };
    
    console.log('Formatted data for submission:', formattedData);
    await onSubmit(formattedData);
  };

  return (
    <div className="w-full h-full flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden">
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
            {/* Test Information Section */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  Test Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                              <SelectItem value="Mathematics">Mathematics</SelectItem>
                              <SelectItem value="Science">Science</SelectItem>
                              <SelectItem value="Social Science">Social Science</SelectItem>
                              <SelectItem value="Hindi">Hindi</SelectItem>
                              <SelectItem value="English">English</SelectItem>
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
                    name="test_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-medium">Test Date *</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            onSelect={field.onChange}
                            placeholder="Select test date"
                            disabled={(date) => date > new Date()}
                            className="h-9 sm:h-11 border-slate-200 text-xs sm:text-sm"
                            fromYear={2020}
                            toYear={new Date().getFullYear()}
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
                        <FormLabel className="text-xs sm:text-sm font-medium">Test Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9 sm:h-11 border-slate-200 text-xs sm:text-sm">
                              <SelectValue placeholder="Select test type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Test Types</SelectLabel>
                              <SelectItem value="MCQs Test (Standard)">MCQs Test (Standard)</SelectItem>
                              <SelectItem value="MCQs Test (Normal)">MCQs Test (Normal)</SelectItem>
                              <SelectItem value="Chapter-wise Test">Chapter-wise Test</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
                        <FormLabel className="text-xs sm:text-sm font-medium">Duration (mins) *</FormLabel>
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
                              <SelectItem value="9">Class 9</SelectItem>
                              <SelectItem value="10">Class 10</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">Instructions</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter test instructions (optional)" 
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
                  name="syllabus_covered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">Syllabus Covered</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter syllabus covered (optional)" 
                          className="h-9 sm:h-11 border-slate-200 text-xs sm:text-sm" 
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
          <Award className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          {form.formState.isSubmitting ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Test' : 'Create Test')}
        </Button>
      </DialogFooter>
    </div>
  );
}
