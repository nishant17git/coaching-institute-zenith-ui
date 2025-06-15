
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Props: 
//   result: any,
//   student?: any,
//   test?: any,
//   onEdit: () => void
interface TestResultCardProps {
  result: any;
  student?: any;
  test?: any;
  onEdit: () => void;
}

export const TestResultCard: React.FC<TestResultCardProps> = ({ result, student, test, onEdit }) => {
  return (
    <Card className="border-muted">
      <CardHeader>
        <CardTitle className="text-base font-bold">
          {student?.full_name || "Student"} - {test?.test_name || "Test"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm mb-2">Subject: {test?.subject || "N/A"}</div>
        <div className="text-sm mb-2">Class: {student?.class ? `Class ${student.class}` : "N/A"}</div>
        <div className="text-sm mb-2">Marks: {result.marks_obtained} / {result.total_marks}</div>
        <div className="text-xs text-muted-foreground mb-2">Percentage: {result.percentage}%</div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestResultCard;
