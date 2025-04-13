
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from "lucide-react";

interface ClassAttendanceTableProps {
  students: Array<{
    id: string;
    name: string;
    status: "Present" | "Absent" | "Leave" | "Holiday";
  }>;
  onStatusChange: (studentId: string, status: "Present" | "Absent" | "Leave") => void;
}

export function ClassAttendanceTable({ students, onStatusChange }: ClassAttendanceTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Student</TableHead>
            <TableHead className="w-[150px]">Status</TableHead>
            <TableHead className="w-[250px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length > 0 ? (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      student.status === "Present" ? "bg-green-50 border-green-200 text-green-700" :
                      student.status === "Absent" ? "bg-red-50 border-red-200 text-red-700" :
                      student.status === "Leave" ? "bg-amber-50 border-amber-200 text-amber-700" :
                      "bg-gray-50 border-gray-200 text-gray-700"
                    }
                  >
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "border",
                        student.status === "Present" 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "text-green-600 hover:bg-green-50 hover:text-green-700"
                      )}
                      onClick={() => onStatusChange(student.id, "Present")}
                    >
                      <Check className="mr-1 h-3.5 w-3.5" />
                      Present
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "border",
                        student.status === "Absent" 
                          ? "bg-red-50 text-red-700 border-red-200" 
                          : "text-red-600 hover:bg-red-50 hover:text-red-700"
                      )}
                      onClick={() => onStatusChange(student.id, "Absent")}
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      Absent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "border",
                        student.status === "Leave" 
                          ? "bg-amber-50 text-amber-700 border-amber-200" 
                          : "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                      )}
                      onClick={() => onStatusChange(student.id, "Leave")}
                    >
                      <Clock className="mr-1 h-3.5 w-3.5" />
                      Leave
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                No students found for the selected criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
