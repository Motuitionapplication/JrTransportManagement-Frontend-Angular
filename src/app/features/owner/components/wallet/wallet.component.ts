import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {

  walletBalance = 125680;
  pendingPayouts = 18540;
  todaysEarnings = 3250;
  
  activeTab = 'transactions';

  transactions = [
    {
      id: 'TXN001',
      type: 'credit',
      amount: 2500,
      description: 'Booking Payment - BK001',
      customerName: 'John Smith',
      date: new Date('2024-09-28T14:30:00'),
      status: 'completed',
      paymentMethod: 'UPI',
      bookingId: 'BK001'
    },
    {
      id: 'TXN002',
      type: 'debit',
      amount: 500,
      description: 'Platform Commission - BK001',
      customerName: null,
      date: new Date('2024-09-28T14:35:00'),
      status: 'completed',
      paymentMethod: 'auto-deduct',
      bookingId: 'BK001'
    },
    {
      id: 'TXN003',
      type: 'credit',
      amount: 1200,
      description: 'Booking Payment - BK002',
      customerName: 'Maria Garcia',
      date: new Date('2024-09-27T16:20:00'),
      status: 'pending',
      paymentMethod: 'Card',
      bookingId: 'BK002'
    },
    {
      id: 'TXN004',
      type: 'debit',
      amount: 15000,
      description: 'Bank Transfer to Account ****1234',
      customerName: null,
      date: new Date('2024-09-26T10:15:00'),
      status: 'completed',
      paymentMethod: 'bank-transfer',
      bookingId: null
    },
    {
      id: 'TXN005',
      type: 'credit',
      amount: 1800,
      description: 'Booking Payment - BK004',
      customerName: 'Sarah Johnson',
      date: new Date('2024-09-25T18:45:00'),
      status: 'completed',
      paymentMethod: 'Cash',
      bookingId: 'BK004'
    }
  ];

  payoutRequests = [
    {
      id: 'PR001',
      amount: 25000,
      requestDate: new Date('2024-09-28T09:00:00'),
      status: 'pending',
      bankAccount: 'SBI ****1234',
      expectedDate: new Date('2024-09-30'),
      processingFee: 50
    },
    {
      id: 'PR002',
      amount: 15000,
      requestDate: new Date('2024-09-25T11:30:00'),
      status: 'completed',
      bankAccount: 'HDFC ****5678',
      completedDate: new Date('2024-09-26T14:20:00'),
      processingFee: 30
    },
    {
      id: 'PR003',
      amount: 30000,
      requestDate: new Date('2024-09-20T16:45:00'),
      status: 'failed',
      bankAccount: 'ICICI ****9012',
      failureReason: 'Insufficient balance',
      processingFee: 60
    }
  ];

  bankAccounts = [
    {
      id: 'BA001',
      bankName: 'State Bank of India',
      accountNumber: '****1234',
      holderName: 'Transport Owner',
      ifscCode: 'SBIN0001234',
      isPrimary: true,
      isVerified: true
    },
    {
      id: 'BA002',
      bankName: 'HDFC Bank',
      accountNumber: '****5678',
      holderName: 'Transport Owner',
      ifscCode: 'HDFC0001234',
      isPrimary: false,
      isVerified: true
    }
  ];

  constructor() { }

  ngOnInit(): void {
    console.log('Wallet component initialized');
  }

  get recentTransactions() {
    return this.transactions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);
  }

  get monthlyStats() {
    const currentMonth = new Date().getMonth();
    const monthlyTransactions = this.transactions.filter(t => 
      t.date.getMonth() === currentMonth && t.status === 'completed'
    );
    
    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      transactionCount: monthlyTransactions.length
    };
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  requestPayout(): void {
    if (this.walletBalance < 1000) {
      alert('Minimum payout amount is ₹1000');
      return;
    }
    console.log('Requesting payout');
  }

  viewTransactionDetails(transactionId: string): void {
    console.log('Viewing transaction details:', transactionId);
  }

  downloadStatement(): void {
    console.log('Downloading wallet statement');
  }

  addBankAccount(): void {
    console.log('Adding new bank account');
  }

  verifyAccount(accountId: string): void {
    console.log('Verifying bank account:', accountId);
  }

  setPrimaryAccount(accountId: string): void {
    this.bankAccounts.forEach(account => {
      account.isPrimary = account.id === accountId;
    });
    console.log('Primary account set:', accountId);
  }

  getTransactionIcon(type: string): string {
    return type === 'credit' ? 'fa-arrow-down' : 'fa-arrow-up';
  }

  getTransactionColor(type: string): string {
    return type === 'credit' ? '#10b981' : '#ef4444';
  }

  getStatusColor(status: string): string {
    const colors = {
      'completed': '#10b981',
      'pending': '#f59e0b',
      'failed': '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getTodayTripsCount(): number {
    const today = new Date();
    return this.transactions.filter(t => 
      t.type === 'credit' && 
      t.date.toDateString() === today.toDateString()
    ).length;
  }

}