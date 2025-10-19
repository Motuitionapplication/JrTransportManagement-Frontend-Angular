import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, delay, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: 'booking' | 'payment' | 'technical' | 'account' | 'complaint' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'waiting-response' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  customerId: string;
  assignedAgent?: string;
  relatedBooking?: string;
  tags?: string[];
  messages: SupportMessage[];
  attachments?: FileAttachment[];
  unreadMessages?: number;
  estimatedResponseTime?: string;
  resolution?: string;
  rating?: number;
  feedbackComment?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  content: string;
  isFromUser: boolean;
  timestamp: Date;
  authorName: string;
  authorRole: 'customer' | 'agent' | 'supervisor' | 'system';
  attachments?: FileAttachment[];
  isRead: boolean;
  messageType?: 'message' | 'status_update' | 'internal_note' | 'auto_response';
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isOpen?: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  views: number;
  lastUpdated: Date;
  featured: boolean;
  relatedQuestions?: string[];
}

export interface ContactInfo {
  phone: string;
  email: string;
  emergencyPhone: string;
  phoneHours: string;
  emailResponseTime: string;
  officeHours: OfficeHour[];
  socialMedia: SocialMediaContact[];
  physicalAddress?: Address;
}

export interface OfficeHour {
  day: string;
  hours: string;
  isToday?: boolean;
  isOpen?: boolean;
}

export interface SocialMediaContact {
  platform: string;
  handle: string;
  url: string;
  icon: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserGuide {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  icon: string;
  url: string;
  tags: string[];
  rating: number;
  completions: number;
  lastUpdated: Date;
}

export interface SupportStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResponseTime: string;
  customerSatisfaction: number;
  topCategories: CategoryStat[];
  recentActivity: ActivityItem[];
}

export interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ActivityItem {
  id: string;
  type: 'ticket_created' | 'ticket_updated' | 'message_received' | 'ticket_resolved';
  description: string;
  timestamp: Date;
  ticketId?: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: string;
  priority: string;
  relatedBooking?: string;
  attachments?: File[];
}

export interface SendMessageRequest {
  ticketId: string;
  content: string;
  attachments?: File[];
}

export interface QuickContactRequest {
  subject: string;
  category: string;
  message: string;
  priority: string;
  attachments?: File[];
}

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private readonly apiUrl = `${environment.apiUrl}/support`;
  
  // BehaviorSubjects for reactive state management
  private ticketsSubject = new BehaviorSubject<SupportTicket[]>([]);
  private faqItemsSubject = new BehaviorSubject<FAQItem[]>([]);
  private supportStatsSubject = new BehaviorSubject<SupportStats | null>(null);
  private contactInfoSubject = new BehaviorSubject<ContactInfo | null>(null);
  private userGuidesSubject = new BehaviorSubject<UserGuide[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private liveChatStatusSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public tickets$ = this.ticketsSubject.asObservable();
  public faqItems$ = this.faqItemsSubject.asObservable();
  public supportStats$ = this.supportStatsSubject.asObservable();
  public contactInfo$ = this.contactInfoSubject.asObservable();
  public userGuides$ = this.userGuidesSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public liveChatStatus$ = this.liveChatStatusSubject.asObservable();

  // Cache management
  private lastFetchTime: number = 0;
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private supportCategories = ['booking', 'payment', 'technical', 'account', 'complaint', 'other'];
  private priorityLevels = ['low', 'medium', 'high', 'urgent'];

  constructor(private http: HttpClient) {
    this.initializeService();
  }

  /**
   * Initialize service with default data
   */
  private initializeService(): void {
    this.loadSupportData();
    this.updateLiveChatStatus();
    
    // Simulate live chat status updates
    setInterval(() => {
      this.updateLiveChatStatus();
    }, 30000); // Update every 30 seconds
  }

  /**
   * Load all support data
   */
  public loadSupportData(): void {
    this.setLoading(true);
    this.setError(null);

    Promise.all([
      this.loadTickets().toPromise(),
      this.loadFAQItems().toPromise(),
      this.loadContactInfo().toPromise(),
      this.loadUserGuides().toPromise(),
      this.loadSupportStats().toPromise()
    ]).then(() => {
      this.setLoading(false);
    }).catch(error => {
      console.error('Error loading support data:', error);
      this.setError('Failed to load support data. Please try again.');
      this.setLoading(false);
    });
  }

  /**
   * Load support tickets
   */
  public loadTickets(): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(`${this.apiUrl}/tickets`).pipe(
      map(tickets => tickets.map(ticket => ({
        ...ticket,
        createdAt: new Date(ticket.createdAt),
        updatedAt: new Date(ticket.updatedAt),
        messages: ticket.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }))),
      tap(tickets => {
        this.ticketsSubject.next(tickets);
        this.lastFetchTime = Date.now();
      }),
      catchError(error => {
        console.warn('Backend not available, using mock data');
        return this.getMockTickets();
      })
    );
  }

  /**
   * Load FAQ items
   */
  public loadFAQItems(): Observable<FAQItem[]> {
    return this.http.get<FAQItem[]>(`${this.apiUrl}/faq`).pipe(
      map(items => items.map(item => ({
        ...item,
        lastUpdated: new Date(item.lastUpdated)
      }))),
      tap(items => this.faqItemsSubject.next(items)),
      catchError(error => {
        console.warn('Backend not available for FAQ, using mock data');
        return this.getMockFAQItems();
      })
    );
  }

  /**
   * Load contact information
   */
  public loadContactInfo(): Observable<ContactInfo> {
    return this.http.get<ContactInfo>(`${this.apiUrl}/contact`).pipe(
      tap(info => this.contactInfoSubject.next(info)),
      catchError(error => {
        console.warn('Backend not available for contact info, using mock data');
        return this.getMockContactInfo();
      })
    );
  }

  /**
   * Load user guides
   */
  public loadUserGuides(): Observable<UserGuide[]> {
    return this.http.get<UserGuide[]>(`${this.apiUrl}/guides`).pipe(
      map(guides => guides.map(guide => ({
        ...guide,
        lastUpdated: new Date(guide.lastUpdated)
      }))),
      tap(guides => this.userGuidesSubject.next(guides)),
      catchError(error => {
        console.warn('Backend not available for guides, using mock data');
        return this.getMockUserGuides();
      })
    );
  }

  /**
   * Load support statistics
   */
  public loadSupportStats(): Observable<SupportStats> {
    return this.http.get<SupportStats>(`${this.apiUrl}/stats`).pipe(
      map(stats => ({
        ...stats,
        recentActivity: stats.recentActivity.map(activity => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }))
      })),
      tap(stats => this.supportStatsSubject.next(stats)),
      catchError(error => {
        console.warn('Backend not available for stats, using mock data');
        return this.getMockSupportStats();
      })
    );
  }

  /**
   * Create a new support ticket
   */
  public createTicket(request: CreateTicketRequest): Observable<SupportTicket> {
    this.setLoading(true);
    
    const formData = new FormData();
    formData.append('subject', request.subject);
    formData.append('description', request.description);
    formData.append('category', request.category);
    formData.append('priority', request.priority);
    if (request.relatedBooking) {
      formData.append('relatedBooking', request.relatedBooking);
    }
    if (request.attachments) {
      request.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    return this.http.post<SupportTicket>(`${this.apiUrl}/tickets`, formData).pipe(
      map(ticket => ({
        ...ticket,
        createdAt: new Date(ticket.createdAt),
        updatedAt: new Date(ticket.updatedAt),
        messages: ticket.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      })),
      tap(newTicket => {
        const currentTickets = this.ticketsSubject.value;
        this.ticketsSubject.next([newTicket, ...currentTickets]);
        this.setLoading(false);
      }),
      catchError(error => {
        console.warn('Backend not available for ticket creation, using mock response');
        this.setLoading(false);
        return this.createMockTicket(request);
      })
    );
  }

  /**
   * Send a message to a ticket
   */
  public sendMessage(request: SendMessageRequest): Observable<SupportMessage> {
    this.setLoading(true);
    
    const formData = new FormData();
    formData.append('content', request.content);
    if (request.attachments) {
      request.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    return this.http.post<SupportMessage>(`${this.apiUrl}/tickets/${request.ticketId}/messages`, formData).pipe(
      map(message => ({
        ...message,
        timestamp: new Date(message.timestamp)
      })),
      tap(newMessage => {
        const currentTickets = this.ticketsSubject.value;
        const updatedTickets = currentTickets.map(ticket => {
          if (ticket.id === request.ticketId) {
            return {
              ...ticket,
              messages: [...ticket.messages, newMessage],
              updatedAt: new Date()
            };
          }
          return ticket;
        });
        this.ticketsSubject.next(updatedTickets);
        this.setLoading(false);
      }),
      catchError(error => {
        console.warn('Backend not available for message sending, using mock response');
        this.setLoading(false);
        return this.createMockMessage(request);
      })
    );
  }

  /**
   * Send quick contact message
   */
  public sendQuickContact(request: QuickContactRequest): Observable<any> {
    this.setLoading(true);
    
    const formData = new FormData();
    formData.append('subject', request.subject);
    formData.append('category', request.category);
    formData.append('message', request.message);
    formData.append('priority', request.priority);
    if (request.attachments) {
      request.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    return this.http.post(`${this.apiUrl}/contact`, formData).pipe(
      tap(() => this.setLoading(false)),
      catchError(error => {
        console.warn('Backend not available for quick contact, using mock response');
        this.setLoading(false);
        return of({ success: true, message: 'Your message has been sent successfully!' }).pipe(delay(1000));
      })
    );
  }

  /**
   * Update ticket status
   */
  public updateTicketStatus(ticketId: string, status: string): Observable<SupportTicket> {
    return this.http.patch<SupportTicket>(`${this.apiUrl}/tickets/${ticketId}/status`, { status }).pipe(
      map(ticket => ({
        ...ticket,
        createdAt: new Date(ticket.createdAt),
        updatedAt: new Date(ticket.updatedAt),
        messages: ticket.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      })),
      tap(updatedTicket => {
        const currentTickets = this.ticketsSubject.value;
        const updatedTickets = currentTickets.map(ticket => 
          ticket.id === ticketId ? updatedTicket : ticket
        );
        this.ticketsSubject.next(updatedTickets);
      }),
      catchError(error => {
        console.warn('Backend not available for status update, using mock response');
        return this.updateMockTicketStatus(ticketId, status);
      })
    );
  }

  /**
   * Rate FAQ item
   */
  public rateFAQ(faqId: string, helpful: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/faq/${faqId}/rate`, { helpful }).pipe(
      tap(() => {
        const currentFAQs = this.faqItemsSubject.value;
        const updatedFAQs = currentFAQs.map(faq => {
          if (faq.id === faqId) {
            return {
              ...faq,
              helpfulCount: helpful ? faq.helpfulCount + 1 : faq.helpfulCount,
              notHelpfulCount: !helpful ? faq.notHelpfulCount + 1 : faq.notHelpfulCount
            };
          }
          return faq;
        });
        this.faqItemsSubject.next(updatedFAQs);
      }),
      catchError(error => {
        console.warn('Backend not available for FAQ rating, using mock response');
        const currentFAQs = this.faqItemsSubject.value;
        const updatedFAQs = currentFAQs.map(faq => {
          if (faq.id === faqId) {
            return {
              ...faq,
              helpfulCount: helpful ? faq.helpfulCount + 1 : faq.helpfulCount,
              notHelpfulCount: !helpful ? faq.notHelpfulCount + 1 : faq.notHelpfulCount
            };
          }
          return faq;
        });
        this.faqItemsSubject.next(updatedFAQs);
        return of({ success: true });
      })
    );
  }

  /**
   * Search FAQ items
   */
  public searchFAQ(query: string): Observable<FAQItem[]> {
    if (!query.trim()) {
      return this.faqItems$;
    }

    return this.faqItems$.pipe(
      map(faqs => faqs.filter(faq => 
        faq.question.toLowerCase().includes(query.toLowerCase()) ||
        faq.answer.toLowerCase().includes(query.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ))
    );
  }

  /**
   * Get tickets by status
   */
  public getTicketsByStatus(status: string): Observable<SupportTicket[]> {
    return this.tickets$.pipe(
      map(tickets => status === 'all' ? tickets : tickets.filter(ticket => ticket.status === status))
    );
  }

  /**
   * Get FAQ by category
   */
  public getFAQByCategory(category: string): Observable<FAQItem[]> {
    return this.faqItems$.pipe(
      map(faqs => category === 'all' ? faqs : faqs.filter(faq => faq.category === category))
    );
  }

  /**
   * Update live chat status
   */
  private updateLiveChatStatus(): void {
    // Simulate live chat availability (9 AM to 9 PM)
    const now = new Date();
    const hour = now.getHours();
    const isBusinessHours = hour >= 9 && hour < 21;
    const isOnline = isBusinessHours && Math.random() > 0.3; // 70% chance online during business hours
    
    this.liveChatStatusSubject.next(isOnline);
  }

  /**
   * Get live chat status
   */
  public getLiveChatStatus(): boolean {
    return this.liveChatStatusSubject.value;
  }

  /**
   * Export tickets to CSV
   */
  public exportTickets(tickets: SupportTicket[]): void {
    const headers = ['ID', 'Subject', 'Category', 'Priority', 'Status', 'Created', 'Updated', 'Description'];
    const csvContent = [
      headers.join(','),
      ...tickets.map(ticket => [
        ticket.id,
        `"${ticket.subject.replace(/"/g, '""')}"`,
        ticket.category,
        ticket.priority,
        ticket.status,
        ticket.createdAt.toLocaleDateString(),
        ticket.updatedAt.toLocaleDateString(),
        `"${ticket.description.substring(0, 100).replace(/"/g, '""')}..."`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `support-tickets-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Mock Data Generation Methods

  /**
   * Generate mock tickets
   */
  private getMockTickets(): Observable<SupportTicket[]> {
    const mockTickets: SupportTicket[] = [
      {
        id: 'TK-001',
        subject: 'Unable to cancel booking',
        description: 'I am trying to cancel my booking for tomorrow but the cancel button is not working. The booking reference is BK12345. Please help me cancel this booking as I have an emergency.',
        category: 'booking',
        priority: 'high',
        status: 'open',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        customerId: 'CUST001',
        relatedBooking: 'BK12345',
        messages: [
          {
            id: 'MSG001',
            ticketId: 'TK-001',
            content: 'I am trying to cancel my booking for tomorrow but the cancel button is not working. The booking reference is BK12345.',
            isFromUser: true,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            authorName: 'You',
            authorRole: 'customer',
            isRead: true,
            messageType: 'message'
          },
          {
            id: 'MSG002',
            ticketId: 'TK-001',
            content: 'Thank you for contacting us. I understand you\'re having trouble canceling your booking BK12345. Let me check the booking details and assist you with the cancellation.',
            isFromUser: false,
            timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
            authorName: 'Sarah Johnson',
            authorRole: 'agent',
            isRead: true,
            messageType: 'message'
          }
        ],
        unreadMessages: 1,
        estimatedResponseTime: '2-4 hours',
        tags: ['booking', 'cancellation', 'urgent']
      },
      {
        id: 'TK-002',
        subject: 'Payment failed but amount was deducted',
        description: 'I tried to book a ride and the payment failed with an error, but the amount was deducted from my account. Please refund the amount or complete the booking.',
        category: 'payment',
        priority: 'medium',
        status: 'in-progress',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        customerId: 'CUST001',
        assignedAgent: 'Michael Chen',
        messages: [
          {
            id: 'MSG003',
            ticketId: 'TK-002',
            content: 'I tried to book a ride and the payment failed with an error, but the amount was deducted from my account. The transaction ID is TXN789456. Please help.',
            isFromUser: true,
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            authorName: 'You',
            authorRole: 'customer',
            isRead: true,
            messageType: 'message'
          },
          {
            id: 'MSG004',
            ticketId: 'TK-002',
            content: 'I\'ve located your transaction TXN789456. The payment was processed but the booking creation failed due to a system error. I\'m initiating a refund which should reflect in your account within 3-5 business days.',
            isFromUser: false,
            timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
            authorName: 'Michael Chen',
            authorRole: 'agent',
            isRead: true,
            messageType: 'message'
          }
        ],
        estimatedResponseTime: '4-6 hours',
        tags: ['payment', 'refund', 'technical']
      },
      {
        id: 'TK-003',
        subject: 'Account verification issues',
        description: 'I uploaded my documents for account verification 3 days ago but my account is still not verified. Please check and verify my account.',
        category: 'account',
        priority: 'low',
        status: 'resolved',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        customerId: 'CUST001',
        resolution: 'Account has been successfully verified after document review.',
        rating: 5,
        messages: [
          {
            id: 'MSG005',
            ticketId: 'TK-003',
            content: 'I uploaded my documents for account verification 3 days ago but my account is still not verified. Please check and verify my account.',
            isFromUser: true,
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            authorName: 'You',
            authorRole: 'customer',
            isRead: true,
            messageType: 'message'
          },
          {
            id: 'MSG006',
            ticketId: 'TK-003',
            content: 'Your documents have been reviewed and your account has been successfully verified. You can now access all features of your account.',
            isFromUser: false,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            authorName: 'Lisa Rodriguez',
            authorRole: 'agent',
            isRead: true,
            messageType: 'message'
          }
        ],
        tags: ['account', 'verification', 'documents']
      }
    ];

    // Generate additional random tickets
    for (let i = 4; i <= 15; i++) {
      const ticket = this.generateRandomTicket(`TK-${i.toString().padStart(3, '0')}`);
      mockTickets.push(ticket);
    }

    return of(mockTickets).pipe(
      delay(800),
      tap(tickets => this.ticketsSubject.next(tickets))
    );
  }

  /**
   * Generate mock FAQ items
   */
  private getMockFAQItems(): Observable<FAQItem[]> {
    const mockFAQs: FAQItem[] = [
      {
        id: 'FAQ001',
        question: 'How do I book a ride?',
        answer: 'To book a ride, simply open the app, enter your pickup and destination locations, select your preferred vehicle type, and confirm your booking. You can also schedule rides for later.',
        category: 'booking',
        tags: ['booking', 'ride', 'app', 'schedule'],
        helpfulCount: 245,
        notHelpfulCount: 12,
        views: 1250,
        lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        featured: true,
        relatedQuestions: ['FAQ002', 'FAQ003']
      },
      {
        id: 'FAQ002',
        question: 'Can I cancel my booking?',
        answer: 'Yes, you can cancel your booking up to 10 minutes before the scheduled pickup time without any charges. After that, cancellation fees may apply based on our cancellation policy.',
        category: 'booking',
        tags: ['cancel', 'booking', 'charges', 'policy'],
        helpfulCount: 189,
        notHelpfulCount: 23,
        views: 980,
        lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        featured: true,
        relatedQuestions: ['FAQ001', 'FAQ007']
      },
      {
        id: 'FAQ003',
        question: 'What payment methods are accepted?',
        answer: 'We accept credit/debit cards, digital wallets, UPI payments, and cash (in select areas). You can add multiple payment methods to your account for convenience.',
        category: 'payment',
        tags: ['payment', 'credit card', 'wallet', 'upi', 'cash'],
        helpfulCount: 167,
        notHelpfulCount: 8,
        views: 756,
        lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        featured: true,
        relatedQuestions: ['FAQ004', 'FAQ005']
      },
      {
        id: 'FAQ004',
        question: 'How do I add or change my payment method?',
        answer: 'Go to your account settings, select "Payment Methods", and click "Add Payment Method". You can add cards, wallets, or bank accounts. To change the default method, select a payment method and mark it as default.',
        category: 'payment',
        tags: ['payment', 'settings', 'card', 'wallet', 'default'],
        helpfulCount: 134,
        notHelpfulCount: 15,
        views: 612,
        lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        featured: false
      },
      {
        id: 'FAQ005',
        question: 'How do I get a refund?',
        answer: 'Refunds are processed automatically for cancelled rides or failed payments. For other issues, please contact support with your booking/transaction details. Refunds typically take 3-7 business days.',
        category: 'payment',
        tags: ['refund', 'cancel', 'failed payment', 'support'],
        helpfulCount: 201,
        notHelpfulCount: 18,
        views: 890,
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        featured: true
      },
      {
        id: 'FAQ006',
        question: 'How do I verify my account?',
        answer: 'To verify your account, go to Settings > Account Verification and upload a clear photo of your government-issued ID. Verification usually takes 24-48 hours. You\'ll receive a notification once verified.',
        category: 'account',
        tags: ['verification', 'ID', 'account', 'upload', 'notification'],
        helpfulCount: 156,
        notHelpfulCount: 9,
        views: 723,
        lastUpdated: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        featured: false
      },
      {
        id: 'FAQ007',
        question: 'What are the cancellation charges?',
        answer: 'Free cancellation up to 10 minutes before pickup. After that: ₹25 for rides under ₹200, ₹50 for rides ₹200-500, and ₹75 for rides above ₹500. No charges for driver-initiated cancellations.',
        category: 'booking',
        tags: ['cancellation', 'charges', 'fees', 'policy', 'driver'],
        helpfulCount: 98,
        notHelpfulCount: 32,
        views: 445,
        lastUpdated: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        featured: false
      },
      {
        id: 'FAQ008',
        question: 'App is not working properly',
        answer: 'Try these steps: 1) Close and restart the app, 2) Check your internet connection, 3) Update to the latest app version, 4) Clear app cache, 5) Restart your device. If issues persist, contact support.',
        category: 'technical',
        tags: ['app', 'technical', 'troubleshooting', 'update', 'cache'],
        helpfulCount: 178,
        notHelpfulCount: 27,
        views: 834,
        lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        featured: true
      }
    ];

    return of(mockFAQs).pipe(
      delay(600),
      tap(faqs => this.faqItemsSubject.next(faqs))
    );
  }

  /**
   * Generate mock contact info
   */
  private getMockContactInfo(): Observable<ContactInfo> {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const mockContactInfo: ContactInfo = {
      phone: '+1 (555) 123-4567',
      email: 'support@jrtransport.com',
      emergencyPhone: '+1 (555) 911-HELP',
      phoneHours: 'Mon-Fri 9 AM - 9 PM, Sat-Sun 10 AM - 6 PM',
      emailResponseTime: '4-6 hours',
      officeHours: [
        { day: 'Monday', hours: '9:00 AM - 9:00 PM', isToday: today === 1, isOpen: today === 1 && this.isCurrentlyOpen(9, 21) },
        { day: 'Tuesday', hours: '9:00 AM - 9:00 PM', isToday: today === 2, isOpen: today === 2 && this.isCurrentlyOpen(9, 21) },
        { day: 'Wednesday', hours: '9:00 AM - 9:00 PM', isToday: today === 3, isOpen: today === 3 && this.isCurrentlyOpen(9, 21) },
        { day: 'Thursday', hours: '9:00 AM - 9:00 PM', isToday: today === 4, isOpen: today === 4 && this.isCurrentlyOpen(9, 21) },
        { day: 'Friday', hours: '9:00 AM - 9:00 PM', isToday: today === 5, isOpen: today === 5 && this.isCurrentlyOpen(9, 21) },
        { day: 'Saturday', hours: '10:00 AM - 6:00 PM', isToday: today === 6, isOpen: today === 6 && this.isCurrentlyOpen(10, 18) },
        { day: 'Sunday', hours: '10:00 AM - 6:00 PM', isToday: today === 0, isOpen: today === 0 && this.isCurrentlyOpen(10, 18) }
      ],
      socialMedia: [
        { platform: 'Facebook', handle: '@JRTransport', url: 'https://facebook.com/jrtransport', icon: 'fab fa-facebook' },
        { platform: 'Twitter', handle: '@JR_Transport', url: 'https://twitter.com/jr_transport', icon: 'fab fa-twitter' },
        { platform: 'Instagram', handle: '@jrtransport', url: 'https://instagram.com/jrtransport', icon: 'fab fa-instagram' },
        { platform: 'LinkedIn', handle: 'JR Transport', url: 'https://linkedin.com/company/jrtransport', icon: 'fab fa-linkedin' }
      ],
      physicalAddress: {
        street: '123 Transport Avenue',
        city: 'Metro City',
        state: 'MC',
        zipCode: '12345',
        country: 'United States'
      }
    };

    return of(mockContactInfo).pipe(
      delay(400),
      tap(info => this.contactInfoSubject.next(info))
    );
  }

  /**
   * Generate mock user guides
   */
  private getMockUserGuides(): Observable<UserGuide[]> {
    const mockGuides: UserGuide[] = [
      {
        id: 'GUIDE001',
        title: 'Getting Started with JR Transport',
        description: 'Learn the basics of booking rides, managing your account, and using key features.',
        category: 'getting-started',
        difficulty: 'beginner',
        duration: '5 minutes',
        icon: 'fas fa-play-circle',
        url: '/guides/getting-started',
        tags: ['basics', 'beginner', 'account', 'booking'],
        rating: 4.8,
        completions: 1250,
        lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'GUIDE002',
        title: 'How to Book Your First Ride',
        description: 'Step-by-step guide to booking your first ride with JR Transport.',
        category: 'booking',
        difficulty: 'beginner',
        duration: '3 minutes',
        icon: 'fas fa-car',
        url: '/guides/first-booking',
        tags: ['booking', 'first-time', 'tutorial'],
        rating: 4.9,
        completions: 2100,
        lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'GUIDE003',
        title: 'Managing Payment Methods',
        description: 'Learn how to add, remove, and manage your payment methods securely.',
        category: 'payment',
        difficulty: 'beginner',
        duration: '4 minutes',
        icon: 'fas fa-credit-card',
        url: '/guides/payment-methods',
        tags: ['payment', 'credit-card', 'wallet', 'security'],
        rating: 4.7,
        completions: 890,
        lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'GUIDE004',
        title: 'Advanced Booking Features',
        description: 'Discover advanced features like scheduling, recurring rides, and group bookings.',
        category: 'booking',
        difficulty: 'intermediate',
        duration: '7 minutes',
        icon: 'fas fa-calendar-alt',
        url: '/guides/advanced-booking',
        tags: ['advanced', 'scheduling', 'recurring', 'group'],
        rating: 4.6,
        completions: 456,
        lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'GUIDE005',
        title: 'Account Security Best Practices',
        description: 'Keep your account secure with two-factor authentication and other security features.',
        category: 'security',
        difficulty: 'intermediate',
        duration: '6 minutes',
        icon: 'fas fa-shield-alt',
        url: '/guides/account-security',
        tags: ['security', '2fa', 'privacy', 'safety'],
        rating: 4.8,
        completions: 723,
        lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'GUIDE006',
        title: 'Troubleshooting Common Issues',
        description: 'Solutions to common problems and how to get help when you need it.',
        category: 'technical',
        difficulty: 'intermediate',
        duration: '8 minutes',
        icon: 'fas fa-wrench',
        url: '/guides/troubleshooting',
        tags: ['troubleshooting', 'problems', 'solutions', 'help'],
        rating: 4.5,
        completions: 334,
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    return of(mockGuides).pipe(
      delay(500),
      tap(guides => this.userGuidesSubject.next(guides))
    );
  }

  /**
   * Generate mock support stats
   */
  private getMockSupportStats(): Observable<SupportStats> {
    const mockStats: SupportStats = {
      totalTickets: 1247,
      openTickets: 23,
      resolvedTickets: 1198,
      averageResponseTime: '2.5 hours',
      customerSatisfaction: 4.7,
      topCategories: [
        { category: 'Booking', count: 456, percentage: 36.6, trend: 'down' },
        { category: 'Payment', count: 312, percentage: 25.0, trend: 'stable' },
        { category: 'Technical', count: 234, percentage: 18.8, trend: 'up' },
        { category: 'Account', count: 156, percentage: 12.5, trend: 'stable' },
        { category: 'Other', count: 89, percentage: 7.1, trend: 'down' }
      ],
      recentActivity: [
        {
          id: 'ACT001',
          type: 'ticket_created',
          description: 'New ticket: Unable to cancel booking',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          ticketId: 'TK-001'
        },
        {
          id: 'ACT002',
          type: 'ticket_resolved',
          description: 'Ticket resolved: Account verification issues',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          ticketId: 'TK-003'
        },
        {
          id: 'ACT003',
          type: 'message_received',
          description: 'New message on payment issue ticket',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          ticketId: 'TK-002'
        }
      ]
    };

    return of(mockStats).pipe(
      delay(700),
      tap(stats => this.supportStatsSubject.next(stats))
    );
  }

  /**
   * Generate random ticket
   */
  private generateRandomTicket(id: string): SupportTicket {
    const subjects = [
      'App crashes when booking',
      'Cannot update profile information',
      'Driver arrived late, need refund',
      'GPS location is incorrect',
      'Payment declined multiple times',
      'Account locked after failed login',
      'Ride history showing wrong data',
      'Promo code not working',
      'Unable to contact driver',
      'Overcharged for ride'
    ];

    const categories = this.supportCategories;
    const priorities = this.priorityLevels;
    const statuses = ['open', 'in-progress', 'waiting-response', 'resolved', 'closed'];

    const category = categories[Math.floor(Math.random() * categories.length)] as any;
    const priority = priorities[Math.floor(Math.random() * priorities.length)] as any;
    const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
    const subject = subjects[Math.floor(Math.random() * subjects.length)];

    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000); // Updated within 5 days

    return {
      id,
      subject,
      description: `Detailed description for ${subject}. This is a customer-reported issue that needs attention from our support team.`,
      category,
      priority,
      status,
      createdAt,
      updatedAt,
      customerId: 'CUST001',
      messages: [
        {
          id: `MSG${id}001`,
          ticketId: id,
          content: `I am experiencing an issue with ${subject.toLowerCase()}. Please help me resolve this.`,
          isFromUser: true,
          timestamp: createdAt,
          authorName: 'You',
          authorRole: 'customer',
          isRead: true,
          messageType: 'message'
        }
      ],
      unreadMessages: status === 'waiting-response' ? Math.floor(Math.random() * 3) : 0,
      estimatedResponseTime: `${Math.floor(Math.random() * 6) + 1}-${Math.floor(Math.random() * 6) + 3} hours`,
      tags: [category, priority]
    };
  }

  /**
   * Create mock ticket
   */
  private createMockTicket(request: CreateTicketRequest): Observable<SupportTicket> {
    const newTicket: SupportTicket = {
      id: `TK-${Date.now().toString().slice(-6)}`,
      subject: request.subject,
      description: request.description,
      category: request.category as any,
      priority: request.priority as any,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      customerId: 'CUST001',
      relatedBooking: request.relatedBooking,
      messages: [
        {
          id: `MSG${Date.now()}`,
          ticketId: `TK-${Date.now().toString().slice(-6)}`,
          content: request.description,
          isFromUser: true,
          timestamp: new Date(),
          authorName: 'You',
          authorRole: 'customer',
          isRead: true,
          messageType: 'message'
        }
      ],
      estimatedResponseTime: '2-4 hours',
      tags: [request.category, request.priority]
    };

    return of(newTicket).pipe(delay(1500));
  }

  /**
   * Create mock message
   */
  private createMockMessage(request: SendMessageRequest): Observable<SupportMessage> {
    const newMessage: SupportMessage = {
      id: `MSG${Date.now()}`,
      ticketId: request.ticketId,
      content: request.content,
      isFromUser: true,
      timestamp: new Date(),
      authorName: 'You',
      authorRole: 'customer',
      isRead: true,
      messageType: 'message'
    };

    return of(newMessage).pipe(delay(1000));
  }

  /**
   * Update mock ticket status
   */
  private updateMockTicketStatus(ticketId: string, status: string): Observable<SupportTicket> {
    const currentTickets = this.ticketsSubject.value;
    const ticket = currentTickets.find(t => t.id === ticketId);
    
    if (ticket) {
      const updatedTicket = {
        ...ticket,
        status: status as any,
        updatedAt: new Date()
      };
      
      const updatedTickets = currentTickets.map(t => t.id === ticketId ? updatedTicket : t);
      this.ticketsSubject.next(updatedTickets);
      
      return of(updatedTicket).pipe(delay(500));
    }
    
    return throwError('Ticket not found');
  }

  /**
   * Check if currently open
   */
  private isCurrentlyOpen(startHour: number, endHour: number): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= startHour && currentHour < endHour;
  }

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Set error state
   */
  private setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  /**
   * Clear cache and refresh data
   */
  public refreshData(): void {
    this.lastFetchTime = 0;
    this.loadSupportData();
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(): boolean {
    return (Date.now() - this.lastFetchTime) < this.cacheTimeout;
  }
}