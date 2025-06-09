
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CalendarIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const testRecordSchema = z.object({
  test_name: z.string().min(1, "Test name is required"),
  subject: z.string().min(1, "Subject is required"),
  class: z.coerce.number().min(1, "Class is required"),
  test_date: z.string().min(1, "Test date is required"),
  total_marks: z.coerce.number().positive("Total marks must be positive"),
  duration_minutes: z.coerce.number().positive("Duration must be positive"),
  test_type: z.string().optional(),
  syllabus_covered: z.string().optional(),
  instructions: z.string().optional(),
});

type TestRecordFormValues = z.infer<typeof testRecordSchema>;

interface TestRecordFormProps {
  onSubmit: (data: TestRecordFormValues) => Promise<void>;
  submitLabel?: string;
  testRecord?: any;
  onDelete?: () => Promise<void>;
}

const SUBJECTS = [
  "Mathematics", "English", "Science", "Social Studies", "Hindi",
  "Physics", "Chemistry", "Biology", "Computer Science", "History",
  "Geography", "Economics", "Political Science", "Physical Education"
];

const TEST_TYPES = [
  "Unit Test", "Mid Term", "Final Exam", "Weekly Test", "Monthly Test",
  "Practice Test", "Mock Test", "Surprise Test"
];

export function TestRecordForm({ 
  onSubmit, 
  submitLabel = "Add Test Record", 
  testRecord,
  onDelete
}: TestRecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const defaultValues = testRecord ? {
    test_name: testRecord.test_name || "",
    subject: testRecord.subject || "",
    class: testRecord.class || 1,
    test_date: testRecord.test_date || format(new Date(), "yyyy-MM-dd"),
    total_marks: testRecord.total_marks || 0,
    duration_minutes: testRecord.duration_minutes || 60,
    test_type: testRecord.test_type || "",
    syllabus_covered: testRecord.syllabus_covered || "",
    instructions: testRecord.instructions || "",
  } : {
    test_name: "",
    subject: "",
    class: 1,
    test_date: format(new Date(), "yyyy-MM-dd"),
    total_marks: 0,
    duration_minutes: 60,
    test_type: "",
    syllabus_covered: "",
    instructions: "",
  };

  const form = useForm<TestRecordFormValues>({
    resolver: zodResolver(testRecordSchema),
    defaultValues,
  });

  const handleSubmit = async (data: TestRecordFormValues) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log('Submitting test record data:', data);
      
      await onSubmit(data);
      
      if (!testRecord) {
        form.reset(defaultValues);
      }
      toast.success(testRecord ? "Test record updated successfully!" : "Test record added successfully!");
    } catch (error) {
      console.error('Test record submission error:', error);
      toast.error(testRecord ? "Failed to update test record. Please try again." : "Failed to add test record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;

    try {
      setIsDeleting(true);
      await onDelete();
      toast.success("Test record deleted successfully!");
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Failed to delete test record. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedDate = form.watch("test_date") ? new Date(form.watch("test_date")) : undefined;

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Test Record Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="test_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter test name" {...field} />
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
                      <FormLabel>Subject *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SUBJECTS.map((subject) => (
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((classNum) => (
                            <SelectItem key={classNum} value={classNum.toString()}>
                              Class {classNum}
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
                  name="total_marks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Marks *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter total marks" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter duration" {...field} />
                      </FormControl>
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
                      <FormLabel>Test Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="test_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select test type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TEST_TYPES.map((type) => (
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

              <FormField
                control={form.control}
                name="syllabus_covered"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Syllabus Covered</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter syllabus covered in this test" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter test instructions" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            {testRecord && onDelete && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            )}
            <div className="flex-1 flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {testRecord ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  testRecord ? "Update Test Record" : submitLabel
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
