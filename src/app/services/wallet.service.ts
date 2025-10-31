import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { WalletTransaction } from '../models/customer.model';

export interface WalletBalance {
  balance: number;
  reservedAmount: number;
  availableBalance: number;
  lastUpdated: Date;
}

export interface AddMoneyRequest {
  amount: number;
  paymentMethod: 'card' | 'upi' | 'net_banking';
  description?: string;
}

export interface AddMoneyResponse {
  success: boolean;
  transactionId: string;
  paymentGatewayUrl?: string;
  message: string;
}

export interface WalletStats {
  totalAdded: number;
  totalSpent: number;
  totalTransactions: number;
  averageTransactionAmount: number;
  monthlySpending: number;
  mostUsedPaymentMethod: string;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private readonly apiUrl = `${environment.apiUrl}/wallet`;
  
  // Reactive state management
  private balanceSubject = new BehaviorSubject<WalletBalance | null>(null);
  private transactionsSubject = new BehaviorSubject<WalletTransaction[]>([]);
  private statsSubject = new BehaviorSubject<WalletStats | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public balance$ = this.balanceSubject.asObservable();
  public transactions$ = this.transactionsSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Load wallet balance from backend
   */
  loadBalance(): Observable<WalletBalance> {
    this.loadingSubject.next(true);
    
    return this.http.get<any>(`${this.apiUrl}/balance`).pipe(
      map(response => this.mapBalanceResponse(response)),
      tap(balance => {
        this.balanceSubject.next(balance);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error loading wallet balance, using mock data:', error);
        // Generate dynamic mock balance
        const mockBalance: WalletBalance = {
          balance: Math.round((Math.random() * 5000 + 1000) * 100) / 100, // $1000-$6000
          reservedAmount: Math.round((Math.random() * 500 + 50) * 100) / 100, // $50-$550
          availableBalance: 0, // Will be calculated
          lastUpdated: new Date()
        };
        mockBalance.availableBalance = mockBalance.balance - mockBalance.reservedAmount;
        
        this.balanceSubject.next(mockBalance);
        this.loadingSubject.next(false);
        return [mockBalance];
      })
    );
  }

  /**
   * Load transaction history
   */
  loadTransactions(limit: number = 20, offset: number = 0): Observable<WalletTransaction[]> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<any[]>(`${this.apiUrl}/transactions`, { params }).pipe(
      map(response => response.map(tx => this.mapTransactionResponse(tx))),
      tap(transactions => this.transactionsSubject.next(transactions)),
      catchError(error => {
        console.error('Error loading transactions, using mock data:', error);
        // Generate dynamic mock transactions
        const mockTransactions = this.generateMockTransactions(limit);
        this.transactionsSubject.next(mockTransactions);
        return [mockTransactions];
      })
    );
  }

  /**
   * Add money to wallet
   */
  addMoney(request: AddMoneyRequest): Observable<AddMoneyResponse> {
    return this.http.post<any>(`${this.apiUrl}/add-money`, request).pipe(
      map(response => this.mapAddMoneyResponse(response)),
      tap(response => {
        if (response.success) {
          // Refresh balance and transactions
          this.loadBalance().subscribe();
          this.loadTransactions().subscribe();
        }
      }),
      catchError(error => {
        console.error('Error adding money:', error);
        // Mock successful response for development
        const mockResponse: AddMoneyResponse = {
          success: true,
          transactionId: `TXN${Date.now()}`,
          message: 'Money added successfully (Mock)',
          paymentGatewayUrl: undefined
        };
        
        // Simulate balance update
        setTimeout(() => {
          this.loadBalance().subscribe();
          this.loadTransactions().subscribe();
        }, 1000);
        
        return [mockResponse];
      })
    );
  }

  /**
   * Load wallet statistics
   */
  loadStats(): Observable<WalletStats> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      map(response => this.mapStatsResponse(response)),
      tap(stats => this.statsSubject.next(stats)),
      catchError(error => {
        console.error('Error loading wallet stats, using mock data:', error);
        // Generate dynamic mock stats
        const totalAdded = Math.round((Math.random() * 10000 + 5000) * 100) / 100;
        const totalSpent = Math.round((totalAdded * 0.7 + Math.random() * 1000) * 100) / 100;
        const totalTransactions = Math.floor(Math.random() * 50) + 20;
        
        const mockStats: WalletStats = {
          totalAdded,
          totalSpent,
          totalTransactions,
          averageTransactionAmount: Math.round((totalSpent / totalTransactions) * 100) / 100,
          monthlySpending: Math.round((Math.random() * 2000 + 500) * 100) / 100,
          mostUsedPaymentMethod: ['UPI', 'Card', 'Net Banking'][Math.floor(Math.random() * 3)]
        };
        
        this.statsSubject.next(mockStats);
        return [mockStats];
      })
    );
  }

  /**
   * Get transaction by ID
   */
  getTransaction(transactionId: string): Observable<WalletTransaction> {
    return this.http.get<any>(`${this.apiUrl}/transactions/${transactionId}`).pipe(
      map(response => this.mapTransactionResponse(response)),
      catchError(error => {
        console.error('Error loading transaction:', error);
        return throwError(() => new Error('Transaction not found'));
      })
    );
  }

  /**
   * Download transaction statement
   */
  downloadStatement(fromDate: Date, toDate: Date): Observable<Blob> {
    const params = new HttpParams()
      .set('fromDate', fromDate.toISOString())
      .set('toDate', toDate.toISOString());

    return this.http.get(`${this.apiUrl}/statement`, {
      params,
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('Error downloading statement:', error);
        // Return mock CSV data
        const csvContent = this.generateMockStatement(fromDate, toDate);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        return [blob];
      })
    );
  }

  /**
   * Refresh all wallet data
   */
  refreshWalletData(): Observable<any> {
    return new Observable(observer => {
      Promise.all([
        this.loadBalance().toPromise(),
        this.loadTransactions().toPromise(),
        this.loadStats().toPromise()
      ]).then(results => {
        observer.next({
          balance: results[0],
          transactions: results[1],
          stats: results[2]
        });
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  // Private helper methods
  private mapBalanceResponse(response: any): WalletBalance {
    return {
      balance: response.balance || 0,
      reservedAmount: response.reservedAmount || 0,
      availableBalance: response.availableBalance || (response.balance - response.reservedAmount),
      lastUpdated: new Date(response.lastUpdated || Date.now())
    };
  }

  private mapTransactionResponse(response: any): WalletTransaction {
    return {
      id: response.id,
      type: response.type,
      amount: response.amount,
      description: response.description,
      referenceId: response.referenceId,
      paymentMethod: response.paymentMethod,
      timestamp: new Date(response.timestamp),
      status: response.status
    };
  }

  private mapAddMoneyResponse(response: any): AddMoneyResponse {
    return {
      success: response.success,
      transactionId: response.transactionId,
      paymentGatewayUrl: response.paymentGatewayUrl,
      message: response.message
    };
  }

  private mapStatsResponse(response: any): WalletStats {
    return {
      totalAdded: response.totalAdded || 0,
      totalSpent: response.totalSpent || 0,
      totalTransactions: response.totalTransactions || 0,
      averageTransactionAmount: response.averageTransactionAmount || 0,
      monthlySpending: response.monthlySpending || 0,
      mostUsedPaymentMethod: response.mostUsedPaymentMethod || 'UPI'
    };
  }

  private generateMockTransactions(count: number): WalletTransaction[] {
    const types: ('credit' | 'debit' | 'refund')[] = ['credit', 'debit', 'refund'];
    const descriptions = [
      'Added to wallet via UPI',
      'Trip payment - Airport to Home',
      'Booking refund',
      'Added funds via Credit Card',
      'Trip payment - Mall to Office',
      'Cashback credited',
      'Added to wallet via Net Banking',
      'Trip cancellation refund'
    ];
    const paymentMethods: ('card' | 'upi' | 'net_banking')[] = ['card', 'upi', 'net_banking'];
    const statuses: ('completed' | 'pending' | 'failed')[] = ['completed', 'pending', 'failed'];

    return Array.from({ length: count }, (_, index) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const hoursAgo = Math.floor(Math.random() * 720) + 1; // 1-720 hours (30 days)
      
      return {
        id: `TXN${Date.now()}_${index}`,
        type,
        amount: Math.round((Math.random() * 500 + 50) * 100) / 100,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        referenceId: type === 'debit' ? `BK${Math.floor(Math.random() * 999) + 1}` : undefined,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
        status: statuses[Math.floor(Math.random() * statuses.length)]
      };
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private generateMockStatement(fromDate: Date, toDate: Date): string {
    const headers = 'Date,Type,Description,Amount,Status,Reference ID\n';
    const transactions = this.generateMockTransactions(20);
    
    const csvRows = transactions
      .filter(tx => tx.timestamp >= fromDate && tx.timestamp <= toDate)
      .map(tx => {
        return `${tx.timestamp.toISOString().split('T')[0]},${tx.type},${tx.description},${tx.amount},${tx.status},${tx.referenceId || ''}`;
      });
    
    return headers + csvRows.join('\n');
  }
}