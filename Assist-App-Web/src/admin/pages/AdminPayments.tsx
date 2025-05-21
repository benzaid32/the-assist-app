import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { firestore } from '../../lib/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Eye,
  DollarSign
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Payment interface with proper typing
interface Payment {
  id: string;
  applicantId: string;
  applicantName: string;
  amount: number;
  biller: string;
  billerAccount?: string;
  date: string;
  status: PaymentStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  processedAt?: Timestamp;
  notes?: string;
}

// Applicant interface
interface Applicant {
  id: string;
  name: string;
  email?: string;
  status?: string;
}

type PaymentStatus = 'pending' | 'sent' | 'failed';

// Form schema for adding new payment
const paymentFormSchema = z.object({
  applicantId: z.string({
    required_error: "Please select an applicant",
  }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  biller: z.string().min(2, {
    message: "Biller name must be at least 2 characters",
  }),
  billerAccount: z.string().optional(),
});

const AdminPayments = () => {
  // State management with proper typing
  const [payments, setPayments] = useState<Payment[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch payments and applicants from Firestore
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch payments with proper query and error handling
        const paymentsQuery = query(
          collection(firestore, 'payments'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        
        const paymentsSnapshot = await getDocs(paymentsQuery);
        const paymentsData: Payment[] = [];
        
        paymentsSnapshot.forEach((doc) => {
          const data = doc.data();
          paymentsData.push({
            id: doc.id,
            applicantId: data.applicantId,
            applicantName: data.applicantName,
            amount: data.amount,
            biller: data.biller,
            billerAccount: data.billerAccount,
            date: data.createdAt?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            status: data.status as PaymentStatus,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            processedAt: data.processedAt,
            notes: data.notes
          });
        });
        
        setPayments(paymentsData);
        
        // Fetch applicants
        const applicantsQuery = query(
          collection(firestore, 'applicants'),
          where('status', '==', 'approved')
        );
        
        const applicantsSnapshot = await getDocs(applicantsQuery);
        const applicantsData: Applicant[] = [];
        
        applicantsSnapshot.forEach((doc) => {
          const data = doc.data();
          applicantsData.push({
            id: doc.id,
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            email: data.email,
            status: data.status
          });
        });
        
        setApplicants(applicantsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load payment data. Please try again.');
        toast({
          title: "Data Loading Error",
          description: err instanceof Error ? err.message : 'An unknown error occurred',
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const paymentForm = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      applicantId: "",
      amount: "",
      biller: "",
      billerAccount: "",
    },
  });
  
  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };
  
  const filteredPayments = payments.filter((payment) =>
    payment.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.biller?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingCount = filteredPayments.filter(p => p.status === 'pending').length;
  const sentCount = filteredPayments.filter(p => p.status === 'sent').length;
  const failedCount = filteredPayments.filter(p => p.status === 'failed').length;
  
  const handleCreatePayment = async (values: z.infer<typeof paymentFormSchema>) => {
    try {
      // Find selected applicant
      const selectedApplicant = applicants.find(
        (applicant) => applicant.id === values.applicantId
      );

      if (!selectedApplicant) {
        toast({
          title: "Error",
          description: "Selected applicant not found",
          variant: "destructive"
        });
        return;
      }

      // Create payment document with Firestore
      const newPaymentRef = doc(collection(firestore, 'payments'));
      const timestamp = Timestamp.now();
      
      const newPayment: Omit<Payment, 'id'> = {
        applicantId: values.applicantId,
        applicantName: selectedApplicant.name,
        amount: parseInt(values.amount),
        biller: values.biller,
        billerAccount: values.billerAccount,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        createdAt: timestamp,
        updatedAt: timestamp,
        notes: 'Created via admin dashboard'
      };

      // Save to Firestore
      await setDoc(newPaymentRef, newPayment);
      
      // Update local state with new payment
      setPayments(prevPayments => [
        {
          id: newPaymentRef.id,
          ...newPayment
        },
        ...prevPayments
      ]);

      toast({
        title: "Payment Created",
        description: `Payment of $${values.amount} to ${values.biller} has been scheduled.`
      });

      setPaymentDialogOpen(false);
      paymentForm.reset();
    } catch (err) {
      console.error('Error creating payment:', err);
      toast({
        title: "Error Creating Payment",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive"
      });
    }
  };
  
  const viewPaymentDetails = (payment: any) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-yellow-500 text-sm font-medium">Pending</span>
          </div>
        );
      case 'sent':
        return (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-500 text-sm font-medium">Sent</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-500 text-sm font-medium">Failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-gray-500 text-sm font-medium">Unknown</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          Manage and track assistance payments
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold">{sentCount}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div className="text-2xl font-bold">{pendingCount}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <div className="text-2xl font-bold">{failedCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setPaymentDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Payment
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Biller</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                <TableCell>
                  <div>
                    <div>{payment.applicantName}</div>
                    <div className="text-xs text-muted-foreground">{payment.applicantId}</div>
                  </div>
                </TableCell>
                <TableCell>${payment.amount.toLocaleString()}</TableCell>
                <TableCell>{payment.biller}</TableCell>
                <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(payment.status as PaymentStatus)}
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => viewPaymentDetails(payment)}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only md:not-sr-only md:ml-2">View Details</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* New Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Payment</DialogTitle>
            <DialogDescription>
              Enter the payment details for financial assistance
            </DialogDescription>
          </DialogHeader>
          
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(handleCreatePayment)} className="space-y-4">
              <FormField
                control={paymentForm.control}
                name="applicantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applicant</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select applicant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoading ? (
                          <SelectItem value="loading" disabled>Loading applicants...</SelectItem>
                        ) : applicants.length > 0 ? (
                          applicants.map((applicant) => (
                            <SelectItem key={applicant.id} value={applicant.id}>
                              {applicant.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No approved applicants found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input placeholder="500.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={paymentForm.control}
                name="biller"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biller/Vendor</FormLabel>
                    <FormControl>
                      <Input placeholder="ACME Utilities" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={paymentForm.control}
                name="billerAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biller Account/Reference (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Account #123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" className="w-full">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Create Payment
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Payment Details Dialog */}
      {selectedPayment && (
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Transaction {selectedPayment.id}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-center mb-2">
                  <span className="text-2xl font-bold">${selectedPayment.amount}</span>
                  <div className="flex items-center justify-center mt-1">
                    {getStatusIcon(selectedPayment.status as PaymentStatus)}
                    <span className="capitalize ml-1 text-sm">{selectedPayment.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-2">
                <Label className="text-muted-foreground">Transaction ID</Label>
                <span className="font-mono">{selectedPayment.id}</span>
                
                <Label className="text-muted-foreground">Date</Label>
                <span>{new Date(selectedPayment.date).toLocaleDateString()}</span>
                
                <Label className="text-muted-foreground">Recipient</Label>
                <span>{selectedPayment.applicantName}</span>
                
                <Label className="text-muted-foreground">Applicant ID</Label>
                <span className="font-mono">{selectedPayment.applicantId}</span>
                
                <Label className="text-muted-foreground">Biller</Label>
                <span>{selectedPayment.biller}</span>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <Label className="text-muted-foreground block mb-2">Payment Receipt</Label>
                <div className="flex justify-center">
                  {selectedPayment.status === 'sent' ? (
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download Receipt
                    </Button>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      {selectedPayment.status === 'pending' ? 
                        'Receipt will be available once payment is processed' : 
                        'No receipt available for failed payment'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              {selectedPayment.status === 'pending' ? (
                <Button className="w-full" onClick={() => {
                  toast({
                    title: "Payment processed",
                    description: `Payment of $${selectedPayment.amount} has been sent to ${selectedPayment.biller}.`,
                  });
                  setDetailsDialogOpen(false);
                }}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Process Payment Now
                </Button>
              ) : selectedPayment.status === 'failed' ? (
                <Button className="w-full" onClick={() => {
                  toast({
                    title: "Payment retried",
                    description: `Payment of $${selectedPayment.amount} has been resubmitted.`,
                  });
                  setDetailsDialogOpen(false);
                }}>
                  <Clock className="mr-2 h-4 w-4" />
                  Retry Payment
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminPayments;
