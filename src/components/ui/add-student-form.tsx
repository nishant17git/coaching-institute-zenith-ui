
import * as React from "react";
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

  const handleSubmit = async (values: any) => {
    try {
      // Generate a default student with required fields
      const newStudentData = {
        ...values,
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] animate-scale-in">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter student details to create a new record.
          </DialogDescription>
        </DialogHeader>
        <StudentForm 
          classes={classes} 
          onSubmit={handleSubmit} 
          submitLabel="Add Student"
        />
      </DialogContent>
    </Dialog>
  );
}
