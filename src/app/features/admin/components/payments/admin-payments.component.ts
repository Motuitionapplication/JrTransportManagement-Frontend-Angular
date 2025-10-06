import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

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

  constructor() { }

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
    const mockPayments: Payment[] = [
      {
        id: 1,
        transactionId: 'TXN001234567',
        bookingId: 'BK001',
        customerId: 101,
        customerName: 'John Doe',
        driverId: 201,
        driverName: 'Raj Kumar',
        amount: 2500.00,
        paymentMethod: 'upi',
        status: 'completed',
        transactionDate: new Date('2024-01-15T10:30:00'),
        description: 'Transport service Mumbai to Pune',
        commissionAmount: 250.00,
        driverEarnings: 2000.00,
        companyEarnings: 250.00,
        paymentGateway: 'Razorpay',
        gatewayTransactionId: 'razorpay_ABC123'
      },
      {
        id: 2,
        transactionId: 'TXN001234568',
        bookingId: 'BK002',
        customerId: 102,
        customerName: 'Sarah Johnson',
        driverId: 202,
        driverName: 'Suresh Patel',
        amount: 3500.00,
        paymentMethod: 'card',
        status: 'completed',
        transactionDate: new Date('2024-01-14T15:45:00'),
        description: 'Freight delivery Ahmedabad to Mumbai',
        commissionAmount: 350.00,
        driverEarnings: 2800.00,
        companyEarnings: 350.00,
        paymentGateway: 'Stripe',
        gatewayTransactionId: 'stripe_DEF456'
      },
      {
        id: 3,
        transactionId: 'TXN001234569',
        bookingId: 'BK003',
        customerId: 103,
        customerName: 'Mike Wilson',
        amount: 1800.00,
        paymentMethod: 'cash',
        status: 'pending',
        transactionDate: new Date('2024-01-14T09:20:00'),
        description: 'Local delivery within Bangalore',
        commissionAmount: 180.00,
        driverEarnings: 1440.00,
        companyEarnings: 180.00
      },
      {
        id: 4,
        transactionId: 'TXN001234570',
        bookingId: 'BK004',
        customerId: 104,
        customerName: 'Emily Davis',
        driverId: 203,
        driverName: 'Amit Singh',
        amount: 4200.00,
        paymentMethod: 'upi',
        status: 'refunded',
        transactionDate: new Date('2024-01-13T14:10:00'),
        description: 'Cancelled trip Delhi to Jaipur',
        commissionAmount: 420.00,
        driverEarnings: 3360.00,
        companyEarnings: 420.00,
        paymentGateway: 'Razorpay',
        gatewayTransactionId: 'razorpay_GHI789',
        refundAmount: 4200.00,
        refundDate: new Date('2024-01-13T16:30:00'),
        refundReason: 'Trip cancelled by customer'
      },
      {
        id: 5,
        transactionId: 'TXN001234571',
        bookingId: 'BK005',
        customerId: 105,
        customerName: 'Robert Brown',
        amount: 2800.00,
        paymentMethod: 'wallet',
        status: 'failed',
        transactionDate: new Date('2024-01-12T11:00:00'),
        description: 'Payment failed for Chennai to Coimbatore trip',
        commissionAmount: 280.00,
        driverEarnings: 2240.00,
        companyEarnings: 280.00
      },
      {
        id: 6,
        transactionId: 'TXN001234572',
        bookingId: 'BK006',
        customerId: 106,
        customerName: 'Lisa Anderson',
        driverId: 204,
        driverName: 'Vikash Sharma',
        amount: 5500.00,
        paymentMethod: 'bank-transfer',
        status: 'disputed',
        transactionDate: new Date('2024-01-11T08:30:00'),
        description: 'Disputed charge for Kolkata to Bhubaneswar',
        commissionAmount: 550.00,
        driverEarnings: 4400.00,
        companyEarnings: 550.00
      }
    ];

    this.dataSource.data = mockPayments;
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
  exportPayments(): void {
    console.log('Exporting payments data...');
    // Implement export functionality (CSV, PDF, etc.)
  }

  /**
   * Process refund
   */
  processRefund(payment: Payment): void {
    console.log('Processing refund for payment:', payment);
    // Open refund processing dialog
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
    // Implement retry payment logic
  }

  /**
   * Resolve dispute
   */
  resolveDispute(payment: Payment): void {
    console.log('Resolving dispute for payment:', payment);
    // Open dispute resolution dialog
  }

  /**
   * Send payment reminder
   */
  sendPaymentReminder(payment: Payment): void {
    console.log('Sending payment reminder:', payment);
    // Implement payment reminder functionality
  }

  /**
   * View transaction receipt
   */
  viewReceipt(payment: Payment): void {
    console.log('Viewing receipt for payment:', payment);
    // Open receipt in new window or modal
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