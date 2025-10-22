import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PaymentService } from 'src/app/features/payment/payment.service';
// For export
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface Payment {
  id: number;
  transactionId: string;
  bookingId: string;
  customerId: number;
  customerName: string;
  driverId?: number;
  driverName?: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'wallet' | 'bank-transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  transactionDate: Date;
  description: string;
  commissionAmount: number;
  driverEarnings: number;
  companyEarnings: number;
  paymentGateway?: string;
  gatewayTransactionId?: string;
  refundAmount?: number;
  refundDate?: Date;
  refundReason?: string;
}

@Component({
  selector: 'app-admin-payments',
  templateUrl: './admin-payments.component.html',
  styleUrls: ['./admin-payments.component.scss']
})
export class AdminPaymentsComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = ['transactionId', 'customer', 'booking', 'amount', 'method', 'status', 'date', 'earnings', 'actions'];
  dataSource = new MatTableDataSource<Payment>();

  // Filter states
  statusFilter: string = 'all';
  methodFilter: string = 'all';
  searchQuery: string = '';
  dateRangeStart: Date | null = null;
  dateRangeEnd: Date | null = null;

  // Payment statistics
  paymentStats = {
    totalTransactions: 0,
    totalRevenue: 0,
    pendingAmount: 0,
    completedAmount: 0,
    refundedAmount: 0,
    commissionsEarned: 0,
    driverPayments: 0,
    disputedAmount: 0
  };

  // Filter options
  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'disputed', label: 'Disputed' }
  ];

  methodOptions = [
    { value: 'all', label: 'All Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'bank-transfer', label: 'Bank Transfer' }
  ];

  loading = false;
  error: string | null = null;

  constructor(private paymentService: PaymentService) { }

  ngOnInit(): void {
    this.loadPayments();
    this.calculatePaymentStats();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Custom filter predicate
    this.dataSource.filterPredicate = (data: Payment, filter: string) => {
      const searchString = filter.toLowerCase();
      return (
        data.transactionId.toLowerCase().includes(searchString) ||
        data.bookingId.toLowerCase().includes(searchString) ||
        data.customerName.toLowerCase().includes(searchString) ||
        (data.driverName && data.driverName.toLowerCase().includes(searchString)) ||
        data.paymentMethod.toLowerCase().includes(searchString)
      );
    };
  }

  /**
   * Load payments data (replace with actual service call)
   */
  loadPayments(): void {
    this.loading = true;
    this.error = null;
    this.paymentService.getAllPayments().subscribe({ next: (res) => {
      const list = Array.isArray(res) ? res : [];
      if (list.length > 0) {
        this.dataSource.data = list.map((p: any) => ({
          ...p,
          transactionDate: p.transactionDate ? new Date(p.transactionDate) : new Date(),
          refundDate: p.refundDate ? new Date(p.refundDate) : undefined
        } as Payment));
      } else {
        console.warn('PaymentService returned no data; using mock fallback');
        this.dataSource.data = this.getMockPayments();
      }
      this.loading = false;
      this.calculatePaymentStats();
    }, error: (err) => {
      console.error('Failed to load payments', err);
      this.error = 'Failed to load payments';
      this.loading = false;
      this.dataSource.data = this.getMockPayments();
      this.calculatePaymentStats();
    } });
  }

  private getMockPayments(): Payment[] {
    // minimal fallback dataset (kept small)
    return [
      {
        id: 1,
        transactionId: 'TXN001',
        bookingId: 'BK001',
        customerId: 101,
        customerName: 'John Doe',
        amount: 1200,
        paymentMethod: 'upi',
        status: 'completed',
        transactionDate: new Date(),
        description: 'Mock payment',
        commissionAmount: 120,
        driverEarnings: 1000,
        companyEarnings: 120
      }
    ];
  }

  /**
   * Calculate payment statistics
   */
  calculatePaymentStats(): void {
    const payments = this.dataSource.data;
    this.paymentStats = {
      totalTransactions: payments.length,
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      completedAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      refundedAmount: payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + (p.refundAmount || 0), 0),
      commissionsEarned: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.commissionAmount, 0),
      driverPayments: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.driverEarnings, 0),
      disputedAmount: payments.filter(p => p.status === 'disputed').reduce((sum, p) => sum + p.amount, 0)
    };
  }

  /**
   * Apply search filter
   */
  applySearchFilter(): void {
    this.dataSource.filter = this.searchQuery.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Apply status filter
   */
  applyStatusFilter(): void {
    console.log('Filtering by status:', this.statusFilter);
    // Implement filtering logic here
  }

  /**
   * Apply payment method filter
   */
  applyMethodFilter(): void {
    console.log('Filtering by payment method:', this.methodFilter);
    // Implement filtering logic here
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.methodFilter = 'all';
    this.dateRangeStart = null;
    this.dateRangeEnd = null;
    this.dataSource.filter = '';
    this.loadPayments();
  }

  /**
   * Export payments data
   */
  export(mode: string): void {
    if (mode === 'pdf') {
      this.exportPDF();
    } else if (mode === 'excel') {
      this.exportExcel();
    }
  }

  exportPDF(): void {
    const doc = new jsPDF();
    const head = [['ID', 'Amount', 'Date', 'Status']];
    const body = this.dataSource.data.map(payment => [
      payment.id,
      payment.amount,
      payment.transactionDate.toLocaleDateString(), // Format the date
      payment.status
    ]);
    autoTable(doc, { head, body, styles: { fontSize: 8 } });
    doc.save('payments_report.pdf');
  }

  exportExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
    XLSX.writeFile(workbook, 'payments_report.xlsx');
  }

  /**
   * Process refund
   */
  processRefund(payment: Payment): void {
    console.log('Processing refund for payment:', payment);
    const amountStr = prompt('Enter refund amount', String(payment.amount));
  const reasonRaw = prompt('Enter refund reason', 'Customer requested refund');
  const reason: string | undefined = reasonRaw === null ? undefined : reasonRaw;
  const amount = amountStr ? Number(amountStr) : 0;
    if (!amount || amount <= 0) return;
    this.paymentService.processRefund(payment.id, { amount, reason }).subscribe({ next: (res) => { alert('Refund processed'); this.loadPayments(); }, error: (err) => { console.error(err); alert('Refund failed'); } });
  }

  /**
   * View payment details
   */
  viewPaymentDetails(payment: Payment): void {
    console.log('Viewing payment details:', payment);
    // Navigate to payment detail page or open modal
  }

  /**
   * Retry failed payment
   */
  retryPayment(payment: Payment): void {
    console.log('Retrying payment:', payment);
    if (!confirm('Retry this payment?')) return;
    this.paymentService.retryPayment(payment.id).subscribe({ next: () => { alert('Retry initiated'); this.loadPayments(); }, error: (err) => { console.error(err); alert('Retry failed'); } });
  }

  /**
   * Resolve dispute
   */
  resolveDispute(payment: Payment): void {
    console.log('Resolving dispute for payment:', payment);
    const resolution = prompt('Enter resolution note', 'Resolved in favor of customer');
    if (!resolution) return;
    this.paymentService.resolveDispute(payment.id, { resolution }).subscribe({ next: () => { alert('Dispute resolved'); this.loadPayments(); }, error: (err) => { console.error(err); alert('Resolve failed'); } });
  }

  /**
   * Send payment reminder
   */
  sendPaymentReminder(payment: Payment): void {
    console.log('Sending payment reminder:', payment);
    this.paymentService.sendReminder(payment.id).subscribe({ next: () => { alert('Reminder sent'); }, error: (err) => { console.error(err); alert('Failed to send reminder'); } });
  }

  /**
   * View transaction receipt
   */
  viewReceipt(payment: Payment): void {
    console.log('Viewing receipt for payment:', payment);
    this.paymentService.getReceipt(payment.id).subscribe({ next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    }, error: (err) => { console.error(err); alert('Failed to load receipt'); } });
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      case 'refunded':
        return 'status-refunded';
      case 'disputed':
        return 'status-disputed';
      default:
        return 'status-unknown';
    }
  }

  /**
   * Get payment method icon
   */
  getPaymentMethodIcon(method: string): string {
    switch (method) {
      case 'cash':
        return 'fas fa-money-bill-wave';
      case 'card':
        return 'fas fa-credit-card';
      case 'upi':
        return 'fas fa-mobile-alt';
      case 'wallet':
        return 'fas fa-wallet';
      case 'bank-transfer':
        return 'fas fa-university';
      default:
        return 'fas fa-payment';
    }
  }

  /**
   * Format currency display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  /**
   * Format date display
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Get earnings breakdown for display
   */
  getEarningsBreakdown(payment: Payment): string {
    return `Driver: ${this.formatCurrency(payment.driverEarnings)} | Commission: ${this.formatCurrency(payment.commissionAmount)}`;
  }
}