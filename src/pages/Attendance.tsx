import { useState, useEffect } from "react"; import { format } from "date-fns"; import { motion } from "framer-motion"; import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; import { supabase } from "@/integrations/supabase/client";

// shadcn/ui 
components import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"; import { Button } from "@/components/ui/button"; import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"; import { Calendar } from "@/components/ui/calendar"; import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"; import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"; import { Input } from "@/components/ui/input"; import { Icons } from "@/components/icons";

export default function AttendancePage() { const [date, setDate] = useState(new Date()); const [classFilter, setClassFilter] = useState<number>(10); const [search, setSearch] = useState(""); const [records, setRecords] = useState<any[]>([]);

const queryClient = useQueryClient(); const { data: students = [], isLoading: studentsLoading } = useQuery( ["students"], async () => { const { data } = await supabase.from('students').select('*'); return data || []; } );

const { data: attendance = [], isLoading: attendanceLoading } = useQuery( ["attendance", format(date, 'yyyy-MM-dd')], async () => { const { data } = await supabase .from('attendance_records') .select('*') .eq('date', format(date, 'yyyy-MM-dd')); return data || []; } );

const saveMutation = useMutation( async (payload: any[]) => { for (const record of payload) { const { data: existing } = await supabase .from('attendance_records') .select('id') .eq('student_id', record.student_id) .eq('date', record.date) .maybeSingle();

if (existing) {
      await supabase
        .from('attendance_records')
        .update({ status: record.status })
        .eq('id', existing.id);
    } else {
      await supabase.from('attendance_records').insert(record);
    }
  }
},
{
  onSuccess: () => queryClient.invalidateQueries(),
}

);

useEffect(() => { const day = format(date, 'yyyy-MM-dd'); const filtered = students .filter( (s) => s.class === classFilter && s.full_name.toLowerCase().includes(search.toLowerCase()) ) .map((s) => ({ ...s, status: attendance.find((a) => a.student_id === s.id)?.status || 'Absent', })); setRecords(filtered); }, [students, attendance, classFilter, search, date]);

const handleSave = () => { const payload = records.map((r) => ({ student_id: r.id, date: format(date, 'yyyy-MM-dd'), status: r.status, })); saveMutation.mutate(payload); };

const markAll = (status: string) => { setRecords((prev) => prev.map((r) => ({ ...r, status }))); };

return ( <motion.div className="space-y-6 p-4"> {/* Header Card */} <Card> <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center"> <div> <CardTitle>Attendance</CardTitle> <CardDescription>{format(date, 'EEEE, MMMM d')}</CardDescription> </div> <div className="flex gap-2"> <Popover> <PopoverTrigger asChild> <Button variant="outline"> <Icons.calendar className="mr-2 h-4 w-4" /> {format(date, 'MMM d, yyyy')} </Button> </PopoverTrigger> <PopoverContent align="end"> <Calendar mode="single" selected={date} onSelect={setDate} /> </PopoverContent> </Popover> <Dialog> <DialogTrigger asChild> <Button variant="outline"> <Icons.download className="mr-2 h-4 w-4" /> Export </Button> </DialogTrigger> <DialogContent> <DialogHeader> <DialogTitle>Confirm Export</DialogTitle> </DialogHeader> <DialogFooter> <Button onClick={() => { /* export logic */ }}>Yes, Export</Button> <Button variant="ghost">Cancel</Button> </DialogFooter> </DialogContent> </Dialog> </div> </CardHeader> </Card>

{/* Filters Card */}
  <Card>
    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Select value={classFilter.toString()} onValueChange={(v) => setClassFilter(+v)}>
        <SelectTrigger>
          <SelectValue placeholder="Select Class" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 9 }, (_, i) => 2 + i).map((c) => (
            <SelectItem key={c} value={c.toString()}>
              Class {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="Search student..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={() => markAll('Present')}>
          <Icons.users className="mr-2 h-4 w-4" />Present
        </Button>
        <Button onClick={() => markAll('Absent')}>
          <Icons.x className="mr-2 h-4 w-4" />Absent
        </Button>
        <Button onClick={() => markAll('Leave')}>
          <Icons.clock className="mr-2 h-4 w-4" />Leave
        </Button>
      </div>
    </CardContent>
  </Card>

  {/* Attendance Table */}
  <Card>
    <CardHeader>
      <CardTitle>Class {classFilter} Attendance</CardTitle>
      <CardDescription>{records.length} students</CardDescription>
    </CardHeader>
    <CardContent>
      {studentsLoading || attendanceLoading ? (
        <div className="flex justify-center items-center py-12">
          <Icons.loader className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.full_name}</TableCell>
                <TableCell>
                  <Select
                    value={r.status}
                    onValueChange={(status) =>
                      setRecords((prev) => prev.map((rec) => rec.id === r.id ? { ...rec, status } : rec))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Present', 'Absent', 'Leave', 'Holiday'].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardContent>
    <CardFooter className="flex justify-end">
      <Button onClick={handleSave} disabled={saveMutation.isLoading}>
        {saveMutation.isLoading ? (
          <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.save className="mr-2 h-4 w-4" />
        )}
        Save
      </Button>
    </CardFooter>
  </Card>
</motion.div>

); }

