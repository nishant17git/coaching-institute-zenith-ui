import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Building, Upload, Save, Image as ImageIcon, MapPin, Mail, Phone, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
const instituteSchema = z.object({
  name: z.string().min(2, "Institute name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  pincode: z.string().min(6, "Pincode must be 6 digits"),
  description: z.string().optional(),
  establishedYear: z.string(),
  category: z.string()
});
const categories = ["Primary School", "Secondary School", "Higher Secondary School", "Coaching Institute", "Tuition Center", "Academy", "College", "University", "Other"];
export default function InstituteSettings() {
  const navigate = useNavigate();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const form = useForm<z.infer<typeof instituteSchema>>({
    resolver: zodResolver(instituteSchema),
    defaultValues: {
      name: "Infinity Classes",
      email: "theinfinityclasses1208@gmail.com",
      phone: "+91 9905880697",
      website: "",
      address: "Kandri, Mandar",
      city: "Ranchi",
      state: "Jharkhand",
      pincode: "834008",
      description: "",
      establishedYear: "2020",
      category: "Coaching Institute"
    }
  });
  const onSubmit = (values: z.infer<typeof instituteSchema>) => {
    toast.success("Institute settings updated successfully!");
    console.log(values);
  };
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = event => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast.success("Logo uploaded successfully!");
    }
  };
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto space-y-6 px-0 py-0 bg-white">
        <EnhancedPageHeader title="Institute Settings" description="Configure your institute information" showBackButton onBack={() => navigate("/settings")} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} className="space-y-6">
              {/* Institute Branding */}
              <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Institute Logo</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Upload your institute logo</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                      {logoPreview ? <img src={logoPreview} alt="Institute Logo" className="w-full h-full object-cover rounded-2xl" /> : <Building className="h-8 w-8 text-gray-400" />}
                    </div>
                    
                    <div className="flex gap-2">
                      <label htmlFor="logo-upload">
                        <Button variant="outline" size="sm" asChild className="cursor-pointer rounded-xl">
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Logo
                          </span>
                        </Button>
                      </label>
                      <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      {logoPreview && <Button variant="ghost" size="sm" onClick={() => setLogoPreview(null)} className="rounded-xl">
                          Remove
                        </Button>}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">512x512 px</Badge>
                      <Badge variant="secondary">PNG/JPG</Badge>
                      <Badge variant="secondary">Max 2MB</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Building className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Essential institute details</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="name" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Institute Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter institute name" className="rounded-xl border-gray-200 dark:border-gray-700" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />

                      <FormField control={form.control} name="category" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map(category => <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="establishedYear" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Established Year</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="2020" className="rounded-xl border-gray-200 dark:border-gray-700" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />

                      <FormField control={form.control} name="website" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" className="rounded-xl border-gray-200 dark:border-gray-700" {...field} />
                            </FormControl>
                            <FormDescription>Optional</FormDescription>
                            <FormMessage />
                          </FormItem>} />
                    </div>

                    <FormField control={form.control} name="description" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Brief description about your institute..." className="min-h-[80px] rounded-xl border-gray-200 dark:border-gray-700" {...field} />
                          </FormControl>
                          <FormDescription>Optional: Appears on reports and documents</FormDescription>
                          <FormMessage />
                        </FormItem>} />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <Mail className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Contact Information</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">How people can reach you</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="email" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="contact@institute.com" className="rounded-xl border-gray-200 dark:border-gray-700" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />

                      <FormField control={form.control} name="phone" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+91 9999999999" className="rounded-xl border-gray-200 dark:border-gray-700" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                    </div>

                    <FormField control={form.control} name="address" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter complete address..." className="min-h-[60px] rounded-xl border-gray-200 dark:border-gray-700" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name="city" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City name" className="rounded-xl border-gray-200 dark:border-gray-700" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />

                      <FormField control={form.control} name="state" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="State name" className="rounded-xl border-gray-200 dark:border-gray-700" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />

                      <FormField control={form.control} name="pincode" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input placeholder="123456" className="rounded-xl border-gray-200 dark:border-gray-700" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button type="submit" className="w-full rounded-xl">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </div>;
}