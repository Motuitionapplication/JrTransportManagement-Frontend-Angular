import { Component, OnInit } from '@angular/core';

// Wallet Interfaces
interface WalletBalance {
  currentBalance: number;
  pendingAmount: number;
  totalEarnings: number;
  totalSpent: number;
  currency: string;
}

interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'refund' | 'cashback' | 'topup';
  amount: number;
  description: string;
  category: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  referenceNumber: string;
  paymentMethod?: string;
  relatedBooking?: string;
  balanceAfter: number;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'bank' | 'wallet';
  name: string;
  identifier: string; // Card last 4 digits, UPI ID, etc.
  isDefault: boolean;
  isActive: boolean;
  provider?: string;
  expiryDate?: Date;
  addedDate: Date;
}

interface WalletFilter {
  searchTerm: string;
  type: string;
  status: string;
  dateRange: string;
  category: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface WalletStats {
  thisMonth: {
    earned: number;
    spent: number;
    transactions: number;
  };
  lastMonth: {
    earned: number;
    spent: number;
    transactions: number;
  };
  averageTransaction: number;
  largestTransaction: number;
  mostUsedPaymentMethod: string;
}

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  // Component Properties
  walletBalance: WalletBalance = {
    currentBalance: 0,
    pendingAmount: 0,
    totalEarnings: 0,
    totalSpent: 0,
    currency: 'INR'
  };
  
  transactions: WalletTransaction[] = [];
  filteredTransactions: WalletTransaction[] = [];
  paymentMethods: PaymentMethod[] = [];
  walletStats: WalletStats = {
    thisMonth: { earned: 0, spent: 0, transactions: 0 },
    lastMonth: { earned: 0, spent: 0, transactions: 0 },
    averageTransaction: 0,
    largestTransaction: 0,
    mostUsedPaymentMethod: ''
  };
  
  // UI State
  isLoading = true;
  showTopupModal = false;
  showAddPaymentModal = false;
  showTransactionModal = false;
  selectedTransaction: WalletTransaction | null = null;
  
  // Top-up Properties
  topupAmount = 0;
  selectedPaymentMethod: PaymentMethod | null = null;
  topupAmounts = [500, 1000, 2000, 5000, 10000];
  
  // Filters
  filter: WalletFilter = {
    searchTerm: '',
    type: 'all',
    status: 'all',
    dateRange: 'all',
    category: 'all',
    sortBy: 'timestamp',
    sortOrder: 'desc'
  };
  
  // Filter Options
  typeOptions = [
    { value: 'all', label: 'All Transactions' },
    { value: 'credit', label: 'Money In' },
    { value: 'debit', label: 'Money Out' },
    { value: 'topup', label: 'Top-ups' },
    { value: 'refund', label: 'Refunds' },
    { value: 'cashback', label: 'Cashbacks' }
  ];
  
  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];
  
  dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this-week', label: 'This Week' },
    { value: 'last-week', label: 'Last Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-3-months', label: 'Last 3 Months' }
  ];
  
  categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'transport', label: 'Transport' },
    { value: 'topup', label: 'Top-up' },
    { value: 'refund', label: 'Refund' },
    { value: 'cashback', label: 'Cashback' },
    { value: 'fees', label: 'Fees' }
  ];
  
  sortOptions = [
    { value: 'timestamp', label: 'Date' },
    { value: 'amount', label: 'Amount' },
    { value: 'type', label: 'Type' },
    { value: 'status', label: 'Status' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.loadWalletData();
  }

  // Data Loading
  loadWalletData(): void {
    this.isLoading = true;
    
    // Simulate API call with mock data
    setTimeout(() => {
      this.walletBalance = this.getMockWalletBalance();
      this.transactions = this.getMockTransactions();
      this.paymentMethods = this.getMockPaymentMethods();
      this.calculateStats();
      this.applyFilters();
      this.isLoading = false;
    }, 1500);
  }

  private getMockWalletBalance(): WalletBalance {
    return {
      currentBalance: 2850.50,
      pendingAmount: 150.00,
      totalEarnings: 15450.75,
      totalSpent: 12600.25,
      currency: 'INR'
    };
  }

  private getMockTransactions(): WalletTransaction[] {
    const now = new Date();
    return [
      {
        id: 'txn-001',
        type: 'debit',
        amount: -450.00,
        description: 'Transport booking payment',
        category: 'transport',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        status: 'completed',
        referenceNumber: 'TXN001234567890',
        paymentMethod: 'Wallet',
        relatedBooking: 'JR-2024-001',
        balanceAfter: 2850.50
      },
      {
        id: 'txn-002',
        type: 'topup',
        amount: 1000.00,
        description: 'Wallet top-up via UPI',
        category: 'topup',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        status: 'completed',
        referenceNumber: 'TXN001234567891',
        paymentMethod: 'UPI - user@okaxis',
        balanceAfter: 3300.50
      },
      {
        id: 'txn-003',
        type: 'cashback',
        amount: 50.00,
        description: 'Cashback for successful trip',
        category: 'cashback',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        status: 'completed',
        referenceNumber: 'TXN001234567892',
        relatedBooking: 'JR-2024-002',
        balanceAfter: 2300.50
      },
      {
        id: 'txn-004',
        type: 'debit',
        amount: -650.00,
        description: 'Transport booking payment',
        category: 'transport',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: 'completed',
        referenceNumber: 'TXN001234567893',
        paymentMethod: 'Wallet',
        relatedBooking: 'JR-2024-003',
        balanceAfter: 2250.50
      },
      {
        id: 'txn-005',
        type: 'refund',
        amount: 850.00,
        description: 'Refund for cancelled trip',
        category: 'refund',
        timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        status: 'completed',
        referenceNumber: 'TXN001234567894',
        relatedBooking: 'JR-2024-004',
        balanceAfter: 2900.50
      },
      {
        id: 'txn-006',
        type: 'topup',
        amount: 2000.00,
        description: 'Wallet top-up via Credit Card',
        category: 'topup',
        timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        status: 'completed',
        referenceNumber: 'TXN001234567895',
        paymentMethod: 'Card ending 1234',
        balanceAfter: 2050.50
      },
      {
        id: 'txn-007',
        type: 'debit',
        amount: -25.00,
        description: 'Service fee',
        category: 'fees',
        timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        status: 'completed',
        referenceNumber: 'TXN001234567896',
        balanceAfter: 50.50
      },
      {
        id: 'txn-008',
        type: 'debit',
        amount: -520.00,
        description: 'Transport booking payment',
        category: 'transport',
        timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        status: 'completed',
        referenceNumber: 'TXN001234567897',
        paymentMethod: 'Wallet',
        relatedBooking: 'JR-2024-005',
        balanceAfter: 75.50
      },
      {
        id: 'txn-009',
        type: 'topup',
        amount: 500.00,
        description: 'Wallet top-up via Debit Card',
        category: 'topup',
        timestamp: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        status: 'completed',
        referenceNumber: 'TXN001234567898',
        paymentMethod: 'Card ending 5678',
        balanceAfter: 595.50
      },
      {
        id: 'txn-010',
        type: 'cashback',
        amount: 75.00,
        description: 'Welcome bonus cashback',
        category: 'cashback',
        timestamp: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        status: 'completed',
        referenceNumber: 'TXN001234567899',
        balanceAfter: 95.50
      }
    ];
  }

  private getMockPaymentMethods(): PaymentMethod[] {
    const now = new Date();
    return [
      {
        id: 'pm-001',
        type: 'upi',
        name: 'Primary UPI',
        identifier: 'user@okaxis',
        isDefault: true,
        isActive: true,
        provider: 'Google Pay',
        addedDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'pm-002',
        type: 'card',
        name: 'HDFC Credit Card',
        identifier: '**** **** **** 1234',
        isDefault: false,
        isActive: true,
        provider: 'HDFC Bank',
        expiryDate: new Date(2027, 11, 31),
        addedDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'pm-003',
        type: 'card',
        name: 'SBI Debit Card',
        identifier: '**** **** **** 5678',
        isDefault: false,
        isActive: true,
        provider: 'State Bank of India',
        expiryDate: new Date(2026, 8, 31),
        addedDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'pm-004',
        type: 'upi',
        name: 'Secondary UPI',
        identifier: 'user@paytm',
        isDefault: false,
        isActive: false,
        provider: 'Paytm',
        addedDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      }
    ];
  }

  // Statistics Calculation
  calculateStats(): void {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    // This month stats
    const thisMonthTransactions = this.transactions.filter(txn => {
      const txnDate = new Date(txn.timestamp);
      return txnDate.getMonth() === thisMonth && txnDate.getFullYear() === thisYear && txn.status === 'completed';
    });

    // Last month stats
    const lastMonthTransactions = this.transactions.filter(txn => {
      const txnDate = new Date(txn.timestamp);
      return txnDate.getMonth() === lastMonth && txnDate.getFullYear() === lastMonthYear && txn.status === 'completed';
    });

    // Calculate stats
    this.walletStats = {
      thisMonth: {
        earned: thisMonthTransactions.filter(txn => ['credit', 'topup', 'refund', 'cashback'].includes(txn.type)).reduce((sum, txn) => sum + txn.amount, 0),
        spent: Math.abs(thisMonthTransactions.filter(txn => txn.type === 'debit').reduce((sum, txn) => sum + txn.amount, 0)),
        transactions: thisMonthTransactions.length
      },
      lastMonth: {
        earned: lastMonthTransactions.filter(txn => ['credit', 'topup', 'refund', 'cashback'].includes(txn.type)).reduce((sum, txn) => sum + txn.amount, 0),
        spent: Math.abs(lastMonthTransactions.filter(txn => txn.type === 'debit').reduce((sum, txn) => sum + txn.amount, 0)),
        transactions: lastMonthTransactions.length
      },
      averageTransaction: this.calculateAverageTransaction(),
      largestTransaction: this.findLargestTransaction(),
      mostUsedPaymentMethod: this.findMostUsedPaymentMethod()
    };
  }

  private calculateAverageTransaction(): number {
    const completedTransactions = this.transactions.filter(txn => txn.status === 'completed');
    if (completedTransactions.length === 0) return 0;
    
    const total = completedTransactions.reduce((sum, txn) => sum + Math.abs(txn.amount), 0);
    return total / completedTransactions.length;
  }

  private findLargestTransaction(): number {
    const completedTransactions = this.transactions.filter(txn => txn.status === 'completed');
    if (completedTransactions.length === 0) return 0;
    
    return Math.max(...completedTransactions.map(txn => Math.abs(txn.amount)));
  }

  private findMostUsedPaymentMethod(): string {
    const paymentMethodCounts: { [key: string]: number } = {};
    
    this.transactions.filter(txn => txn.paymentMethod).forEach(txn => {
      const method = txn.paymentMethod!;
      paymentMethodCounts[method] = (paymentMethodCounts[method] || 0) + 1;
    });
    
    let mostUsed = '';
    let maxCount = 0;
    
    Object.entries(paymentMethodCounts).forEach(([method, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsed = method;
      }
    });
    
    return mostUsed || 'Wallet';
  }

  // Filtering and Sorting
  applyFilters(): void {
    let filtered = [...this.transactions];

    // Search filter
    if (this.filter.searchTerm) {
      const searchTerm = this.filter.searchTerm.toLowerCase();
      filtered = filtered.filter(txn =>
        txn.description.toLowerCase().includes(searchTerm) ||
        txn.referenceNumber.toLowerCase().includes(searchTerm) ||
        (txn.relatedBooking && txn.relatedBooking.toLowerCase().includes(searchTerm)) ||
        (txn.paymentMethod && txn.paymentMethod.toLowerCase().includes(searchTerm))
      );
    }

    // Type filter
    if (this.filter.type !== 'all') {
      filtered = filtered.filter(txn => txn.type === this.filter.type);
    }

    // Status filter
    if (this.filter.status !== 'all') {
      filtered = filtered.filter(txn => txn.status === this.filter.status);
    }

    // Category filter
    if (this.filter.category !== 'all') {
      filtered = filtered.filter(txn => txn.category === this.filter.category);
    }

    // Date range filter
    if (this.filter.dateRange !== 'all') {
      filtered = filtered.filter(txn => this.isInDateRange(txn.timestamp, this.filter.dateRange));
    }

    // Sort results
    filtered = this.sortTransactions(filtered);

    this.filteredTransactions = filtered;
  }

  private isInDateRange(date: Date, range: string): boolean {
    const now = new Date();
    const txnDate = new Date(date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
      case 'today':
        return txnDate >= today;
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return txnDate >= yesterday && txnDate < today;
      case 'this-week':
        const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
        return txnDate >= weekStart;
      case 'last-week':
        const lastWeekStart = new Date(today.getTime() - (today.getDay() + 7) * 24 * 60 * 60 * 1000);
        const lastWeekEnd = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
        return txnDate >= lastWeekStart && txnDate < lastWeekEnd;
      case 'this-month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return txnDate >= monthStart;
      case 'last-month':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        return txnDate >= lastMonthStart && txnDate < lastMonthEnd;
      case 'last-3-months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return txnDate >= threeMonthsAgo;
      default:
        return true;
    }
  }

  private sortTransactions(transactions: WalletTransaction[]): WalletTransaction[] {
    return transactions.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.filter.sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'amount':
          aValue = Math.abs(a.amount);
          bValue = Math.abs(b.amount);
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (this.filter.sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  clearFilters(): void {
    this.filter = {
      searchTerm: '',
      type: 'all',
      status: 'all',
      dateRange: 'all',
      category: 'all',
      sortBy: 'timestamp',
      sortOrder: 'desc'
    };
    this.applyFilters();
  }

  // Modal Management
  openTopupModal(): void {
    this.showTopupModal = true;
    this.topupAmount = 0;
    this.selectedPaymentMethod = this.paymentMethods.find(pm => pm.isDefault) || null;
  }

  closeTopupModal(): void {
    this.showTopupModal = false;
    this.topupAmount = 0;
    this.selectedPaymentMethod = null;
  }

  openAddPaymentModal(): void {
    this.showAddPaymentModal = true;
  }

  closeAddPaymentModal(): void {
    this.showAddPaymentModal = false;
  }

  openTransactionDetails(transaction: WalletTransaction): void {
    this.selectedTransaction = transaction;
    this.showTransactionModal = true;
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
    this.selectedTransaction = null;
  }

  // Helper Functions
  getTransactionTypeClass(type: string): string {
    return `transaction-${type}`;
  }

  getTransactionTypeIcon(type: string): string {
    switch (type) {
      case 'credit': return 'fas fa-plus-circle';
      case 'debit': return 'fas fa-minus-circle';
      case 'topup': return 'fas fa-arrow-up';
      case 'refund': return 'fas fa-undo';
      case 'cashback': return 'fas fa-gift';
      default: return 'fas fa-exchange-alt';
    }
  }

  getTransactionTypeText(type: string): string {
    switch (type) {
      case 'credit': return 'Money In';
      case 'debit': return 'Money Out';
      case 'topup': return 'Top-up';
      case 'refund': return 'Refund';
      case 'cashback': return 'Cashback';
      default: return 'Transaction';
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'fas fa-check-circle';
      case 'pending': return 'fas fa-clock';
      case 'failed': return 'fas fa-times-circle';
      default: return 'fas fa-question-circle';
    }
  }

  getPaymentMethodIcon(type: string): string {
    switch (type) {
      case 'card': return 'fas fa-credit-card';
      case 'upi': return 'fas fa-mobile-alt';
      case 'bank': return 'fas fa-university';
      case 'wallet': return 'fas fa-wallet';
      default: return 'fas fa-money-bill';
    }
  }

  formatCurrency(amount: number): string {
    const absAmount = Math.abs(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(absAmount);
  }

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return this.formatDate(date);
  }

  // Action Methods
  selectTopupAmount(amount: number): void {
    this.topupAmount = amount;
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
  }

  processTopup(): void {
    if (this.topupAmount <= 0 || !this.selectedPaymentMethod) {
      return;
    }

    // Simulate topup processing
    console.log('Processing topup:', {
      amount: this.topupAmount,
      paymentMethod: this.selectedPaymentMethod
    });

    // Close modal and refresh data
    this.closeTopupModal();
    
    // Show success message or redirect
    // This would normally be handled by a service and show actual results
  }

  setDefaultPaymentMethod(method: PaymentMethod): void {
    // Update default payment method
    this.paymentMethods.forEach(pm => pm.isDefault = false);
    method.isDefault = true;
    console.log('Set default payment method:', method);
  }

  togglePaymentMethod(method: PaymentMethod): void {
    method.isActive = !method.isActive;
    console.log('Toggle payment method:', method);
  }

  removePaymentMethod(method: PaymentMethod): void {
    const index = this.paymentMethods.findIndex(pm => pm.id === method.id);
    if (index > -1) {
      this.paymentMethods.splice(index, 1);
      console.log('Removed payment method:', method);
    }
  }

  downloadTransactionReceipt(transaction: WalletTransaction): void {
    // Generate and download transaction receipt
    console.log('Downloading receipt for transaction:', transaction.id);
  }

  shareTransaction(transaction: WalletTransaction): void {
    // Share transaction details
    if (navigator.share) {
      navigator.share({
        title: 'Transaction Details',
        text: `Transaction ${transaction.referenceNumber}: ${this.formatCurrency(transaction.amount)}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      const text = `Transaction ${transaction.referenceNumber}: ${this.formatCurrency(transaction.amount)} - ${transaction.description}`;
      navigator.clipboard.writeText(text);
    }
  }

  reportTransactionIssue(transaction: WalletTransaction): void {
    // Report transaction issue
    console.log('Reporting issue for transaction:', transaction.id);
  }

  refreshWallet(): void {
    this.loadWalletData();
  }

  getActivePaymentMethods(): PaymentMethod[] {
    return this.paymentMethods.filter(pm => pm.isActive);
  }

  toggleSortOrder(): void {
    this.filter.sortOrder = this.filter.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  openTransactionDetailsWithStopPropagation(transaction: WalletTransaction, event: Event): void {
    event.stopPropagation();
    this.openTransactionDetails(transaction);
  }
}