import { Component, OnInit } from '@angular/core';

export interface PaymentRecord {
  id: string;
  transactionId: string;
  bookingId: string;
  bookingNumber: string;
  amount: number;
  paymentMethod: 'credit-card' | 'debit-card' | 'wallet' | 'bank-transfer' | 'cash';
  method: 'credit-card' | 'debit-card' | 'wallet' | 'bank-transfer' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentDate: Date;
  description: string;
  receiptUrl?: string;
  refundAmount?: number;
  refundDate?: Date;
  refundReason?: string;
}

export interface PaymentSummary {
  totalSpent: number;
  totalTransactions: number;
  pendingAmount: number;
  refundedAmount: number;
  thisMonth: number;
  lastMonth: number;
}

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {
  // Data
  payments: PaymentRecord[] = [];
  filteredPayments: PaymentRecord[] = [];
  paymentSummary: PaymentSummary | null = null;
  
  // Modal state
  selectedPayment: PaymentRecord | null = null;
  showPaymentModal: boolean = false;
  
  // Filters and search
  searchQuery: string = '';
  statusFilter: string = 'all';
  methodFilter: string = 'all';
  dateFilter: string = 'all';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.loadPaymentHistory();
    this.loadPaymentSummary();
  }

  // Load payment history
  loadPaymentHistory(): void {
    // Mock data - replace with actual API call
    this.payments = [
      {
        id: 'PAY-001',
        transactionId: 'TXN-20240120-001',
        bookingId: 'BK-001',
        bookingNumber: 'JRT-2024-001',
        amount: 145.00,
        paymentMethod: 'credit-card',
        method: 'credit-card',
        status: 'completed',
        paymentDate: new Date('2024-01-20T11:45:00'),
        description: 'Transport service - Main Street to Industrial Area',
        receiptUrl: '/receipts/PAY-001.pdf'
      },
      {
        id: 'PAY-002',
        transactionId: 'TXN-20240118-002',
        bookingId: 'BK-002',
        bookingNumber: 'JRT-2024-002',
        amount: 85.00,
        paymentMethod: 'wallet',
        method: 'wallet',
        status: 'pending',
        paymentDate: new Date('2024-01-18T09:30:00'),
        description: 'Transport service - Residential to Shopping Mall'
      },
      {
        id: 'PAY-003',
        transactionId: 'TXN-20240115-003',
        bookingId: 'BK-003',
        bookingNumber: 'JRT-2024-003',
        amount: 200.00,
        paymentMethod: 'bank-transfer',
        method: 'bank-transfer',
        status: 'refunded',
        paymentDate: new Date('2024-01-15T14:20:00'),
        description: 'Transport service - Office to Warehouse (Cancelled)',
        refundAmount: 200.00,
        refundDate: new Date('2024-01-16T10:15:00'),
        refundReason: 'Service cancelled by customer'
      },
      {
        id: 'PAY-004',
        transactionId: 'TXN-20240112-004',
        bookingId: 'BK-004',
        bookingNumber: 'JRT-2024-004',
        amount: 120.00,
        paymentMethod: 'debit-card',
        method: 'debit-card',
        status: 'failed',
        paymentDate: new Date('2024-01-12T16:10:00'),
        description: 'Transport service - Downtown to Suburbs'
      },
      {
        id: 'PAY-005',
        transactionId: 'TXN-20240110-005',
        bookingId: 'BK-005',
        bookingNumber: 'JRT-2024-005',
        amount: 75.00,
        paymentMethod: 'credit-card',
        method: 'credit-card',
        status: 'completed',
        paymentDate: new Date('2024-01-10T13:25:00'),
        description: 'Transport service - Airport to Hotel',
        receiptUrl: '/receipts/PAY-005.pdf'
      }
    ];
    this.filterPayments();
  }

  // Load payment summary
  loadPaymentSummary(): void {
    const completedPayments = this.payments.filter(p => p.status === 'completed');
    const pendingPayments = this.payments.filter(p => p.status === 'pending');
    const refundedPayments = this.payments.filter(p => p.status === 'refunded');
    
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    this.paymentSummary = {
      totalSpent: completedPayments.reduce((sum, p) => sum + p.amount, 0),
      totalTransactions: this.payments.length,
      pendingAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
      refundedAmount: refundedPayments.reduce((sum, p) => sum + (p.refundAmount || 0), 0),
      thisMonth: completedPayments
        .filter(p => p.paymentDate >= thisMonth)
        .reduce((sum, p) => sum + p.amount, 0),
      lastMonth: completedPayments
        .filter(p => p.paymentDate >= lastMonth && p.paymentDate < thisMonth)
        .reduce((sum, p) => sum + p.amount, 0)
    };
  }

  // Filter payments
  filterPayments(): void {
    let filtered = this.payments.filter(payment => {
      const matchesSearch = !this.searchQuery ||
        payment.transactionId.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        payment.bookingNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        payment.description.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesStatus = this.statusFilter === 'all' || payment.status === this.statusFilter;
      const matchesMethod = this.methodFilter === 'all' || payment.paymentMethod === this.methodFilter;
      const matchesDate = this.dateFilter === 'all' || this.checkDateFilter(payment.paymentDate);

      return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredPayments = filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Check date filter
  private checkDateFilter(paymentDate: Date): boolean {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - paymentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (this.dateFilter) {
      case 'today':
        return diffDays <= 1;
      case 'week':
        return diffDays <= 7;
      case 'month':
        return diffDays <= 30;
      case '3months':
        return diffDays <= 90;
      default:
        return true;
    }
  }

  // Payment operations
  viewPaymentDetails(payment: PaymentRecord): void {
    this.selectedPayment = payment;
    this.showPaymentModal = true;
  }

  downloadReceipt(payment: PaymentRecord): void {
    if (payment.receiptUrl && payment.status === 'completed') {
      console.log('Downloading receipt:', payment.receiptUrl);
      // Implementation for receipt download
      // window.open(payment.receiptUrl, '_blank');
    }
  }

  retryPayment(payment: PaymentRecord): void {
    if (payment.status === 'failed') {
      console.log('Retrying payment for:', payment.transactionId);
      // Implementation for payment retry
    }
  }

  requestRefund(payment: PaymentRecord): void {
    if (payment.status === 'completed' && !payment.refundAmount) {
      if (confirm(`Request refund for ${this.formatCurrency(payment.amount)}?`)) {
        console.log('Requesting refund for:', payment.transactionId);
        // Implementation for refund request
      }
    }
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.filterPayments();
    }
  }

  getPaginationPages(): number[] {
    const pages = [];
    const maxVisible = 5;
    const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Modal controls
  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedPayment = null;
  }

  // Export functionality
  exportPaymentHistory(): void {
    console.log('Exporting payment history...');
    // Implementation for CSV/PDF export
  }

  // Utility methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      case 'refunded': return 'status-refunded';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getPaymentMethodIcon(method: string): string {
    switch (method) {
      case 'credit-card': return 'fas fa-credit-card';
      case 'debit-card': return 'fas fa-credit-card';
      case 'wallet': return 'fas fa-wallet';
      case 'bank-transfer': return 'fas fa-university';
      case 'cash': return 'fas fa-money-bill-wave';
      default: return 'fas fa-credit-card';
    }
  }

  getPaymentMethodName(method: string): string {
    switch (method) {
      case 'credit-card': return 'Credit Card';
      case 'debit-card': return 'Debit Card';
      case 'wallet': return 'Digital Wallet';
      case 'bank-transfer': return 'Bank Transfer';
      case 'cash': return 'Cash';
      default: return method;
    }
  }

  canDownloadReceipt(payment: PaymentRecord): boolean {
    return payment.status === 'completed' && !!payment.receiptUrl;
  }

  canRetryPayment(payment: PaymentRecord): boolean {
    return payment.status === 'failed';
  }

  canRequestRefund(payment: PaymentRecord): boolean {
    return payment.status === 'completed' && !payment.refundAmount;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }
}