import { useState, useEffect } from "react"; import { format } from "date-fns"; import { motion } from "framer-motion"; import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; import { supabase } from "@/integrations/supabase/client";

// shadcn/ui components import { Card, CardContent, CardHeader, CardTitle, CardDescription, } from "@/components/ui/card"; import { Button } from "@/components/ui/button"; import { Popover, PopoverTrigger, PopoverContent, } from "@/components/ui/popover"; import { Calendar } from "@/components/ui/calendar"; import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"; import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"; import { Input } from "@/components/ui/input"; import { Badge } from "@/components/ui/badge"; import { Icons } from "@/components/icons";

export default function AttendancePage() { const [date, setDate] = useState(new Date()); const [classFilter, setClassFilter] = useState<number>(10); const [search, setSearch] = useState(""); const [records, setRecords] = useState<any[]>([]);

const queryClient = useQueryClient(); const { data: students = [], isLoading } = useQuery( ["students"], async () => (await supabase.from('students').select('*')).data );

const { data: attendance = [] } = useQuery( ["attendance", format(date, 'yyyy-MM-dd')], async () => (await supabase.from('attendance_records').select('*').eq('date', format(date, 'yyyy-MM-dd'))).data );

const saveMutation = useMutation( async (payload: any[]) => { // upsert logic here }, { onSuccess: () => queryClient.invalidateQueries() } );

useEffect(() => { // merge student list with attendance status const day = format(date, 'yyyy-MM-dd'); const filtered = students .filter(s => s.class === classFilter && s.full_name.toLowerCase().includes(search.toLowerCase())) .map(s => ({ ...s, status: attendance.find(a => a.student_id === s.id)?.status || 'Absent' })); setRecords(filtered); }, [students, attendance, classFilter, search, date]);

return ( <motion.div className="space-y-6 p-4"> <Card> <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center"> <div> <CardTitle>Attendance</nCardTitle> <CardDescription>{format(date, 'EEEE, MMMM d')}</CardDescription> </div> <div className="flex gap-2"> <Popover> <PopoverTrigger asChild> <Button variant="outline"> <Icons.calendar className="mr-2 h-4 w-4" /> {format(date, 'MMM d, yyyy')} </Button> </PopoverTrigger> <PopoverContent align="end"> <Calendar mode="single" selected={date} onSelect={setDate} /> </PopoverContent> </Popover> <Dialog> <DialogTrigger asChild> <Button variant="outline"> <Icons.download className="mr-2 h-4 w-4" /> Export </Button> </DialogTrigger> <DialogContent> <DialogHeader> <DialogTitle>Confirm Export</DialogTitle> </DialogHeader> <DialogFooter> <Button onClick={() => {/* export logic */}}>Yes, Export</Button> <Button variant="ghost">Cancel</Button> </DialogFooter> </DialogContent> </Dialog> </div> </CardHeader> </Card>

<Card>
    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Select value={classFilter.toString()} onValueChange={v => setClassFilter(+v)}>
        <SelectTrigger>
          <SelectValue placeholder="Select Class" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 8 }, (_, i) => 2 + i).map(c => (
            <SelectItem key={c} value={c.toString()}>Class {c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)} />
      <Button onClick={() => setRecords(records.map(r => ({ ...r, status: 'Present' })))}>
        <Icons.users className="mr-2 h-4 w-4" />Mark All Present
      </Button>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>
      <CardTitle>Class {classFilter} Attendance</CardTitle>
      <CardDescription>{records.length} students</CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map(r => (
            <TableRow key={r.id}>
              <TableCell>{r.full_name}</TableCell>
              <TableCell>
                <Select value={r.status} onValueChange={status => {/* update record locally */}}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Present','Absent','Leave','Holiday'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
    <CardFooter className="flex justify-end">
      <Button onClick={() => saveMutation.mutate(records)} disabled={saveMutation.isLoading}>
        {saveMutation.isLoading ? <Icons.loader className="animate-spin" /> : <Icons.save />} Save
      </Button>
    </CardFooter>
  </Card>
</motion.div>

); }

