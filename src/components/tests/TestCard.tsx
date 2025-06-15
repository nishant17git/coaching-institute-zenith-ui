
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Props: test: any, onEdit: () => void
interface TestCardProps {
  test: any;
  onEdit: () => void;
}

export const TestCard: React.FC<TestCardProps> = ({ test, onEdit }) => {
  return (
    <Card className="border-muted">
      <CardHeader>
        <CardTitle className="text-base font-bold">{test.test_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm mb-2">Subject: {test.subject}</div>
        <div className="text-sm mb-2">Class: {test.class}</div>
        <div className="text-xs text-muted-foreground mb-2">
          Date: {test.test_date ? new Date(test.test_date).toLocaleDateString() : ""}
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestCard;
