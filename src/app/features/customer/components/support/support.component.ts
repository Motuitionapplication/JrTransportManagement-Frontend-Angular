import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { 
  SupportService, 
  SupportTicket, 
  SupportMessage, 
  FileAttachment, 
  FAQItem, 
  ContactInfo, 
  UserGuide,
  OfficeHour,
  CreateTicketRequest,
  SendMessageRequest,
  QuickContactRequest,
  SupportStats
} from '../../../../services/support.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Observables
  tickets$!: Observable<SupportTicket[]>;
  faqItems$!: Observable<FAQItem[]>;
  contactInfo$!: Observable<ContactInfo | null>;
  userGuides$!: Observable<UserGuide[]>;
  supportStats$!: Observable<SupportStats | null>;
  loading$!: Observable<boolean>;
  error$!: Observable<string | null>;
  liveChatStatus$!: Observable<boolean>;
  
  // Active tab management
  activeTab: string = 'tickets';
  
  // Support tickets
  supportTickets: SupportTicket[] = [];
  filteredTickets: SupportTicket[] = [];
  selectedTicketFilter: string = 'all';
  selectedTicket: SupportTicket | null = null;
  
  // FAQ
  faqItems: FAQItem[] = [];
  filteredFaqs: FAQItem[] = [];
  faqSearchTerm: string = '';
  selectedFaqCategory: string = 'all';
  faqCategories = [
    { id: 'all', name: 'All', icon: 'fas fa-list', count: 0 },
    { id: 'booking', name: 'Booking', icon: 'fas fa-calendar-check', count: 0 },
    { id: 'payment', name: 'Payment', icon: 'fas fa-credit-card', count: 0 },
    { id: 'technical', name: 'Technical', icon: 'fas fa-cog', count: 0 },
    { id: 'account', name: 'Account', icon: 'fas fa-user', count: 0 }
  ];
  
  // Contact information
  supportInfo: ContactInfo | null = null;
  
  // User guides
  userGuides: UserGuide[] = [];
  
  // Statistics
  supportStats: SupportStats | null = null;
  
  // Forms
  supportTicketForm!: FormGroup;
  messageForm!: FormGroup;
  searchForm!: FormGroup;
  quickContactForm!: FormGroup;
  replyForm!: FormGroup;
  
  // UI state
  showTicketModal: boolean = false;
  liveChatAvailable: boolean = false;
  isSending: boolean = false;
  isCreating: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;
  
  // File handling
  selectedAttachments: File[] = [];
  ticketAttachments: File[] = [];
  replyAttachments: File[] = [];

  constructor(
    private fb: FormBuilder,
    private supportService: SupportService
  ) {
    this.initializeForms();
    this.initializeObservables();
  }

  /**
   * Initialize observables
   */
  private initializeObservables(): void {
    this.tickets$ = this.supportService.tickets$;
    this.faqItems$ = this.supportService.faqItems$;
    this.contactInfo$ = this.supportService.contactInfo$;
    this.userGuides$ = this.supportService.userGuides$;
    this.supportStats$ = this.supportService.supportStats$;
    this.loading$ = this.supportService.loading$;
    this.error$ = this.supportService.error$;
    this.liveChatStatus$ = this.supportService.liveChatStatus$;
  }

  ngOnInit(): void {
    this.loadData();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize all forms
   */
  private initializeForms(): void {
    this.supportTicketForm = this.fb.group({
      subject: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      category: ['', [Validators.required]],
      priority: ['medium', [Validators.required]],
      relatedBooking: ['']
    });

    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1000)]]
    });

    this.searchForm = this.fb.group({
      query: ['']
    });

    this.quickContactForm = this.fb.group({
      subject: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      category: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      priority: ['medium', [Validators.required]]
    });

    this.replyForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1000)]]
    });
  }

  /**
   * Load all data
   */
  private loadData(): void {
    this.supportService.loadSupportData();
  }

  /**
   * Setup reactive subscriptions
   */
  private setupSubscriptions(): void {
    // Subscribe to tickets
    this.tickets$.pipe(takeUntil(this.destroy$)).subscribe(tickets => {
      this.supportTickets = tickets;
      this.filterTickets();
    });

    // Subscribe to FAQ items
    this.faqItems$.pipe(takeUntil(this.destroy$)).subscribe(faqs => {
      this.faqItems = faqs;
      this.updateFAQCategories();
      this.filterFAQs();
    });

    // Subscribe to contact info
    this.contactInfo$.pipe(takeUntil(this.destroy$)).subscribe(info => {
      this.supportInfo = info;
    });

    // Subscribe to user guides
    this.userGuides$.pipe(takeUntil(this.destroy$)).subscribe(guides => {
      this.userGuides = guides;
    });

    // Subscribe to stats
    this.supportStats$.pipe(takeUntil(this.destroy$)).subscribe(stats => {
      this.supportStats = stats;
    });

    // Subscribe to loading state
    this.loading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      this.isLoading = loading;
    });

    // Subscribe to error state
    this.error$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      this.error = error;
    });

    // Subscribe to live chat status
    this.liveChatStatus$.pipe(takeUntil(this.destroy$)).subscribe(status => {
      this.liveChatAvailable = status;
    });
  }

  /**
   * Filter tickets based on selected filter
   */
  filterTickets(): void {
    if (this.selectedTicketFilter === 'all') {
      this.filteredTickets = this.supportTickets;
    } else {
      this.filteredTickets = this.supportTickets.filter(ticket => 
        ticket.status === this.selectedTicketFilter
      );
    }
  }

  /**
   * Update FAQ categories with counts
   */
  private updateFAQCategories(): void {
    this.faqCategories.forEach(category => {
      if (category.id === 'all') {
        category.count = this.faqItems.length;
      } else {
        category.count = this.faqItems.filter(faq => faq.category === category.id).length;
      }
    });
  }

  /**
   * Filter FAQs based on search and category
   */
  filterFAQs(): void {
    let filtered = this.faqItems;

    // Filter by category
    if (this.selectedFaqCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === this.selectedFaqCategory);
    }

    // Filter by search term
    if (this.faqSearchTerm.trim()) {
      const searchTerm = this.faqSearchTerm.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm) ||
        faq.answer.toLowerCase().includes(searchTerm) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    this.filteredFaqs = filtered;
  }

  /**
   * Set active tab
   */
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  /**
   * Get active tickets count
   */
  getActiveTicketsCount(): number {
    return this.supportTickets.filter(ticket => 
      ticket.status === 'open' || ticket.status === 'in-progress'
    ).length;
  }

  /**
   * Create new support ticket
   */
  createSupportTicket(): void {
    this.selectedTicket = null;
    this.supportTicketForm.reset({
      priority: 'medium'
    });
    this.ticketAttachments = [];
    this.showTicketModal = true;
  }

  /**
   * Submit support ticket
   */
  submitSupportTicket(): void {
    if (this.supportTicketForm.valid && !this.isCreating) {
      this.isCreating = true;
      
      const formData = this.supportTicketForm.value;
      const request: CreateTicketRequest = {
        subject: formData.subject,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        relatedBooking: formData.relatedBooking || undefined,
        attachments: this.ticketAttachments.length > 0 ? this.ticketAttachments : undefined
      };

      this.supportService.createTicket(request).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (ticket) => {
          this.isCreating = false;
          this.closeTicketModal();
          this.setActiveTab('tickets');
          // Show success message
        },
        error: (error) => {
          this.isCreating = false;
          console.error('Error creating ticket:', error);
        }
      });
    }
  }

  /**
   * View ticket details
   */
  viewTicketDetails(ticket: SupportTicket): void {
    this.selectedTicket = ticket;
    this.replyForm.reset();
    this.replyAttachments = [];
    this.showTicketModal = true;
  }

  /**
   * Close ticket modal
   */
  closeTicketModal(): void {
    this.showTicketModal = false;
    this.selectedTicket = null;
    this.supportTicketForm.reset();
    this.replyForm.reset();
    this.ticketAttachments = [];
    this.replyAttachments = [];
  }

  /**
   * Send reply to ticket
   */
  sendReply(): void {
    if (this.replyForm.valid && this.selectedTicket && !this.isSending) {
      this.isSending = true;
      
      const request: SendMessageRequest = {
        ticketId: this.selectedTicket.id,
        content: this.replyForm.value.message,
        attachments: this.replyAttachments.length > 0 ? this.replyAttachments as File[] : undefined
      };

      this.supportService.sendMessage(request).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (message) => {
          this.isSending = false;
          this.replyForm.reset();
          this.replyAttachments = [];
          // Message will be automatically added to ticket via service subscription
        },
        error: (error) => {
          this.isSending = false;
          console.error('Error sending message:', error);
        }
      });
    }
  }

  /**
   * Close ticket
   */
  closeTicket(ticketId: string): void {
    this.supportService.updateTicketStatus(ticketId, 'closed').pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.closeTicketModal();
      },
      error: (error) => {
        console.error('Error closing ticket:', error);
      }
    });
  }

  /**
   * Refresh ticket data
   */
  refreshTicket(): void {
    this.supportService.refreshData();
  }

  /**
   * Search FAQ
   */
  searchFAQ(): void {
    this.filterFAQs();
  }

  /**
   * Select FAQ category
   */
  selectFaqCategory(categoryId: string): void {
    this.selectedFaqCategory = categoryId;
    this.filterFAQs();
  }

  /**
   * Toggle FAQ item
   */
  toggleFaq(faqId: string): void {
    this.filteredFaqs = this.filteredFaqs.map(faq => {
      if (faq.id === faqId) {
        return { ...faq, isOpen: !faq.isOpen };
      }
      return faq;
    });
  }

  /**
   * Rate FAQ
   */
  rateFaq(faqId: string, helpful: boolean): void {
    this.supportService.rateFAQ(faqId, helpful).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        // Rating updated successfully
      },
      error: (error) => {
        console.error('Error rating FAQ:', error);
      }
    });
  }

  /**
   * Send quick contact message
   */
  sendQuickMessage(): void {
    if (this.quickContactForm.valid && !this.isSending) {
      this.isSending = true;
      
      const formData = this.quickContactForm.value;
      const request: QuickContactRequest = {
        subject: formData.subject,
        category: formData.category,
        message: formData.message,
        priority: formData.priority,
        attachments: this.selectedAttachments.length > 0 ? this.selectedAttachments : undefined
      };

      this.supportService.sendQuickContact(request).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.isSending = false;
          this.quickContactForm.reset({
            priority: 'medium'
          });
          this.selectedAttachments = [];
          // Show success message
        },
        error: (error) => {
          this.isSending = false;
          console.error('Error sending quick contact:', error);
        }
      });
    }
  }

  /**
   * Open live chat
   */
  openLiveChat(): void {
    if (this.liveChatAvailable) {
      // Open live chat interface
      alert('Live chat feature will be implemented soon!');
    } else {
      alert('Live chat is currently offline. Please try again later or create a support ticket.');
    }
  }

  /**
   * Open user guide
   */
  openGuide(guide: UserGuide): void {
    // Navigate to guide or open in modal
    alert(`Opening guide: ${guide.title}`);
  }

  /**
   * Handle attachment selection for quick contact
   */
  onAttachmentSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.selectedAttachments = files.filter(file => this.validateFile(file));
  }

  /**
   * Handle attachment selection for new ticket
   */
  onTicketAttachmentSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.ticketAttachments = files.filter(file => this.validateFile(file));
  }

  /**
   * Handle attachment selection for reply
   */
  onReplyAttachmentSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.replyAttachments = files.filter(file => this.validateFile(file));
  }

  /**
   * Validate file
   */
  private validateFile(file: File): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (file.size > maxSize) {
      alert(`File ${file.name} is too large. Maximum size is 10MB.`);
      return false;
    }
    
    if (!allowedTypes.includes(file.type)) {
      alert(`File ${file.name} is not a supported format.`);
      return false;
    }
    
    return true;
  }

  /**
   * Remove attachment
   */
  removeAttachment(index: number): void {
    this.selectedAttachments.splice(index, 1);
  }

  /**
   * Remove ticket attachment
   */
  removeTicketAttachment(index: number): void {
    this.ticketAttachments.splice(index, 1);
  }

  /**
   * Remove reply attachment
   */
  removeReplyAttachment(index: number): void {
    this.replyAttachments.splice(index, 1);
  }

  /**
   * Get status CSS class
   */
  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'open': 'bg-primary',
      'in-progress': 'bg-warning',
      'waiting-response': 'bg-info',
      'resolved': 'bg-success',
      'closed': 'bg-secondary'
    };
    return statusClasses[status] || 'bg-secondary';
  }

  /**
   * Get priority CSS class
   */
  getPriorityClass(priority: string): string {
    const priorityClasses: { [key: string]: string } = {
      'low': 'priority-low',
      'medium': 'priority-medium',
      'high': 'priority-high',
      'urgent': 'priority-urgent'
    };
    return priorityClasses[priority] || 'priority-medium';
  }

  /**
   * Get difficulty CSS class for guides
   */
  getDifficultyClass(difficulty: string): string {
    const difficultyClasses: { [key: string]: string } = {
      'beginner': 'difficulty-beginner',
      'intermediate': 'difficulty-intermediate',
      'advanced': 'difficulty-advanced'
    };
    return difficultyClasses[difficulty] || 'difficulty-beginner';
  }

  /**
   * Format date
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get time ago
   */
  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  }

  /**
   * Get field error message
   */
  getFieldError(form: FormGroup, fieldName: string): string | null {
    const field = form.get(fieldName);
    if (field && field.invalid && (field.dirty || field.touched)) {
      const errors = field.errors;
      if (errors) {
        if (errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
        if (errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
        if (errors['maxlength']) return `${this.getFieldLabel(fieldName)} must not exceed ${errors['maxlength'].requiredLength} characters`;
        if (errors['email']) return 'Please enter a valid email address';
      }
    }
    return null;
  }

  /**
   * Get field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'subject': 'Subject',
      'description': 'Description',
      'category': 'Category',
      'priority': 'Priority',
      'message': 'Message',
      'relatedBooking': 'Related Booking'
    };
    return labels[fieldName] || fieldName;
  }
}