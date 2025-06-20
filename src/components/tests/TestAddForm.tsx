
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { User, Award, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { StudentCombobox } from "@/components/ui/student-combobox";
import { supabase } from "@/integrations/supabase/client";

interface TestAddFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isEditing?: boolean;
}

const testFormSchema = z.object({
  student_id: z.string().min(1, { message: "Please select a student" }),
  test_id: z.string().min(1, { message: "Please select a test" }),
  marks_obtained: z.coerce.number().min(0, { message: "Marks obtained must be non-negative" }),
  total_marks: z.coerce.number().min(1, { message: "Total marks must be positive" }),
}).refine((data) => data.marks_obtained <= data.total_marks, {
  message: "Marks obtained cannot exceed total marks",
  path: ["marks_obtained"],
});

type TestFormValues = z.infer<typeof testFormSchema>;

export function TestAddForm({ onSubmit, initialData, isEditing = false }: TestAddFormProps) {
  const { tests, students } = useData();
  
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: initialData || {
      student_id: "",
      test_id: "",
      marks_obtained: 0,
      total_marks: 100,
    },
  });

  const handleSubmit = async (values: TestFormValues) => {
    try {
      console.log('Form values before submission:', values);
      
      const formattedData = {
        student_id: values.student_id,
        test_id: values.test_id,
        marks_obtained: Number(values.marks_obtained),
        total_marks: Number(values.total_marks),
        percentage: Math.round((Number(values.marks_obtained) / Number(values.total_marks)) * 100),
        test_date: new Date().toISOString().split('T')[0], // Add current date
        status: 'Completed' // Add default status
      };
      
      console.log('Formatted data for submission:', formattedData);
      
      // Direct Supabase insertion to ensure data is saved
      if (isEditing && initialData?.id) {
        const { error } = await supabase
          .from('test_results')
          .update(formattedData)
          .eq('id', initialData.id);
        
        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('test_results')
          .insert([formattedData]);
        
        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }
      }
      
      // Also call the original onSubmit function
      await onSubmit(formattedData);
      
      if (!isEditing) {
        form.reset();
        toast.success("Test result added successfully");
      } else {
        toast.success("Test result updated successfully");
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} test result: ${error.message || 'Unknown error'}`);
    }
  };

  // Filter students to only Class 9 and 10 using Student interface
  const validStudents = students.filter(student => 
    student.id && student.id.trim() !== "" && 
    student.name && student.name.trim() !== "" &&
    (student.class === "9" || student.class === "10")
  );

  const selectedTest = tests.find(test => test.id === form.watch('test_id'));

  // Update total marks when test is selected
  React.useEffect(() => {
    if (selectedTest && selectedTest.total_marks) {
      form.setValue('total_marks', selectedTest.total_marks);
    }
  }, [selectedTest, form]);

  return (
    <div className="w-full h-full flex flex-col max-h-[85vh] sm:max-h-[90vh] overflow-hidden">
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
            {/* Student Selection Section */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <User className="h-4 w-4 text-blue-600" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="student_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">Student (Class 9 & 10 only) *</FormLabel>
                      <FormControl>
                        <StudentCombobox
                          students={validStudents}
                          value={field.value}
                          onSelect={field.onChange}
                          placeholder="Select a student"
                          className="w-full h-9 sm:h-11 border-slate-200 text-xs sm:text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Test Selection Section */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Award className="h-4 w-4 text-green-600" />
                  Test Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="test_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-sm font-medium">Test *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full h-9 sm:h-11 border-slate-200 text-xs sm:text-sm">
                            <SelectValue placeholder="Select a test" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[200px]">
                          <SelectGroup>
                            <SelectLabel>Available Tests</SelectLabel>
                            {tests.map((test) => (
                              <SelectItem key={test.id} value={test.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium text-xs sm:text-sm">{test.test_name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {test.subject} - Class {test.class} ({test.total_marks} marks)
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Marks Section */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Target className="h-4 w-4 text-amber-600" />
                  Marks Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="marks_obtained"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-medium">Marks Obtained *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Enter marks obtained" 
                            className="w-full h-9 sm:h-11 border-slate-200 text-xs sm:text-sm" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
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
                            className="w-full h-9 sm:h-11 border-slate-200 text-xs sm:text-sm" 
                            {...field}
                            disabled={!!selectedTest}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch('marks_obtained') && form.watch('total_marks') && (
                  <div className="bg-muted p-4 rounded-lg mt-4">
                    <div className="text-sm text-muted-foreground">Percentage:</div>
                    <div className="text-lg font-semibold">
                      {Math.round((form.watch('marks_obtained') / form.watch('total_marks')) * 100)}%
                    </div>
                  </div>
                )}
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
          {form.formState.isSubmitting ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Test Result' : 'Add Test Result')}
        </Button>
      </DialogFooter>
    </div>
  );
}
