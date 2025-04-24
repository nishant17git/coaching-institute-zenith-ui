import * as React from "react"; import { useForm } from "react-hook-form"; import { Button } from "@/components/ui/button"; import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"; import { Input } from "@/components/ui/input"; import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"; import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"; import { useData } from "@/contexts/DataContext";

interface AddStudentFormProps { open: boolean; onOpenChange: (open: boolean) => void; onSuccess?: () => void; }

export function AddStudentForm({ open, onOpenChange, onSuccess }: AddStudentFormProps) { const { classes, addStudent } = useData();

const form = useForm({ defaultValues: { name: "", class: "", fatherName: "", motherName: "", address: "", totalFees: 0, }, });

function onSubmit(values: any) { const newStudentData = { ...values, totalFees: Number(values.totalFees), paidFees: 0, attendancePercentage: 100, feeStatus: "Pending", joinDate: new Date().toISOString(), address: values.address || "Address not provided", };

addStudent(newStudentData);
onOpenChange(false);
form.reset();

if (onSuccess) {
  onSuccess();
}

}

return ( <Dialog open={open} onOpenChange={onOpenChange}> <DialogContent className="sm:max-w-[500px] animate-scale-in"> <DialogHeader> <DialogTitle>Add New Student</DialogTitle> <DialogDescription> Enter student details to create a new record. </DialogDescription> </DialogHeader> <Form {...form}> <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"> <FormField control={form.control} name="name" rules={{ required: "Name is required" }} render={({ field }) => ( <FormItem> <FormLabel>Name</FormLabel> <FormControl> <Input placeholder="Student name" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />

<FormField
          control={form.control}
          name="class"
          rules={{ required: "Class is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.name}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fatherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father's Name</FormLabel>
                <FormControl>
                  <Input placeholder="Father's name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="motherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother's Name</FormLabel>
                <FormControl>
                  <Input placeholder="Mother's name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Student address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalFees"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Fees (₹)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              </FormControl>
              <FormDescription>
                Total course fees to be paid by the student.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit">Add Student</Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>

); }

