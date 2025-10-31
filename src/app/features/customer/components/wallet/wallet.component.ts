import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { WalletService, WalletBalance, WalletStats, AddMoneyRequest } from '../../../../services/wallet.service';
import { WalletTransaction } from '../../../../models/customer.model';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit, OnDestroy {
  // Data properties
  balance: WalletBalance | null = null;
  transactions: WalletTransaction[] = [];
  stats: WalletStats | null = null;
  
  // UI state
  isLoading: boolean = false;
  isRefreshing: boolean = false;
  showAddMoneyModal: boolean = false;
  selectedTransaction: WalletTransaction | null = null;
  
  // Add money form
  addMoneyForm = {
    amount: 0,
    paymentMethod: 'upi' as 'card' | 'upi' | 'net_banking',
    description: ''
  };

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private walletService: WalletService
  ) { }

  ngOnInit(): void {
    this.loadWalletData();
    this.subscribeToWalletUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Subscribe to wallet data streams
   */
  private subscribeToWalletUpdates(): void {
    // Subscribe to loading state
    this.walletService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);

    // Subscribe to balance updates
    this.walletService.balance$
      .pipe(takeUntil(this.destroy$))
      .subscribe(balance => this.balance = balance);

    // Subscribe to transaction updates
    this.walletService.transactions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(transactions => this.transactions = transactions);

    // Subscribe to stats updates
    this.walletService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => this.stats = stats);
  }

  /**
   * Load all wallet data
   */
  loadWalletData(): void {
    this.isLoading = true;
    
    combineLatest([
      this.walletService.loadBalance(),
      this.walletService.loadTransactions(20),
      this.walletService.loadStats()
    ]).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: ([balance, transactions, stats]) => {
        console.log('✅ Wallet data loaded:', { balance, transactions: transactions.length, stats });
      },
      error: (error) => {
        console.error('❌ Error loading wallet data:', error);
      }
    });
  }

  /**
   * Refresh wallet data
   */
  refreshWallet(): void {
    this.isRefreshing = true;
    
    this.walletService.refreshWalletData()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isRefreshing = false)
      )
      .subscribe({
        next: (data) => {
          console.log('✅ Wallet refreshed:', data);
        },
        error: (error) => {
          console.error('❌ Error refreshing wallet:', error);
        }
      });
  }

  /**
   * Show add money modal
   */
  addMoney(): void {
    this.addMoneyForm = {
      amount: 0,
      paymentMethod: 'upi',
      description: ''
    };
    this.showAddMoneyModal = true;
  }

  /**
   * Process add money request
   */
  processAddMoney(): void {
    if (this.addMoneyForm.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (this.addMoneyForm.amount > 50000) {
      alert('Maximum amount per transaction is ₹50,000');
      return;
    }

    const request: AddMoneyRequest = {
      amount: this.addMoneyForm.amount,
      paymentMethod: this.addMoneyForm.paymentMethod,
      description: this.addMoneyForm.description || 'Added to wallet'
    };

    this.walletService.addMoney(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Money added:', response);
          if (response.success) {
            alert(`₹${request.amount} added successfully!`);
            this.showAddMoneyModal = false;
            if (response.paymentGatewayUrl) {
              window.open(response.paymentGatewayUrl, '_blank');
            }
          } else {
            alert('Failed to add money. Please try again.');
          }
        },
        error: (error) => {
          console.error('❌ Error adding money:', error);
          alert('Error processing payment. Please try again.');
        }
      });
  }

  /**
   * View transaction details
   */
  viewTransaction(transaction: WalletTransaction): void {
    this.selectedTransaction = transaction;
    console.log('Viewing transaction:', transaction);
  }

  /**
   * Download wallet statement
   */
  downloadStatement(): void {
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 3); // Last 3 months
    const toDate = new Date();

    this.walletService.downloadStatement(fromDate, toDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `wallet-statement-${toDate.toISOString().split('T')[0]}.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('❌ Error downloading statement:', error);
          alert('Error downloading statement. Please try again.');
        }
      });
  }

  /**
   * Get available balance
   */
  get availableBalance(): number {
    return this.balance ? this.balance.availableBalance : 0;
  }

  /**
   * Get transaction type icon
   */
  getTransactionIcon(transaction: WalletTransaction): string {
    switch (transaction.type) {
      case 'credit':
      case 'refund':
        return 'fa-arrow-down';
      case 'debit':
        return 'fa-arrow-up';
      case 'reserved':
        return 'fa-lock';
      case 'released':
        return 'fa-unlock';
      default:
        return 'fa-exchange-alt';
    }
  }

  /**
   * Get transaction color class
   */
  getTransactionColorClass(transaction: WalletTransaction): string {
    switch (transaction.type) {
      case 'credit':
      case 'refund':
      case 'released':
        return 'text-success';
      case 'debit':
      case 'reserved':
        return 'text-danger';
      default:
        return 'text-muted';
    }
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'failed':
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.showAddMoneyModal = false;
    this.selectedTransaction = null;
  }
}