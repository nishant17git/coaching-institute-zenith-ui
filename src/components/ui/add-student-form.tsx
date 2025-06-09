
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useData } from "@/contexts/DataContext";
import { StudentForm } from "@/components/students/StudentForm";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddStudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddStudentForm({ open, onOpenChange, onSuccess }: AddStudentFormProps) {
  const { addStudent, classes } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      
      // Format the data before submission
      const newStudentData = {
        ...values,
        class: values.class,
        rollNumber: values.rollNumber ? parseInt(values.rollNumber) : undefined,
        totalFees: values.totalFees ? parseFloat(values.totalFees) : 0,
        dateOfBirth: values.dateOfBirth || new Date().toISOString().split('T')[0],
        paidFees: 0,
        attendancePercentage: 100,
        feeStatus: "Pending",
        joinDate: new Date().toISOString().split('T')[0],
      };

      await addStudent(newStudentData);
      onOpenChange(false);
      toast.success("Student added successfully");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error("Failed to add student");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[95vh] sm:h-[90vh] p-0 font-geist flex flex-col">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex-shrink-0">
          <DialogTitle className="text-xl font-geist">Add New Student</DialogTitle>
          <DialogDescription className="font-geist">
            Enter student details to create a new record. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="pr-2 sm:pr-0">
            <StudentForm 
              classes={classes || []}
              onSubmit={handleSubmit} 
              submitLabel={isSubmitting ? "Adding..." : "Add Student"}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
