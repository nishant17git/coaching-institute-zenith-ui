import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useData } from "@/contexts/DataContext";
import { StudentForm } from "@/components/students/StudentForm";
import { toast } from "sonner";

interface AddStudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddStudentForm({ open, onOpenChange, onSuccess }: AddStudentFormProps) {
  const { classes, addStudent } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      
      // Format the data before submission
      const newStudentData = {
        ...values,
        class: values.class, // Ensure class is passed as received from form
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter student details to create a new record.
          </DialogDescription>
        </DialogHeader>
        <StudentForm 
          classes={classes} 
          onSubmit={handleSubmit} 
          submitLabel={isSubmitting ? "Adding..." : "Add Student"}
        />
      </DialogContent>
    </Dialog>
  );
}
