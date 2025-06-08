import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { User, Phone, MapPin, CreditCard, Calendar as CalendarIcon, Hash, CalendarIcon as CalendarIconLucide } from "lucide-react";
import { cn } from "@/lib/utils";

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  class: z.string().min(1, "Class is required"),
  rollNumber: z.number().optional(),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().optional(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  whatsappNumber: z.string().optional(),
  address: z.string().optional(),
  totalFees: z.number().min(0, "Total fees must be non-negative"),
  gender: z.enum(["Male", "Female"]).optional(),
  dateOfBirth: z.date().optional(),
  aadhaarNumber: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface OptimizedStudentFormProps {
  student?: any;
  classes: any[];
  onSubmit: (data: StudentFormData) => void;
}

export function OptimizedStudentForm({ student, classes, onSubmit }: OptimizedStudentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student?.full_name || "",
      class: student ? `Class ${student.class}` : "",
      rollNumber: student?.roll_number || undefined,
      fatherName: student?.father_name || "",
      motherName: student?.mother_name || "",
      phoneNumber: student?.contact_number || "",
      whatsappNumber: student?.whatsapp_number || "",
      address: student?.address || "",
      totalFees: student?.total_fees || 0,
      gender: student?.gender || undefined,
      dateOfBirth: student?.date_of_birth ? new Date(student.date_of_birth) : undefined,
      aadhaarNumber: student?.aadhaar_number || "",
    },
  });

  const selectedClass = watch("class");
  const selectedGender = watch("gender");
  const selectedDateOfBirth = watch("dateOfBirth");

  // Function to handle numeric input only
  const handleNumericInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (allowedKeys.includes(e.key)) return;
    if (e.key >= '0' && e.key <= '9') return;
    e.preventDefault();
  };

  const handleFormSubmit = (data: StudentFormData) => {
    // Pass the data directly without formatting the dateOfBirth
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Personal Information */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-blue-600" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter student's full name"
                {...register("name")}
                className={errors.name ? "border-red-500" : "border-slate-200"}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rollNumber" className="text-sm font-medium">Roll Number</Label>
              <Input
                id="rollNumber"
                type="text"
                placeholder="Enter roll number"
                onKeyDown={handleNumericInput}
                {...register("rollNumber", { 
                  valueAsNumber: true,
                  setValueAs: (value) => value === "" ? undefined : parseInt(value)
                })}
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class" className="text-sm font-medium">Class *</Label>
              <Select value={selectedClass} onValueChange={(value) => setValue("class", value)}>
                <SelectTrigger className={errors.class ? "border-red-500" : "border-slate-200"}>
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
              {errors.class && <p className="text-sm text-red-500">{errors.class.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
              <Select value={selectedGender} onValueChange={(value) => setValue("gender", value as "Male" | "Female")}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-slate-200",
                      !selectedDateOfBirth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIconLucide className="mr-2 h-4 w-4" />
                    {selectedDateOfBirth ? format(selectedDateOfBirth, "PPP") : "Select date of birth"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDateOfBirth}
                    onSelect={(date) => setValue("dateOfBirth", date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aadhaarNumber" className="text-sm font-medium">Aadhaar Number</Label>
              <Input
                id="aadhaarNumber"
                type="text"
                placeholder="Enter Aadhaar number"
                onKeyDown={handleNumericInput}
                {...register("aadhaarNumber")}
                className="border-slate-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guardian Information */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-green-600" />
            Guardian Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fatherName" className="text-sm font-medium">Father's Name *</Label>
              <Input
                id="fatherName"
                placeholder="Enter father's name"
                {...register("fatherName")}
                className={errors.fatherName ? "border-red-500" : "border-slate-200"}
              />
              {errors.fatherName && <p className="text-sm text-red-500">{errors.fatherName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherName" className="text-sm font-medium">Mother's Name</Label>
              <Input
                id="motherName"
                placeholder="Enter mother's name"
                {...register("motherName")}
                className="border-slate-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-purple-600" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="text"
                placeholder="Enter phone number"
                onKeyDown={handleNumericInput}
                {...register("phoneNumber")}
                className={errors.phoneNumber ? "border-red-500" : "border-slate-200"}
              />
              {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="text-sm font-medium">WhatsApp Number</Label>
              <Input
                id="whatsappNumber"
                type="text"
                placeholder="Enter WhatsApp number"
                onKeyDown={handleNumericInput}
                {...register("whatsappNumber")}
                className="border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">Address</Label>
            <Textarea
              id="address"
              placeholder="Enter complete address"
              {...register("address")}
              className="border-slate-200 min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Fee Information */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-amber-600" />
            Fee Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="totalFees" className="text-sm font-medium">Total Fees (₹) *</Label>
            <Input
              id="totalFees"
              type="number"
              step="0.01"
              placeholder="Enter total fees"
              {...register("totalFees", { valueAsNumber: true })}
              className={errors.totalFees ? "border-red-500" : "border-slate-200"}
            />
            {errors.totalFees && <p className="text-sm text-red-500">{errors.totalFees.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-black hover:bg-black/80 px-8"
        >
          {isSubmitting ? "Saving..." : student ? "Update Student" : "Add Student"}
        </Button>
      </div>
    </form>
  );
}
