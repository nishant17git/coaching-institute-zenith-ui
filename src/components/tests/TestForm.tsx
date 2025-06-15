
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, BookOpen, Calendar, FileText } from "lucide-react";

// Test form schema
const testSchema = z.object({
  test_name: z.string().min(1, "Test name is required"),
  subject: z.string().min(1, "Subject is required"),
  test_date: z.date({ required_error: "Test date is required" }),
  test_type: z.string().min(1, "Test type is required"),
  total_marks: z.coerce.number().positive("Total marks must be positive"),
  duration_minutes: z.coerce.number().positive("Duration must be positive"),
  class: z.coerce.number().positive("Class is required"),
});

type TestFormValues = z.infer<typeof testSchema>;

interface TestFormProps {
  onSubmit: (data: TestFormValues) => Promise<void>;
  initialData?: Partial<TestFormValues>;
  isEditing?: boolean;
}

const SUBJECTS = ["Mathematics", "Science", "Social Science", "Hindi", "English"];
const TEST_TYPES = ["MCQs Test (Standard)", "Written Test", "Practical Test", "Oral Test"];

export function TestForm({ onSubmit, initialData, isEditing = false }: TestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      test_name: initialData?.test_name || "",
      subject: initialData?.subject || "",
      test_date: initialData?.test_date || new Date(),
      test_type: initialData?.test_type || "MCQs Test (Standard)",
      total_marks: initialData?.total_marks || 100,
      duration_minutes: initialData?.duration_minutes || 60,
      class: initialData?.class || 1,
    },
  });

  const handleSubmit = async (data: TestFormValues) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(data);
      if (!isEditing) {
        form.reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-sf-pro">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    {isEditing ? "Edit Test Details" : "Create New Test"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Test Name */}
                  <FormField
                    control={form.control}
                    name="test_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base font-medium font-sf-pro flex items-center gap-2">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                          Test Name *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter test name" 
                            className="h-11 sm:h-12 font-sf-pro text-sm sm:text-base" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="font-sf-pro text-sm" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium font-sf-pro">Subject *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 sm:h-12 font-sf-pro text-sm sm:text-base">
                                <SelectValue placeholder="Select subject" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SUBJECTS.map((subject) => (
                                <SelectItem key={subject} value={subject} className="font-sf-pro text-sm sm:text-base">
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="font-sf-pro text-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="test_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium font-sf-pro">Test Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 sm:h-12 font-sf-pro text-sm sm:text-base">
                                <SelectValue placeholder="Select test type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TEST_TYPES.map((type) => (
                                <SelectItem key={type} value={type} className="font-sf-pro text-sm sm:text-base">
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="font-sf-pro text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="test_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base font-medium font-sf-pro flex items-center gap-2">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                          Test Date *
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            date={field.value}
                            onSelect={field.onChange}
                            placeholder="Select test date"
                            className="h-11 sm:h-12 font-sf-pro text-sm sm:text-base"
                            fromYear={2020}
                            toYear={new Date().getFullYear() + 2}
                          />
                        </FormControl>
                        <FormMessage className="font-sf-pro text-sm" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium font-sf-pro">Class *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter class" 
                              className="h-11 sm:h-12 font-sf-pro text-sm sm:text-base" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="font-sf-pro text-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="total_marks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium font-sf-pro">Total Marks *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter total marks" 
                              className="h-11 sm:h-12 font-sf-pro text-sm sm:text-base" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="font-sf-pro text-sm" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration_minutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium font-sf-pro">Duration (minutes) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter duration in minutes" 
                              className="h-11 sm:h-12 font-sf-pro text-sm sm:text-base" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="font-sf-pro text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </ScrollArea>

      <div className="flex-shrink-0 border-t bg-white p-3 sm:p-6">
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="h-11 sm:h-12 px-6 sm:px-8 font-sf-pro font-medium text-sm sm:text-base w-full sm:w-auto" 
            disabled={isSubmitting}
            size="lg"
            onClick={form.handleSubmit(handleSubmit)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditing ? "Update Test" : "Create Test"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
