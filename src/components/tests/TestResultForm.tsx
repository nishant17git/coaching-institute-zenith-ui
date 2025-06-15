
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Trophy, Users, BookOpen } from "lucide-react";

// Test result form schema
const testResultSchema = z.object({
  student_id: z.string().min(1, "Please select a student"),
  test_id: z.string().min(1, "Please select a test"),
  marks_obtained: z.coerce.number().min(0, "Marks must be 0 or greater"),
  total_marks: z.coerce.number().positive("Total marks must be positive"),
});

type TestResultFormValues = z.infer<typeof testResultSchema>;

interface TestResultFormProps {
  onSubmit: (data: TestResultFormValues & { percentage: number }) => void;
  students: any[];
  tests: any[];
  initialData?: any;
  isEditing?: boolean;
}

export function TestResultForm({ 
  onSubmit, 
  students, 
  tests, 
  initialData, 
  isEditing = false 
}: TestResultFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TestResultFormValues>({
    resolver: zodResolver(testResultSchema),
    defaultValues: {
      student_id: initialData?.student_id || "",
      test_id: initialData?.test_id || "",
      marks_obtained: initialData?.marks_obtained || 0,
      total_marks: initialData?.total_marks || 100,
    },
  });

  const handleSubmit = async (data: TestResultFormValues) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const percentage = Math.round((data.marks_obtained / data.total_marks) * 100);
      await onSubmit({ ...data, percentage });
      
      if (!isEditing) {
        form.reset({
          student_id: "",
          test_id: "",
          marks_obtained: 0,
          total_marks: 100,
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedMarks = form.watch("marks_obtained");
  const watchedTotal = form.watch("total_marks");
  const percentage = watchedTotal > 0 ? Math.round((watchedMarks / watchedTotal) * 100) : 0;

  return (
    <div className="w-full h-full flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-sf-pro">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    {isEditing ? "Edit Test Result" : "Add Test Result"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Student Selection */}
                  <FormField
                    control={form.control}
                    name="student_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base font-medium font-sf-pro flex items-center gap-2">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                          Select Student *
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 sm:h-12 font-sf-pro text-sm sm:text-base">
                              <SelectValue placeholder="Choose a student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel className="font-sf-pro">Students</SelectLabel>
                              {students.map((student) => (
                                <SelectItem key={student.id} value={student.id} className="font-sf-pro text-sm sm:text-base">
                                  {student.full_name} - Class {student.class}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage className="font-sf-pro text-sm" />
                      </FormItem>
                    )}
                  />

                  {/* Test Selection */}
                  <FormField
                    control={form.control}
                    name="test_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base font-medium font-sf-pro flex items-center gap-2">
                          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                          Select Test *
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 sm:h-12 font-sf-pro text-sm sm:text-base">
                              <SelectValue placeholder="Choose a test" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel className="font-sf-pro">Available Tests</SelectLabel>
                              {tests.map((test) => (
                                <SelectItem key={test.id} value={test.id} className="font-sf-pro text-sm sm:text-base">
                                  {test.test_name} - {test.subject}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage className="font-sf-pro text-sm" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="marks_obtained"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base font-medium font-sf-pro">Marks Obtained *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter marks obtained" 
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
                  </div>

                  {/* Calculated Percentage Display */}
                  {watchedTotal > 0 && (
                    <div className="p-3 sm:p-4 bg-muted/20 rounded-lg border">
                      <div className="text-sm sm:text-base font-medium font-sf-pro mb-1">Calculated Percentage</div>
                      <div className="text-lg sm:text-xl font-bold font-sf-pro text-primary">
                        {percentage}%
                      </div>
                    </div>
                  )}
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
                {isEditing ? "Updating..." : "Adding..."}
              </>
            ) : (
              isEditing ? "Update Result" : "Add Result"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
