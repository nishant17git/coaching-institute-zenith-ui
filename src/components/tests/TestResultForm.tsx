
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, BookOpen } from "lucide-react";

const testResultSchema = z.object({
  student_id: z.string().min(1, "Please select a student"),
  test_id: z.string().min(1, "Please select a test"),
  marks_obtained: z.coerce.number().min(0, "Marks must be non-negative"),
  total_marks: z.coerce.number().positive("Total marks must be positive"),
});

type TestResultFormValues = z.infer<typeof testResultSchema>;

interface TestResultFormProps {
  onSubmit: (data: TestResultFormValues) => void;
  students: any[];
  tests: any[];
  initialData?: Partial<TestResultFormValues>;
  isEditing?: boolean;
}

export function TestResultForm({ 
  onSubmit, 
  students, 
  tests, 
  initialData, 
  isEditing = false 
}: TestResultFormProps) {
  const form = useForm<TestResultFormValues>({
    resolver: zodResolver(testResultSchema),
    defaultValues: {
      student_id: initialData?.student_id || "",
      test_id: initialData?.test_id || "",
      marks_obtained: initialData?.marks_obtained || 0,
      total_marks: initialData?.total_marks || 100,
    },
  });

  const handleSubmit = (data: TestResultFormValues) => {
    onSubmit(data);
    if (!isEditing) {
      form.reset();
    }
  };

  const selectedTest = tests.find(test => test.id === form.watch('test_id'));

  // Update total marks when test is selected
  React.useEffect(() => {
    if (selectedTest && selectedTest.total_marks) {
      form.setValue('total_marks', selectedTest.total_marks);
    }
  }, [selectedTest, form]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          {isEditing ? "Edit Test Result" : "Add Test Result"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Select Student *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student) => (
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

            <FormField
              control={form.control}
              name="test_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Select Test *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a test" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tests.map((test) => (
                        <SelectItem key={test.id} value={test.id}>
                          {test.test_name} - {test.subject} (Class {test.class})
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
                name="marks_obtained"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marks Obtained *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter marks obtained" 
                        {...field} 
                      />
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
                    <FormLabel>Total Marks *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter total marks" 
                        {...field} 
                        disabled={!!selectedTest}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch('marks_obtained') && form.watch('total_marks') && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Percentage:</div>
                <div className="text-lg font-semibold">
                  {Math.round((form.watch('marks_obtained') / form.watch('total_marks')) * 100)}%
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" className="w-full md:w-auto">
                {isEditing ? "Update Result" : "Add Result"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
