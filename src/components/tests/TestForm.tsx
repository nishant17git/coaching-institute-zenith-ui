
import React from "react";
import { TestAddForm } from "./TestAddForm";

interface TestFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isEditing?: boolean;
}

export function TestForm({ onSubmit, initialData, isEditing = false }: TestFormProps) {
  return (
    <TestAddForm 
      onSubmit={onSubmit} 
      students={[]} 
      initialData={initialData} 
      isEditing={isEditing} 
    />
  );
}
