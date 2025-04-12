
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown, Download, Calendar } from "lucide-react";
import { students, feeTransactions } from "@/mock/data";

export default function Fees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Calculate summary
  const totalFees = students.reduce((sum, student) => sum + student.totalFees, 0);
  const collectedFees = students.reduce((sum, student) => sum + student.paidFees, 0);
  const pendingFees = totalFees - collectedFees;
  const percentageCollected = Math.round((collectedFees / totalFees) * 100);

  // Filter and sort transactions
  const filteredTransactions = feeTransactions
    .filter(transaction => {
      // Handle search
      const student = students.find(s => s.id === transaction.studentId);
      const studentMatches = student?.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Handle status filter
      const statusMatches = statusFilter === "all" || 
                           (statusFilter === "paid" && transaction.paymentMode !== null) ||
                           (statusFilter === "pending" && transaction.paymentMode === null);
      
      // Handle period filter
      let periodMatches = true;
      if (periodFilter !== "all") {
        const today = new Date();
        const transactionDate = new Date(transaction.date);
        
        if (periodFilter === "thisMonth") {
          periodMatches = transactionDate.getMonth() === today.getMonth() &&
                         transactionDate.getFullYear() === today.getFullYear();
        } else if (periodFilter === "lastMonth") {
          const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
          const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
          periodMatches = transactionDate.getMonth() === lastMonth &&
                         transactionDate.getFullYear() === lastMonthYear;
        } else if (periodFilter === "thisYear") {
          periodMatches = transactionDate.getFullYear() === today.getFullYear();
        }
      }
      
      return studentMatches && statusMatches && periodMatches;
    })
    .sort((a, b) => {
      // Handle sorting
      if (sortField === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return sortDirection === "asc" 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      }
    });

  // Toggle sort direction
  const handleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Fee Management</h1>
        <Button className="bg-apple-blue hover:bg-blue-600">
          <Download className="h-4 w-4 mr-2" /> Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">₹{totalFees.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-apple-green">₹{collectedFees.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-apple-red">₹{pendingFees.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Percentage Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{percentageCollected}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="pending">Pending Fees</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Card>
            <div className="rounded-md border">
              <div className="p-4 grid grid-cols-4 text-sm font-medium">
                <div>Student</div>
                <div className="cursor-pointer flex items-center justify-start" onClick={() => handleSort("date")}>
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
                <div className="cursor-pointer flex items-center justify-start" onClick={() => handleSort("amount")}>
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
                <div>Payment Mode</div>
              </div>
              <div className="divide-y">
                {filteredTransactions.map((transaction) => {
                  const student = students.find(s => s.id === transaction.studentId);
                  return (
                    <div key={transaction.id} className="p-4 grid grid-cols-4 items-center">
                      <div>
                        <div className="font-medium">{student?.name}</div>
                        <div className="text-sm text-muted-foreground">{student?.class}</div>
                      </div>
                      <div>{new Date(transaction.date).toLocaleDateString()}</div>
                      <div className="font-medium">₹{transaction.amount.toLocaleString()}</div>
                      <div>
                        <Badge 
                          variant={
                            transaction.paymentMode === "Cash" ? "outline" : 
                            transaction.paymentMode === "Online" ? "secondary" : 
                            "default"
                          }
                        >
                          {transaction.paymentMode}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {filteredTransactions.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    No transactions found
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <div className="rounded-md border">
              <div className="p-4 grid grid-cols-4 text-sm font-medium">
                <div>Student</div>
                <div>Total Fees</div>
                <div>Paid</div>
                <div>Pending</div>
              </div>
              <div className="divide-y">
                {students
                  .filter(student => student.feeStatus !== "Paid")
                  .map((student) => (
                    <div key={student.id} className="p-4 grid grid-cols-4 items-center">
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.class}</div>
                      </div>
                      <div>₹{student.totalFees.toLocaleString()}</div>
                      <div className="text-apple-green">₹{student.paidFees.toLocaleString()}</div>
                      <div className="text-apple-red">₹{(student.totalFees - student.paidFees).toLocaleString()}</div>
                    </div>
                  ))}
                {students.filter(student => student.feeStatus !== "Paid").length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    No pending fees
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
